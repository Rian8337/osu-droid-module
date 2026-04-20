import { MathUtils, Slider, Spinner } from "@rian8337/osu-base";
import { OsuDifficultyHitObject } from "../../preprocessing/OsuDifficultyHitObject";
import { OsuSnapAimEvaluator } from "./OsuSnapAimEvaluator";

/**
 * An evaluator for calculating osu!standard flow aim difficulty.
 */
export abstract class OsuFlowAimEvaluator {
    private static readonly velocityChangeMultiplier = 0.52;

    static evaluateDifficultyOf(
        current: OsuDifficultyHitObject,
        withSliders: boolean,
    ): number {
        if (
            current.object instanceof Spinner ||
            current.index <= 1 ||
            current.previous(0)?.object instanceof Spinner
        ) {
            return 0;
        }

        const last = current.previous(0)!;
        const lastLast = current.previous(1)!;

        const currentDistance = withSliders
            ? current.lazyJumpDistance
            : current.jumpDistance;

        const prevDistance = withSliders
            ? last.lazyJumpDistance
            : last.jumpDistance;

        let currentVelocity = currentDistance / current.strainTime;

        if (last.object instanceof Slider && withSliders) {
            // If the last object is a slider, then we extend the travel velocity through the slider into the current object.
            const sliderDistance =
                last.lazyTravelDistance + current.lazyJumpDistance;

            currentVelocity = Math.max(
                currentVelocity,
                sliderDistance / current.strainTime,
            );
        }

        const prevVelocity = prevDistance / last.strainTime;
        let flowDifficulty = currentVelocity;

        // Apply high circle size bonus to the base velocity.
        // We use reduced CS bonus here because the bonus was made for an evaluator with a different d/t scaling.
        flowDifficulty *= Math.sqrt(current.smallCircleBonus);

        // Rhythm changes are harder to flow.
        flowDifficulty *=
            1 +
            Math.min(
                0.25,
                Math.pow(
                    (Math.max(current.strainTime, last.strainTime) -
                        Math.min(current.strainTime, last.strainTime)) /
                        50,
                    4,
                ),
            );

        if (current.angle !== null && last.angle !== null) {
            // Low angular velocity (consistent angles) is easier to follow than erratic flow.
            const angleDifference = Math.abs(current.angle - last.angle);
            const angleDifferenceAdjusted = Math.sin(angleDifference / 2) * 180;

            const angularVelocity =
                angleDifferenceAdjusted / (current.strainTime * 0.1);

            flowDifficulty *= 0.8 + Math.sqrt(angularVelocity / 270);
        }

        // If all three notes overlap, do not reward bonuses as there is no required additional movement.
        let overlappedNotesWeight = 1;

        if (current.index > 2) {
            const o1 = this.calculateOverlapFactor(current, last);
            const o2 = this.calculateOverlapFactor(current, lastLast);
            const o3 = this.calculateOverlapFactor(last, lastLast);

            overlappedNotesWeight = 1 - o1 * o2 * o3;
        }

        if (current.angle !== null) {
            // Acute angles are hard to flow.
            // Square root velocity to ensure acute angle switches in streams are not assessed as harder than snap.
            flowDifficulty +=
                Math.sqrt(currentVelocity) *
                OsuSnapAimEvaluator.calculateAcuteAngleAcuteness(
                    current.angle,
                ) *
                overlappedNotesWeight;
        }

        if (Math.max(prevVelocity, currentVelocity)) {
            if (withSliders) {
                currentVelocity = currentDistance / current.strainTime;
            }

            // Scale with ratio of difference compared to 0.5 * max distance.
            const distanceRatio = MathUtils.smoothstep(
                Math.abs(prevVelocity - currentVelocity) /
                    Math.max(prevVelocity, currentVelocity),
                0,
                1,
            );

            // Reward for % distance up to 125 / strainTime for overlaps where velocity is still changing.
            const overlapVelocityBuff = Math.min(
                (OsuDifficultyHitObject.normalizedDiameter * 1.25) /
                    Math.min(current.strainTime, last.strainTime),
                Math.abs(prevVelocity - currentVelocity),
            );

            flowDifficulty +=
                overlapVelocityBuff *
                distanceRatio *
                overlappedNotesWeight *
                this.velocityChangeMultiplier;
        }

        if (current.object instanceof Slider && withSliders) {
            // Include slider velocity to make velocity more consistent with snap.
            flowDifficulty += current.travelDistance / current.travelTime;
        }

        // The final velocity is being raised to a power because flow difficulty scales harder with both high
        // distance and time, and we want to account for that.
        flowDifficulty = Math.pow(flowDifficulty, 1.45);

        // Reduce difficulty for low spacing since spacing below radius is always to be flowed.
        return (
            flowDifficulty *
            MathUtils.smootherstep(
                currentDistance,
                0,
                OsuDifficultyHitObject.normalizedRadius,
            )
        );
    }

    private static calculateOverlapFactor(
        o1: OsuDifficultyHitObject,
        o2: OsuDifficultyHitObject,
    ): number {
        const distance = o1.object.stackedPosition.getDistance(
            o2.object.stackedPosition,
        );

        const { radius } = o1.object;

        return MathUtils.clamp(
            1 - Math.pow(Math.max(distance - radius, 0) / radius, 2),
            0,
            1,
        );
    }
}
