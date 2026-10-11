import { MathUtils, Slider, Spinner } from "@rian8337/osu-base";
import { OsuDifficultyHitObject } from "../../preprocessing/OsuDifficultyHitObject";

/**
 * An evaluator for calculating osu!standard snap aim difficulty.
 */
export abstract class OsuSnapAimEvaluator {
    private static readonly wideAngleMultiplier = 2.15;
    // Rescale velocity for the wide angle bonus.
    private static readonly wideAngleTimeScale = 1.2;
    private static readonly sliderMultiplier = 1.35;
    private static readonly velocityChangeMultiplier = 0.85;

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
        if (
            current.object instanceof Spinner ||
            current.index <= 1
        ) {
            return 0;
        }

        const last = current.previous(0)!;

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

        strain += this.calculateWideAngleBonus(
            current,
            last,
            currentDistance,
            prevDistance,
            withSliders,
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

        let currentRescaledVelocity =
            currentDistance / Math.pow(current.strainTime, this.wideAngleTimeScale);

        const prevRescaledVelocity =
            prevDistance / Math.pow(last.strainTime, this.wideAngleTimeScale);

        if (last.object instanceof Slider && withSliders) {
            const sliderDistance =
                last.lazyTravelDistance + current.lazyJumpDistance;

            currentRescaledVelocity = Math.max(
                currentRescaledVelocity,
                sliderDistance /
                    Math.pow(current.strainTime, this.wideAngleTimeScale),
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

        // Cap velocity to at least 1 radius distance to only award snap patterns.
        currentVelocity = Math.max(currentVelocity, current.normalizedDiameter / current.strainTime);
        prevVelocity = Math.max(prevVelocity, last.normalizedDiameter / last.strainTime);

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
            3,
        );

        return velocityChangeBonus * this.velocityChangeMultiplier;
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
        if (
            current.angle === null ||
            prev.angle === null ||
            prev.object instanceof Spinner ||
            prev.previous(0)?.object instanceof Spinner
        ) {
            return 1;
        }

        let constantAngleCount = 0;

        for (let i = 0; i < this.angleRepetitionNoteLimit; ++i) {
            const loopObj = current.previous(i);

            if (!loopObj || loopObj.object instanceof Spinner) {
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
