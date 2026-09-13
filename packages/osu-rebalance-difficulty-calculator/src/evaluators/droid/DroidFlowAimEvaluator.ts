import { MathUtils, Slider, Spinner } from "@rian8337/osu-base";
import { DroidDifficultyHitObject } from "../../preprocessing/DroidDifficultyHitObject";
import { DroidSnapAimEvaluator } from "./DroidSnapAimEvaluator";

/**
 * An evaluator for calculating osu!droid flow aim difficulty.
 */
export abstract class DroidFlowAimEvaluator {
    private static readonly velocityChangeMultiplier = 0.5;
    private static readonly acuteAngleMultiplier = 1.3;

    static evaluateDifficultyOf(
        current: DroidDifficultyHitObject,
        withSliders: boolean,
    ): number {
        if (
            current.object instanceof Spinner ||
            current.index <= 1 ||
            current.previous(0)?.object instanceof Spinner
        ) {
            return 0;
        }

        const next =  current.next(0);
        const last = current.previous(0)!;
        const lastLast = current.previous(1)!;

        const currentDistance =
            withSliders && !current.is2BSlider
                ? current.lazyJumpDistance
                : current.jumpDistance;

        const prevDistance =
            withSliders && !last.is2BSlider
                ? last.lazyJumpDistance
                : last.jumpDistance;

        let currentVelocity = currentDistance / current.strainTime;

        if (last.object instanceof Slider && !last.is2BSlider && withSliders) {
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
                0.1,
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

        if (current.angle !== null && next !== null && next.angle !== null) {
            const currentAcuteness = DroidSnapAimEvaluator.calculateAcuteAngleAcuteness(
                current.angle,
            );

            const nextAcuteness = DroidSnapAimEvaluator.calculateAcuteAngleAcuteness(
                next.angle,
            );

            let acuteness: number;
            let overlapWeight: number;

            // We want to evaluate flow turns at the center point of the actual turn, but curr.Angle is a prev2-prev-curr angle.
            // The issue with changing that to prev-curr-next is that we might evaluate the second note of a flow pattern as snap if prev is acute.
            // With min(curr,next) the evaluation (assuming acute affects snap/flow probability enough) behaves roughly like this:
            //
            //    flow (prev-curr-next and prev2-prev-curr evaluates as wide)
            //     🡓🡓
            //     ooo 🡐 flow (prev2-prev-curr evaluates as wide)
            //      /
            //   ooo 🡐 snap (prev2-prev-curr evaluates as acute)
            //   🡑🡑
            //  flow (prev-curr-next evaluates as wide)
            //
            //
            //  flow (prev-curr-next and prev2-prev-curr evaluates as wide)
            //   🡓🡓
            //   ooo 🡐 flow (prev-curr-next and prev2-prev-curr evaluates as wide)
            //      \
            //     ooo 🡐 snap (prev-curr-next evaluates as acute as the center point of the turn)
            //     🡑🡑
            //    flow (prev-curr-next evaluates as wide)
            //
            // In both examples the first object in a flow pattern is evaluated as acute (likely snap) and the rest are wide (likely flow).
            if (currentAcuteness < nextAcuteness) {
                acuteness = currentAcuteness;

                overlapWeight = this.calculateOverlapWeight(
                    current,
                    last,
                    lastLast,
                );
            } else {
                acuteness = nextAcuteness;

                overlapWeight = this.calculateOverlapWeight(
                    next,
                    current,
                    last,
                );
            }

            flowDifficulty += currentVelocity * acuteness * overlapWeight * this.acuteAngleMultiplier;
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
                (current.normalizedDiameter * 1.25) /
                    Math.min(current.strainTime, last.strainTime),
                Math.abs(prevVelocity - currentVelocity),
            );

            flowDifficulty +=
                overlapVelocityBuff *
                distanceRatio *
                this.calculateOverlapWeight(current, last, lastLast) *
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
            MathUtils.smootherstep(currentDistance, 0, current.normalizedRadius)
        );
    }

    // If all three notes overlap, do not reward bonuses as there is no required additional movement.
    private static calculateOverlapWeight(
        first: DroidDifficultyHitObject,
        second: DroidDifficultyHitObject,
        third: DroidDifficultyHitObject
    ): number {
        const o1 = this.calculateOverlapFactor(first, second);
        const o2 = this.calculateOverlapFactor(first, third);
        const o3 = this.calculateOverlapFactor(second, third);

        return 1 - o1 * o2 * o3;
    }

    private static calculateOverlapFactor(
        o1: DroidDifficultyHitObject,
        o2: DroidDifficultyHitObject,
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
