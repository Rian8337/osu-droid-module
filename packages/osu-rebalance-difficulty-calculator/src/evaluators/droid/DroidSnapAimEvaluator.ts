import { MathUtils, Slider, Spinner } from "@rian8337/osu-base";
import { DroidDifficultyHitObject } from "../../preprocessing/DroidDifficultyHitObject";

/**
 * An evaluator for calculating osu!droid snap aim difficulty.
 */
export abstract class DroidSnapAimEvaluator {
    private static readonly wideAngleMultiplier = 1.6;
    private static readonly acuteAngleMultiplier = 2.4;
    private static readonly sliderMultiplier = 1.35;
    private static readonly velocityChangeMultiplier = 0.75;
    private static readonly wiggleMultiplier = 1.02;

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
        const lastLast = current.previous(1)!;
        const last2 = current.previous(2);

        const radius = DroidDifficultyHitObject.normalizedRadius;
        const diameter = DroidDifficultyHitObject.normalizedDiameter;

        // Calculate the velocity to the current hitobject, which starts with a base distance / time assuming the last object is a hitcircle.
        let currentVelocity = current.lazyJumpDistance / current.strainTime;

        // But if the last object is a slider, then we extend the travel velocity through the slider into the current object.
        if (last.object instanceof Slider && withSliders) {
            // Calculate the slider velocity from slider head to slider end.
            const travelVelocity = last.travelDistance / last.travelTime;

            // Calculate the movement velocity from slider end to current object.
            const movementVelocity =
                current.minimumJumpTime !== 0
                    ? current.minimumJumpDistance / current.minimumJumpTime
                    : 0;

            // Take the larger total combined velocity.
            currentVelocity = Math.max(
                currentVelocity,
                movementVelocity + travelVelocity,
            );
        }

        // As above, do the same for the previous hitobject.
        let prevVelocity = last.lazyJumpDistance / last.strainTime;

        if (lastLast.object instanceof Slider && withSliders) {
            const travelVelocity =
                lastLast.travelDistance / lastLast.travelTime;

            const movementVelocity =
                last.minimumJumpTime !== 0
                    ? last.minimumJumpDistance / last.minimumJumpTime
                    : 0;

            prevVelocity = Math.max(
                prevVelocity,
                movementVelocity + travelVelocity,
            );
        }

        let wideAngleBonus = 0;
        let acuteAngleBonus = 0;
        let sliderBonus = 0;
        let velocityChangeBonus = 0;
        let wiggleBonus = 0;

        // Start strain with regular velocity.
        let strain = currentVelocity;

        if (current.angle !== null && last.angle !== null) {
            const currentAngle = current.angle;
            const lastAngle = last.angle;

            // Rewarding angles, take the smaller velocity as base.
            const angleBonus = Math.min(currentVelocity, prevVelocity);

            // If rhythms are the same.
            if (
                Math.max(current.strainTime, last.strainTime) <
                1.25 * Math.min(current.strainTime, last.strainTime)
            ) {
                acuteAngleBonus = this.calculateAcuteAngleBonus(current.angle);

                acuteAngleBonus *=
                    0.08 +
                    0.92 *
                        (1 -
                            Math.min(
                                acuteAngleBonus,
                                Math.pow(
                                    this.calculateAcuteAngleBonus(lastAngle),
                                    3,
                                ),
                            ));

                // Apply acute angle bonus for BPM above 300 1/2 and distance more than 1.25 diameter
                acuteAngleBonus *=
                    angleBonus *
                    MathUtils.smootherstep(
                        MathUtils.millisecondsToBPM(current.strainTime, 2),
                        300,
                        450,
                    ) *
                    MathUtils.smootherstep(
                        current.lazyJumpDistance,
                        diameter * 1.25,
                        diameter * 2.5,
                    );
            }

            wideAngleBonus = this.calculateWideAngleBonus(current.angle);

            // Penalize angle repetition.
            wideAngleBonus *=
                1 -
                Math.min(
                    wideAngleBonus,
                    Math.pow(this.calculateWideAngleBonus(lastAngle), 3),
                );

            // Apply full wide angle bonus for distance more than one diameter
            wideAngleBonus *=
                angleBonus *
                MathUtils.smootherstep(current.lazyJumpDistance, 0, diameter);

            // Apply wiggle bonus for jumps that are [radius, 3*diameter] in distance, with < 110 angle
            // https://www.desmos.com/calculator/dp0v0nvowc
            wiggleBonus =
                angleBonus *
                MathUtils.smootherstep(
                    current.lazyJumpDistance,
                    radius,
                    diameter,
                ) *
                Math.pow(
                    MathUtils.reverseLerp(
                        current.lazyJumpDistance,
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
                MathUtils.smootherstep(
                    last.lazyJumpDistance,
                    radius,
                    diameter,
                ) *
                Math.pow(
                    MathUtils.reverseLerp(
                        last.lazyJumpDistance,
                        diameter * 3,
                        diameter,
                    ),
                    1.8,
                ) *
                MathUtils.smootherstep(
                    lastAngle,
                    MathUtils.degreesToRadians(110),
                    MathUtils.degreesToRadians(60),
                );

            if (last2 !== null) {
                // If objects just go back and forth through a middle point - don't give as much wide bonus.
                // Use previous(2) and previous(0) because angles calculation is done prevprev-prev-curr, so any
                // object's angle's center point is always the previous object.
                const distance = last2.object.stackedPosition.getDistance(
                    last.object.stackedPosition,
                );

                if (distance < 1) {
                    wideAngleBonus *= 1 - 0.35 * (1 - distance);
                }
            }
        }

        if (Math.max(prevVelocity, currentVelocity)) {
            // We want to use the average velocity over the whole object when awarding differences, not the individual jump and slider path velocities.
            prevVelocity =
                (last.lazyJumpDistance + lastLast.travelDistance) /
                last.strainTime;
            currentVelocity =
                (current.lazyJumpDistance + last.travelDistance) /
                current.strainTime;

            // Scale with ratio of difference compared to half the max distance.
            const distanceRatio = MathUtils.smoothstep(
                Math.abs(prevVelocity - currentVelocity) /
                    Math.max(prevVelocity, currentVelocity),
                0,
                1,
            );

            // Reward for % distance up to 125 / strainTime for overlaps where velocity is still changing.
            const overlapVelocityBuff = Math.min(
                125 / Math.min(current.strainTime, last.strainTime),
                Math.abs(prevVelocity - currentVelocity),
            );

            velocityChangeBonus = overlapVelocityBuff * distanceRatio;

            // Penalize for rhythm changes.
            velocityChangeBonus *= Math.pow(
                Math.min(current.strainTime, last.strainTime) /
                    Math.max(current.strainTime, last.strainTime),
                2,
            );
        }

        if (last.object instanceof Slider) {
            // Reward sliders based on velocity.
            sliderBonus = last.travelDistance / last.travelTime;
        }

        strain += wiggleBonus * this.wiggleMultiplier;
        strain += velocityChangeBonus * this.velocityChangeMultiplier;

        // Add in acute angle bonus or wide angle bonus, whichever is larger.
        strain += Math.max(
            acuteAngleBonus * this.acuteAngleMultiplier,
            wideAngleBonus * this.wideAngleMultiplier,
        );

        // Apply high circle size bonus
        strain *= current.smallCircleBonus;

        // Add in additional slider velocity bonus.
        if (withSliders) {
            strain +=
                Math.pow(1 + sliderBonus * this.sliderMultiplier, 1.25) - 1;
        }

        return strain;
    }

    private static calculateWideAngleBonus(angle: number): number {
        return MathUtils.smoothstep(
            angle,
            MathUtils.degreesToRadians(40),
            MathUtils.degreesToRadians(140),
        );
    }

    private static calculateAcuteAngleBonus(angle: number): number {
        return MathUtils.smoothstep(
            angle,
            MathUtils.degreesToRadians(140),
            MathUtils.degreesToRadians(40),
        );
    }
}
