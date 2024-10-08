import { Spinner, Slider, MathUtils } from "@rian8337/osu-base";
import { AimEvaluator } from "../base/AimEvaluator";
import { DroidDifficultyHitObject } from "../../preprocessing/DroidDifficultyHitObject";

/**
 * An evaluator for calculating osu!droid Aim skill.
 */
export abstract class DroidAimEvaluator extends AimEvaluator {
    protected static override readonly wideAngleMultiplier = 1.65;
    protected static override readonly sliderMultiplier = 1.5;
    protected static override readonly velocityChangeMultiplier = 0.85;

    private static readonly singleSpacingThreshold = 100;

    // 200 1/4 BPM delta time
    private static readonly minSpeedBonus = 75;

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
            current.isOverlapping(true)
        ) {
            return 0;
        }

        return (
            this.snapAimStrainOf(current, withSliders) +
            this.flowAimStrainOf(current)
        );
    }

    /**
     * Calculates the snap aim strain of a hitobject.
     */
    private static snapAimStrainOf(
        current: DroidDifficultyHitObject,
        withSliders: boolean,
    ): number {
        if (
            current.index <= 1 ||
            current.previous(0)?.object instanceof Spinner
        ) {
            return 0;
        }

        const last = current.previous(0)!;
        const lastLast = current.previous(1)!;

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

        // Start strain with regular velocity.
        let strain = currentVelocity;

        if (
            // If rhythms are the same.
            Math.max(current.strainTime, last.strainTime) <
                1.25 * Math.min(current.strainTime, last.strainTime) &&
            current.angle !== null &&
            last.angle !== null &&
            lastLast.angle !== null
        ) {
            // Rewarding angles, take the smaller velocity as base.
            const angleBonus = Math.min(currentVelocity, prevVelocity);

            wideAngleBonus = this.calculateWideAngleBonus(current.angle);
            acuteAngleBonus = this.calculateAcuteAngleBonus(current.angle);

            // Only buff deltaTime exceeding 300 BPM 1/2.
            if (current.strainTime > 100) {
                acuteAngleBonus = 0;
            } else {
                acuteAngleBonus *=
                    // Multiply by previous angle, we don't want to buff unless this is a wiggle type pattern.
                    this.calculateAcuteAngleBonus(last.angle) *
                    // The maximum velocity we buff is equal to 125 / strainTime.
                    Math.min(angleBonus, 125 / current.strainTime) *
                    // Scale buff from 300 BPM 1/2 to 400 BPM 1/2.
                    Math.pow(
                        Math.sin(
                            (Math.PI / 2) *
                                Math.min(1, (100 - current.strainTime) / 25),
                        ),
                        2,
                    ) *
                    // Buff distance exceeding 50 (radius) up to 100 (diameter).
                    Math.pow(
                        Math.sin(
                            ((Math.PI / 2) *
                                (MathUtils.clamp(
                                    current.lazyJumpDistance,
                                    50,
                                    100,
                                ) -
                                    50)) /
                                50,
                        ),
                        2,
                    );
            }

            // Penalize wide angles if they're repeated, reducing the penalty as last.angle gets more acute.
            wideAngleBonus *=
                angleBonus *
                (1 -
                    Math.min(
                        wideAngleBonus,
                        Math.pow(this.calculateWideAngleBonus(last.angle), 3),
                    ));
            // Penalize acute angles if they're repeated, reducing the penalty as lastLast.angle gets more obtuse.
            acuteAngleBonus *=
                0.5 +
                0.5 *
                    (1 -
                        Math.min(
                            acuteAngleBonus,
                            Math.pow(
                                this.calculateAcuteAngleBonus(lastLast.angle),
                                3,
                            ),
                        ));
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
            const distanceRatio = Math.pow(
                Math.sin(
                    ((Math.PI / 2) * Math.abs(prevVelocity - currentVelocity)) /
                        Math.max(prevVelocity, currentVelocity),
                ),
                2,
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

        // Reduce snap aim difficulty for low spacing as the player is more likely to perform
        // a flowing movement instead of snapping to the object. This also prevents the weird
        // scenario of awarding flow aim difficulty in snap aim.
        const flowBonus = Math.pow(
            last.minimumJumpDistance / this.singleSpacingThreshold,
            3.5,
        );

        if (flowBonus < 1) {
            strain *= 0.5 * (1 + Math.sqrt(flowBonus));
            wideAngleBonus *= 0.5 * (1 + Math.sqrt(flowBonus));
        }

        // Add in acute angle bonus or wide angle bonus + velocity change bonus, whichever is larger.
        strain += Math.max(
            acuteAngleBonus * this.acuteAngleMultiplier,
            wideAngleBonus * this.wideAngleMultiplier +
                velocityChangeBonus * this.velocityChangeMultiplier,
        );

        // Add in additional slider velocity bonus.
        if (withSliders) {
            strain +=
                Math.pow(1 + sliderBonus * this.sliderMultiplier, 1.25) - 1;
        }

        return strain;
    }

    /**
     * Calculates the flow aim strain of a hitobject.
     */
    private static flowAimStrainOf(current: DroidDifficultyHitObject): number {
        let speedBonus = 1;

        if (current.strainTime < this.minSpeedBonus) {
            speedBonus +=
                0.75 *
                Math.pow((this.minSpeedBonus - current.strainTime) / 40, 2);
        }

        const prev = current.previous(0);

        // Punish low spacing as it is easier to aim.
        const travelDistance = prev?.travelDistance ?? 0;
        const distance = travelDistance + current.minimumJumpDistance;
        const shortDistancePenalty = Math.min(
            1,
            Math.pow(distance / this.singleSpacingThreshold, 3.5),
        );

        let adjustedDistanceScale = 1;

        // Reward for inconsistent angles while punishing consistent ones.
        // Only apply the adjustment to patterns with the same delta time.
        // Graph: https://www.desmos.com/calculator/soomupyfwp
        if (
            current.angle !== null &&
            typeof prev?.angle === "number" &&
            Math.abs(current.deltaTime - prev.deltaTime) < 10
        ) {
            const angleDiff = Math.abs(current.angle - prev.angle);
            const adjustedAngleDiff = Math.sin(angleDiff / 2) * 180;

            const angularVelocity =
                adjustedAngleDiff / (0.1 + current.strainTime);
            const angularVelocityBonus = Math.max(
                0,
                Math.pow(angularVelocity, 0.4) - 1,
            );

            adjustedDistanceScale = 0.65 + angularVelocityBonus * 0.45;
        }

        return (
            (200 * speedBonus * shortDistancePenalty * adjustedDistanceScale) /
            current.strainTime
        );
    }
}
