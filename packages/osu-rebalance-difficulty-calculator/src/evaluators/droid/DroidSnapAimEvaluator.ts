import { MathUtils, Slider, Spinner } from "@rian8337/osu-base";
import { DroidDifficultyHitObject } from "../../preprocessing/DroidDifficultyHitObject";

/**
 * An evaluator for calculating osu!droid snap aim difficulty.
 */
export abstract class DroidSnapAimEvaluator {
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
        current: DroidDifficultyHitObject,
        withSliders: boolean,
    ): number {
        if (
            current.object instanceof Spinner ||
            // Exclude overlapping objects that can be tapped at once.
            current.isOverlapping(true) ||
            current.index <= 1 ||
            current.previous(0)?.object instanceof Spinner
        ) {
            return 0;
        }

        const last = current.previous(0)!;
        const last2 = current.previous(2);

        const radius = current.normalizedRadius;
        const diameter = current.normalizedDiameter;

        // Calculate the velocity to the current hitobject, which starts with a base distance / time assuming the last object is a hitcircle.
        const currentDistance = withSliders
            ? current.lazyJumpDistance
            : current.jumpDistance;

        let currentVelocity = currentDistance / current.strainTime;

        // But if the last object is a slider, then we extend the travel velocity through the slider into the current object.
        if (last.object instanceof Slider && withSliders) {
            const sliderDistance =
                last.lazyTravelDistance + current.lazyJumpDistance;

            currentVelocity = Math.max(
                currentVelocity,
                sliderDistance / current.strainTime,
            );
        }

        const prevDistance = withSliders
            ? last.lazyJumpDistance
            : last.jumpDistance;

        const prevVelocity = prevDistance / last.strainTime;

        // Start strain with regular velocity.
        let strain = currentVelocity;

        strain *= this.calculateVectorAngleRepetition(current, last);

        if (current.angle !== null && last.angle !== null) {
            const currentAngle = current.angle;
            const lastAngle = last.angle;

            // Rewarding angles, take the smaller velocity as base.
            const velocityInfluence = Math.min(currentVelocity, prevVelocity);

            let acuteAngleBonus = 0;

            // If rhythms are the same.
            if (
                Math.max(current.strainTime, last.strainTime) <
                1.25 * Math.min(current.strainTime, last.strainTime)
            ) {
                acuteAngleBonus = this.calculateAcuteAngleAcuteness(
                    current.angle,
                );

                // Penalize angle repetition. It is important to do it _before_ multiplying by anything because we compare raw acuteness here.
                acuteAngleBonus *=
                    0.08 +
                    0.92 *
                        (1 -
                            Math.min(
                                acuteAngleBonus,
                                Math.pow(
                                    this.calculateAcuteAngleAcuteness(
                                        lastAngle,
                                    ),
                                    3,
                                ),
                            ));

                // Apply acute angle bonus for BPM above 300 1/2.
                acuteAngleBonus *=
                    velocityInfluence *
                    MathUtils.smootherstep(
                        MathUtils.millisecondsToBPM(current.strainTime, 2),
                        300,
                        450,
                    ) *
                    MathUtils.smootherstep(
                        current.lazyJumpDistance,
                        0,
                        diameter * 2,
                    );
            }

            let wideAngleBonus = this.calculateWideAngleAcuteness(
                current.angle,
            );

            // Penalize angle repetition. It is important to do it _before_ multiplying by velocity because we compare raw wideness here.
            wideAngleBonus *=
                0.25 +
                0.75 *
                    (1 -
                        Math.min(
                            wideAngleBonus,
                            Math.pow(
                                this.calculateWideAngleAcuteness(lastAngle),
                                3,
                            ),
                        ));

            // Rescale velocity for wide angle bonus.
            const wideAngleTimeScale = 1.45;

            let wideAngleCurrentVelocity =
                currentDistance /
                Math.pow(current.strainTime, wideAngleTimeScale);

            const wideAnglePrevVelocity =
                prevDistance / Math.pow(last.strainTime, wideAngleTimeScale);

            if (last.object instanceof Slider && withSliders) {
                const sliderDistance =
                    last.lazyTravelDistance + current.lazyJumpDistance;

                wideAngleCurrentVelocity = Math.max(
                    wideAngleCurrentVelocity,
                    sliderDistance /
                        Math.pow(current.strainTime, wideAngleTimeScale),
                );
            }

            wideAngleBonus *= Math.min(
                wideAngleCurrentVelocity,
                wideAnglePrevVelocity,
            );

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

            // Add in acute angle bonus or wide angle bonus, whichever is larger.
            strain += Math.max(
                acuteAngleBonus * this.acuteAngleMultiplier,
                wideAngleBonus * this.wideAngleMultiplier,
            );

            // Apply wiggle bonus for jumps that are [radius, 3*diameter] in distance, with < 110 angle
            // https://www.desmos.com/calculator/dp0v0nvowc
            strain +=
                velocityInfluence *
                MathUtils.smootherstep(currentDistance, radius, diameter) *
                Math.pow(
                    MathUtils.reverseLerp(
                        currentDistance,
                        diameter * 3,
                        diameter,
                    ),
                    1.8,
                ) *
                MathUtils.smootherstep(
                    currentAngle,
                    MathUtils.degreesToRadians(110),
                    MathUtils.degreesToRadians(60),
                ) *
                MathUtils.smootherstep(prevDistance, radius, diameter) *
                Math.pow(
                    MathUtils.reverseLerp(prevDistance, diameter * 3, diameter),
                    1.8,
                ) *
                MathUtils.smootherstep(
                    lastAngle,
                    MathUtils.degreesToRadians(110),
                    MathUtils.degreesToRadians(60),
                ) *
                this.wiggleMultiplier;
        }

        if (Math.max(prevVelocity, currentVelocity)) {
            if (withSliders) {
                // We want to use the average velocity over the whole object when awarding differences, not the individual jump and slider path velocities.
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
                (diameter * 1.25) /
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

            strain += velocityChangeBonus * this.velocityChangeMultiplier;
        }

        if (current.object instanceof Slider && withSliders) {
            // Reward sliders based on velocity.
            let sliderBonus = current.travelDistance / current.travelTime;

            sliderBonus =
                sliderBonus < 1 ? sliderBonus : Math.pow(sliderBonus, 0.75);

            strain +=
                Math.pow(1 + sliderBonus * this.sliderMultiplier, 1.25) - 1;
        }

        // Apply high circle size bonus
        strain *= current.smallCircleBonus;

        strain *= this.highBpmBonus(current.strainTime);

        return strain;
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
        current: DroidDifficultyHitObject,
        prev: DroidDifficultyHitObject,
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
