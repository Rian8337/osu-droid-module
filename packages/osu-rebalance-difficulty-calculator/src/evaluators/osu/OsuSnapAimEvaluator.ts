import { MathUtils, Slider, Spinner } from "@rian8337/osu-base";
import { OsuDifficultyHitObject } from "../../preprocessing/OsuDifficultyHitObject";

/**
 * An evaluator for calculating osu!standard snap aim difficulty.
 */
export abstract class OsuSnapAimEvaluator {
    private static readonly wideAngleMultiplier = 9.67;
    private static readonly acuteAngleMultiplier = 2.41;
    private static readonly sliderMultiplier = 1.5;
    private static readonly velocityChangeMultiplier = 0.9;

    // Increasing this multiplier beyond 1.02 reduces difficulty as distance increases.
    // Refer to the desmos link above the wiggle bonus calculation.
    private static readonly wiggleMultiplier = 1.02;

    private static readonly angleRepetitionNoteLimit = 6;
    private static readonly maximumRepetitionNerf = 0.15;
    private static readonly maximumVectorInfluence = 0.5;

    /**
     * Evaluates the difficulty of aiming the current object, based on:
     *
     * - cursor velocity to the current object,
     * - angle difficulty,
     * - sharp velocity increases,
     * - and slider difficulty.
     *
     * @param current The current object.
     * @param withSliders Whether to take slider difficulty into account.
     */
    static evaluateDifficultyOf(
        current: OsuDifficultyHitObject,
        withSliders: boolean,
    ): number {
        const last = current.previous(0)!;

        if (
            current.object instanceof Spinner ||
            current.index <= 1 ||
            last.object instanceof Spinner
        ) {
            return 0;
        }

        const currentDistance = withSliders
            ? current.lazyJumpDistance
            : current.jumpDistance;

        const currentVelocity = this.calculateCurrentVelocity(
            current,
            last,
            currentDistance,
            withSliders,
        );

        const prevDistance = withSliders
            ? last.lazyJumpDistance
            : last.jumpDistance;

        const prevVelocity = prevDistance / last.strainTime;

        // Start strain with regular velocity.
        let strain = currentVelocity;

        // Penalize angle repetition.
        strain *= this.calculateVectorAngleRepetition(current, last);

        const acuteAngleBonus = this.calculateAcuteAngleBonus(
            current,
            last,
            currentDistance,
            currentVelocity,
            prevVelocity,
        );

        const wideAngleBonus = this.calculateWideAngleBonus(
            current,
            last,
            currentDistance,
            prevDistance,
            withSliders,
        );

        // Add in acute angle bonus or wide angle bonus, whichever is larger.
        strain += Math.max(acuteAngleBonus, wideAngleBonus);

        strain += this.calculateWiggleBonus(
            current,
            last,
            currentVelocity,
            prevVelocity,
            currentDistance,
            prevDistance,
        );

        strain += this.calculateVelocityChangeBonus(
            withSliders,
            prevVelocity,
            currentVelocity,
            currentDistance,
            current,
            last,
        );

        if (current.object instanceof Slider && withSliders) {
            strain += this.calculateSliderBonus(current);
        }

        // Apply high circle size bonus.
        strain *= current.smallCircleBonus;

        strain *= this.highBpmBonus(current.strainTime);

        return strain;
    }

    private static calculateAcuteAngleBonus(
        current: OsuDifficultyHitObject,
        last: OsuDifficultyHitObject,
        currentDistance: number,
        currentVelocity: number,
        prevVelocity: number,
    ): number {
        if (current.angle === null || last.angle === null) {
            return 0;
        }

        // Only reward acute angles when rhythms are the same.
        if (
            Math.max(current.strainTime, last.strainTime) >=
            1.25 * Math.min(current.strainTime, last.strainTime)
        ) {
            return 0;
        }

        let acuteAngleBonus = this.calculateAcuteAngleAcuteness(current.angle);

        // Penalize angle repetition. It is important to do it _before_ multiplying by anything because we
        // compare raw acuteness here.
        acuteAngleBonus *=
            0.08 +
            0.92 *
                (1 -
                    Math.min(
                        acuteAngleBonus,
                        Math.pow(
                            this.calculateAcuteAngleAcuteness(last.angle),
                            3,
                        ),
                    ));

        const velocity = Math.min(currentVelocity, prevVelocity);

        // Apply acute angle bonus for BPM above 300 1/2 and distance more than one diameter.
        acuteAngleBonus *=
            velocity *
            MathUtils.smootherstep(
                MathUtils.millisecondsToBPM(current.strainTime, 2),
                300,
                400,
            ) *
            MathUtils.smootherstep(
                currentDistance,
                0,
                current.normalizedDiameter * 2,
            );

        return acuteAngleBonus * this.acuteAngleMultiplier;
    }

    private static calculateWideAngleBonus(
        current: OsuDifficultyHitObject,
        last: OsuDifficultyHitObject,
        currentDistance: number,
        prevDistance: number,
        withSliders: boolean,
    ): number {
        if (current.angle === null || last.angle === null) {
            return 0;
        }

        let wideAngleBonus = this.calculateWideAngleAcuteness(current.angle);

        // Penalize angle repetition. It is important to do it _before_ multiplying by velocity because we
        // compare raw wideness here.
        wideAngleBonus *=
            0.25 +
            0.75 *
                (1 -
                    Math.min(
                        wideAngleBonus,
                        Math.pow(
                            this.calculateWideAngleAcuteness(last.angle),
                            3,
                        ),
                    ));

        // Rescale velocity for the wide angle bonus.
        const wideAngleTimeScale = 1.45;

        let currentRescaledVelocity =
            currentDistance / Math.pow(current.strainTime, wideAngleTimeScale);

        const prevRescaledVelocity =
            prevDistance / Math.pow(last.strainTime, wideAngleTimeScale);

        if (last.object instanceof Slider && withSliders) {
            const sliderDistance =
                last.lazyTravelDistance + current.lazyJumpDistance;

            currentRescaledVelocity = Math.max(
                currentRescaledVelocity,
                sliderDistance /
                    Math.pow(current.strainTime, wideAngleTimeScale),
            );
        }

        wideAngleBonus *= Math.min(
            currentRescaledVelocity,
            prevRescaledVelocity,
        );

        const last2 = current.previous(2);

        if (last2 !== null) {
            // If objects just go back and forth through a middle point - don't give as much wide bonus.
            // Use previous(2) and previous(0) because angles calculation is done prevprev-prev-curr, so any
            // object's angle's center point is always the previous object.
            const distance = last2.object.stackedPosition.getDistance(
                last.object.stackedPosition,
            );

            if (distance < 1) {
                wideAngleBonus *= 1 - 0.55 * (1 - distance);
            }
        }

        return wideAngleBonus * this.wideAngleMultiplier;
    }

    private static calculateVelocityChangeBonus(
        withSliders: boolean,
        prevVelocity: number,
        currentVelocity: number,
        currentDistance: number,
        current: OsuDifficultyHitObject,
        last: OsuDifficultyHitObject,
    ): number {
        if (Math.max(prevVelocity, currentVelocity) === 0) {
            return 0;
        }

        if (withSliders) {
            // We want to use just the object jump without slider velocity when awarding differences.
            currentVelocity = currentDistance / current.strainTime;
        }

        // Scale with ratio of difference compared to half the max distance.
        const distanceRatio = MathUtils.smoothstep(
            Math.abs(prevVelocity - currentVelocity) /
                Math.max(prevVelocity, currentVelocity),
            0,
            1,
        );

        // Reward for % distance up to 125 / strainTime for overlaps where velocity is still changing.
        const overlapVelocityBuff = Math.min(
            (current.normalizedDiameter * 1.25) /
                Math.min(current.strainTime, last.strainTime),
            Math.abs(prevVelocity - currentVelocity),
        );

        let velocityChangeBonus = overlapVelocityBuff * distanceRatio;

        // Penalize for rhythm changes.
        velocityChangeBonus *= Math.pow(
            Math.min(current.strainTime, last.strainTime) /
                Math.max(current.strainTime, last.strainTime),
            2,
        );

        return velocityChangeBonus * this.velocityChangeMultiplier;
    }

    /**
     * Difficulty bonus for "wiggle" patterns - jumps that are [radius, 3*diameter] in distance, with < 110 angle.
     * https://www.desmos.com/calculator/dp0v0nvowc
     */
    private static calculateWiggleBonus(
        current: OsuDifficultyHitObject,
        last: OsuDifficultyHitObject,
        currentVelocity: number,
        prevVelocity: number,
        currentDistance: number,
        prevDistance: number,
    ): number {
        if (current.angle === null || last.angle === null) {
            return 0;
        }

        const radius = current.normalizedRadius;
        const diameter = current.normalizedDiameter;

        const wiggleBonus =
            Math.min(currentVelocity, prevVelocity) *
            MathUtils.smootherstep(currentDistance, radius, diameter) *
            Math.pow(
                MathUtils.reverseLerp(currentDistance, diameter * 3, diameter),
                1.8,
            ) *
            MathUtils.smootherstep(
                current.angle,
                MathUtils.degreesToRadians(110),
                MathUtils.degreesToRadians(60),
            ) *
            MathUtils.smootherstep(prevDistance, radius, diameter) *
            Math.pow(
                MathUtils.reverseLerp(prevDistance, diameter * 3, diameter),
                1.8,
            ) *
            MathUtils.smootherstep(
                last.angle,
                MathUtils.degreesToRadians(110),
                MathUtils.degreesToRadians(60),
            );

        return wiggleBonus * this.wiggleMultiplier;
    }

    private static calculateSliderBonus(
        current: OsuDifficultyHitObject,
    ): number {
        // Reward sliders based on velocity.
        const sliderBonus = current.travelDistance / current.travelTime;

        const rescaledSliderBonus =
            sliderBonus < 1 ? sliderBonus : Math.pow(sliderBonus, 0.75);

        return rescaledSliderBonus * this.sliderMultiplier;
    }

    private static calculateCurrentVelocity(
        current: OsuDifficultyHitObject,
        last: OsuDifficultyHitObject,
        currentDistance: number,
        withSliders: boolean,
    ): number {
        let currentVelocity = currentDistance / current.strainTime;

        // If the last object is a slider, then we extend the travel velocity through the slider into the
        // current object.
        if (last.object instanceof Slider && withSliders) {
            const sliderDistance =
                last.lazyTravelDistance + current.lazyJumpDistance;

            currentVelocity = Math.max(
                currentVelocity,
                sliderDistance / current.strainTime,
            );
        }

        return currentVelocity;
    }

    private static calculateWideAngleAcuteness(angle: number): number {
        return MathUtils.smoothstep(
            angle,
            MathUtils.degreesToRadians(40),
            MathUtils.degreesToRadians(140),
        );
    }

    static calculateAcuteAngleAcuteness(angle: number): number {
        return MathUtils.smoothstep(
            angle,
            MathUtils.degreesToRadians(140),
            MathUtils.degreesToRadians(40),
        );
    }

    private static highBpmBonus(ms: number): number {
        return 1 / (1 - Math.pow(0.03, Math.pow(ms / 1000, 0.65)));
    }

    private static calculateVectorAngleRepetition(
        current: OsuDifficultyHitObject,
        prev: OsuDifficultyHitObject,
    ): number {
        if (current.angle === null || prev.angle === null) {
            return 1;
        }

        let constantAngleCount = 0;

        for (let i = 0; i < this.angleRepetitionNoteLimit; ++i) {
            const loopObj = current.previous(i);

            if (!loopObj) {
                break;
            }

            // Only consider vectors in the same jump section, as stopping to change rhythm ruins momentum.
            if (
                Math.max(current.strainTime, loopObj.strainTime) >
                1.1 * Math.min(current.strainTime, loopObj.strainTime)
            ) {
                break;
            }

            if (
                loopObj.normalizedVectorAngle !== null &&
                current.normalizedVectorAngle !== null
            ) {
                const angleDifference = Math.abs(
                    current.normalizedVectorAngle -
                        loopObj.normalizedVectorAngle,
                );

                // Refer to this Desmos for tuning.
                // Constants need to be precise so that values stay within the range of 0 and 1.
                // https://www.desmos.com/calculator/a8jesv5sv2
                constantAngleCount += Math.cos(
                    8 *
                        Math.min(
                            MathUtils.degreesToRadians(11.25),
                            angleDifference,
                        ),
                );
            }
        }

        const vectorRepetition = Math.pow(
            Math.min(0.5 / constantAngleCount, 1),
            2,
        );

        const stackFactor = MathUtils.smootherstep(
            current.lazyJumpDistance,
            0,
            current.normalizedDiameter,
        );

        const angleDifferenceAdjusted = Math.cos(
            2 *
                Math.min(
                    MathUtils.degreesToRadians(45),
                    Math.abs(current.angle - prev.angle) * stackFactor,
                ),
        );

        const baseNerf =
            1 -
            this.maximumRepetitionNerf *
                this.calculateAcuteAngleAcuteness(prev.angle) *
                angleDifferenceAdjusted;

        return Math.pow(
            baseNerf +
                (1 - baseNerf) *
                    vectorRepetition *
                    this.maximumVectorInfluence *
                    stackFactor,
            2,
        );
    }
}
