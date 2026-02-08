import { Spinner } from "@rian8337/osu-base";
import { DroidDifficultyHitObject } from "../../preprocessing/DroidDifficultyHitObject";

/**
 * An evaluator for calculating osu!droid speed aim difficulty.
 */
export abstract class DroidSpeedAimEvaluator {
    /**
     * Spacing threshold for a single hitobject spacing.
     *
     * About 1.25 circles distance between hitobject centers.
     */
    static readonly singleSpacingThreshold =
        DroidDifficultyHitObject.normalizedDiameter * 1.25;

    /**
     * Evaluates the difficulty of aiming the current object, based on:
     *
     * - distance between the previous and current object.
     *
     * @param current The current object.
     */
    static evaluateDifficultyOf(current: DroidDifficultyHitObject): number {
        if (current.index < 0 || current.object instanceof Spinner) {
            return 0;
        }

        const prev = current.previous(0);

        const travelDistance = prev?.lazyTravelDistance ?? 0;
        let distance = travelDistance + current.lazyJumpDistance;

        // Cap distance at single_spacing_threshold
        distance = Math.min(distance, this.singleSpacingThreshold);

        // Max distance bonus is 1 * `distance_multiplier` at single_spacing_threshold
        let distanceBonus = Math.pow(
            distance / this.singleSpacingThreshold,
            3.95,
        );

        // Apply reduced small circle bonus because flow aim difficulty on small circles doesn't scale as hard as jumps
        distanceBonus *= Math.sqrt(current.smallCircleBonus);

        let strain = (distanceBonus * 1000) / current.strainTime;

        strain *= this.highBpmBonus(current.strainTime);

        return strain;
    }

    private static highBpmBonus(ms: number): number {
        return 1 / (1 - Math.pow(0.3, ms / 1000));
    }
}
