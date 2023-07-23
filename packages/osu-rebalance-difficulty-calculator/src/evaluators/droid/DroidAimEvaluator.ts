import { Spinner, Slider, MathUtils } from "@rian8337/osu-base";
import { DifficultyHitObject } from "../../preprocessing/DifficultyHitObject";
import { AimEvaluator } from "../base/AimEvaluator";

/**
 * An evaluator for calculating osu!droid Aim skill.
 */
export abstract class DroidAimEvaluator extends AimEvaluator {
    protected static override readonly wideAngleMultiplier: number = 1.65;
    protected static override readonly sliderMultiplier: number = 1.5;
    protected static override readonly velocityChangeMultiplier: number = 0.85;

    /**
     * Spacing threshold for a single hitobject spacing.
     */
    private static readonly SINGLE_SPACING_THRESHOLD: number = 175;

    // ~200 1/2 BPM jumps
    private static readonly minSpeedBonus: number = 150;

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
        current: DifficultyHitObject,
        withSliders: boolean
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
     * Calculates the aim strain of a hitobject.
     */
    private static snapAimStrainOf(
        current: DifficultyHitObject,
        withSliders: boolean
    ): number {
        if (
            current.index <= 1 ||
            current.previous(0)?.object instanceof Spinner
        ) {
            return 0;
        }

        const last: DifficultyHitObject = current.previous(0)!;
        const lastLast: DifficultyHitObject = current.previous(1)!;

        // Calculate the velocity to the current hitobject, which starts with a base distance / time assuming the last object is a hitcircle.
        let currentVelocity: number =
            current.lazyJumpDistance / current.strainTime;

        // But if the last object is a slider, then we extend the travel velocity through the slider into the current object.
        if (last.object instanceof Slider && withSliders) {
            // Calculate the slider velocity from slider head to slider end.
            const travelVelocity: number =
                last.travelDistance / last.travelTime;

            // Calculate the movement velocity from slider end to current object.
            const movementVelocity: number =
                current.minimumJumpTime !== 0
                    ? current.minimumJumpDistance / current.minimumJumpTime
                    : 0;

            // Take the larger total combined velocity.
            currentVelocity = Math.max(
                currentVelocity,
                movementVelocity + travelVelocity
            );
        }

        // As above, do the same for the previous hitobject.
        let prevVelocity: number = last.lazyJumpDistance / last.strainTime;

        if (lastLast.object instanceof Slider && withSliders) {
            const travelVelocity: number =
                lastLast.travelDistance / lastLast.travelTime;

            const movementVelocity: number =
                last.minimumJumpTime !== 0
                    ? last.minimumJumpDistance / last.minimumJumpTime
                    : 0;

            prevVelocity = Math.max(
                prevVelocity,
                movementVelocity + travelVelocity
            );
        }

        let wideAngleBonus: number = 0;
        let acuteAngleBonus: number = 0;
        let sliderBonus: number = 0;
        let velocityChangeBonus: number = 0;

        // Start strain with regular velocity.
        let strain: number = currentVelocity;

        if (
            // If rhythms are the same.
            Math.max(current.strainTime, last.strainTime) <
                1.25 * Math.min(current.strainTime, last.strainTime) &&
            current.angle !== null &&
            last.angle !== null &&
            lastLast.angle !== null
        ) {
            // Rewarding angles, take the smaller velocity as base.
            const angleBonus: number = Math.min(currentVelocity, prevVelocity);

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
                                Math.min(1, (100 - current.strainTime) / 25)
                        ),
                        2
                    ) *
                    // Buff distance exceeding 50 (radius) up to 100 (diameter).
                    Math.pow(
                        Math.sin(
                            ((Math.PI / 2) *
                                (MathUtils.clamp(
                                    current.lazyJumpDistance,
                                    50,
                                    100
                                ) -
                                    50)) /
                                50
                        ),
                        2
                    );
            }

            // Penalize wide angles if they're repeated, reducing the penalty as last.angle gets more acute.
            wideAngleBonus *=
                angleBonus *
                (1 -
                    Math.min(
                        wideAngleBonus,
                        Math.pow(this.calculateWideAngleBonus(last.angle), 3)
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
                                3
                            )
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
            const distanceRatio: number = Math.pow(
                Math.sin(
                    ((Math.PI / 2) * Math.abs(prevVelocity - currentVelocity)) /
                        Math.max(prevVelocity, currentVelocity)
                ),
                2
            );

            // Reward for % distance up to 125 / strainTime for overlaps where velocity is still changing.
            const overlapVelocityBuff: number = Math.min(
                125 / Math.min(current.strainTime, last.strainTime),
                Math.abs(prevVelocity - currentVelocity)
            );

            velocityChangeBonus = overlapVelocityBuff * distanceRatio;

            // Penalize for rhythm changes.
            velocityChangeBonus *= Math.pow(
                Math.min(current.strainTime, last.strainTime) /
                    Math.max(current.strainTime, last.strainTime),
                2
            );
        }

        if (last.object instanceof Slider) {
            // Reward sliders based on velocity.
            sliderBonus = last.travelDistance / last.travelTime;
        }

        // Add in acute angle bonus or wide angle bonus + velocity change bonus, whichever is larger.
        strain += Math.max(
            acuteAngleBonus * this.acuteAngleMultiplier,
            wideAngleBonus * this.wideAngleMultiplier +
                velocityChangeBonus * this.velocityChangeMultiplier
        );

        // Add in additional slider velocity bonus.
        if (withSliders) {
            strain +=
                Math.pow(1 + sliderBonus * this.sliderMultiplier, 1.25) - 1;
        }

        return strain;
    }

    /**
     * Calculates the movement strain of a hitobject.
     */
    private static flowAimStrainOf(current: DifficultyHitObject): number {
        let speedBonus: number = 1;

        if (current.strainTime < this.minSpeedBonus) {
            speedBonus +=
                0.75 *
                Math.pow((this.minSpeedBonus - current.strainTime) / 45, 2);
        }

        const travelDistance: number = current.previous(0)?.travelDistance ?? 0;
        const distance: number = Math.min(
            this.SINGLE_SPACING_THRESHOLD,
            travelDistance + current.minimumJumpDistance
        );

        return (
            (50 *
                speedBonus *
                Math.pow(distance / this.SINGLE_SPACING_THRESHOLD, 5)) /
            current.strainTime
        );
    }
}
