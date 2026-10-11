import { MathUtils, Slider, Spinner } from "@rian8337/osu-base";
import { OsuDifficultyHitObject } from "../../preprocessing/OsuDifficultyHitObject";
import { OsuSnapAimEvaluator } from "./OsuSnapAimEvaluator";

/**
 * An evaluator for calculating osu!standard flow aim difficulty.
 */
export abstract class OsuFlowAimEvaluator {
    private static readonly velocityChangeMultiplier = 1.9;
    private static readonly maximumRhythmChangeBonus = 0.1;
    private static readonly acuteAngleMultiplier = 0.9;

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

        const next = current.next(0);
        const last = current.previous(0)!;
        const lastLast = current.previous(1)!;

        const currentDistance = withSliders
            ? current.lazyJumpDistance
            : current.jumpDistance;

        const prevDistance = withSliders
            ? last.lazyJumpDistance
            : last.jumpDistance;

        const currentVelocity = this.calculateCurrentVelocity(current, last, currentDistance, withSliders);
        const prevVelocity = prevDistance / last.strainTime;

        let flowDifficulty = currentVelocity;

        // Apply high circle size bonus to the base velocity.
        // We use reduced CS bonus here because the bonus was made for an evaluator with a different d/t scaling.
        flowDifficulty *= Math.pow(current.smallCircleBonus, 0.55);

        flowDifficulty *= this.calculateRhythmChangeBonus(current, last);
        flowDifficulty *= this.calculateAngularVelocityBonus(current, last);

        flowDifficulty += this.calculateAcuteAngleBonus(
            current, last, lastLast, next, currentVelocity
        );

        flowDifficulty += this.calculateVelocityChangeBonus(
            current,
            last,
            currentVelocity,
            prevVelocity,
            currentDistance,
            this.calculateOverlapWeight(
                current,
                last,
                lastLast
            ),
            withSliders
        );

        if (current.object instanceof Slider && withSliders) {
            flowDifficulty += this.calculateSliderBonus(current);
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

    private static calculateRhythmChangeBonus(current: OsuDifficultyHitObject, last: OsuDifficultyHitObject): number {
        const bonus = Math.pow(
            (Math.max(current.strainTime, last.strainTime) -
                Math.min(current.strainTime, last.strainTime)) / 50,
            4,
        );

        return 1 + Math.min(this.maximumRhythmChangeBonus, bonus);
    }

    /**
     * Scales flow difficulty by angular velocity.
     * This nerfs consistent angles whilst buffing "erratic" flow.
     */
    private static calculateAngularVelocityBonus(current: OsuDifficultyHitObject, last: OsuDifficultyHitObject): number {
        if (current.angle === null || last.angle === null) {
            return 1;
        }

        const angleDifference = Math.abs(current.angle - last.angle);
        const angleDifferenceAdjusted = Math.sin(angleDifference / 2) * 180;

        const angularVelocity =
            angleDifferenceAdjusted / (current.strainTime * 0.1);

        return 0.8 + Math.sqrt(angularVelocity / 270);
    }

    private static calculateAcuteAngleBonus(
        current: OsuDifficultyHitObject,
        prev: OsuDifficultyHitObject,
        prevPrev: OsuDifficultyHitObject,
        next: OsuDifficultyHitObject | null,
        currentVelocity: number
    ): number {
        if (current.angle === null || typeof next?.angle !== "number") {
            return 0;
        }

        const currentAcuteness = OsuSnapAimEvaluator.calculateAcuteAngleAcuteness(
            current.angle,
        );

        const nextAcuteness = OsuSnapAimEvaluator.calculateAcuteAngleAcuteness(
            next.angle,
        );

        let acuteness: number;
        let overlapWeight: number;

        // We want to evaluate flow turns at the center point of the actual turn, but current.angle is a prev2-prev-curr angle.
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
                prev,
                prevPrev,
            );
        } else {
            acuteness = nextAcuteness;

            overlapWeight = this.calculateOverlapWeight(
                next,
                current,
                prev,
            );
        }

        return currentVelocity * acuteness * overlapWeight * this.acuteAngleMultiplier;
    }

    private static calculateVelocityChangeBonus(
        current: OsuDifficultyHitObject,
        last: OsuDifficultyHitObject,
        currentVelocity: number,
        prevVelocity: number,
        currentDistance: number,
        overlappedNotesWeight: number,
        withSliders: boolean
    ): number {
        if (Math.max(prevVelocity, currentVelocity) === 0) {
            return 0;
        }

        if (withSliders) {
            currentVelocity = currentDistance / current.strainTime;
        }

        const velocityDistanceCap = current.normalizedDiameter * 1.1;

        currentVelocity = Math.min(currentVelocity, velocityDistanceCap / current.strainTime);
        prevVelocity = Math.min(prevVelocity, velocityDistanceCap / last.strainTime);

        // Scale with ratio of difference compared to 0.5 * max distance.
        const distanceRatio = MathUtils.smoothstep(
            Math.abs(prevVelocity - currentVelocity) /
                Math.max(prevVelocity, currentVelocity),
            0,
            1,
        );

        let velocityChangeBonus = Math.abs(prevVelocity - currentVelocity) * distanceRatio;

        velocityChangeBonus *= Math.pow(
            Math.min(current.strainTime, last.strainTime) /
                Math.max(current.strainTime, last.strainTime),
            3,
        )

        return (
            velocityChangeBonus *
            overlappedNotesWeight *
            this.velocityChangeMultiplier
        );
    }

    private static calculateSliderBonus(current: OsuDifficultyHitObject): number {
        return current.travelDistance / current.travelTime;
    }

    private static calculateCurrentVelocity(
        current: OsuDifficultyHitObject,
        prev: OsuDifficultyHitObject,
        currentDistance: number,
        withSliders: boolean
    ): number {
        let currentVelocity = currentDistance / current.strainTime;


        if (prev.object instanceof Slider && withSliders) {
            // If the last object is a slider, then we extend the travel velocity through the slider into the current object.
            const sliderDistance =
                prev.lazyTravelDistance + current.lazyJumpDistance;

            currentVelocity = Math.max(
                currentVelocity,
                sliderDistance / current.strainTime,
            );
        }

        return currentVelocity;
    }

    // If all three notes overlap, do not reward bonuses as there is no required additional movement.
    private static calculateOverlapWeight(
        first: OsuDifficultyHitObject,
        second: OsuDifficultyHitObject,
        third: OsuDifficultyHitObject
    ): number {
        const o1 = this.calculateOverlapFactor(first, second);
        const o2 = this.calculateOverlapFactor(first, third);
        const o3 = this.calculateOverlapFactor(second, third);

        return 1 - o1 * o2 * o3;
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
