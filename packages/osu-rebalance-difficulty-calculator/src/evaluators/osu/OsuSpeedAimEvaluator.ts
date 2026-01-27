import { Spinner } from "@rian8337/osu-base";
import { OsuDifficultyHitObject } from "../../preprocessing/OsuDifficultyHitObject";

/**
 * An evaluator for calculating osu!standard speed aim difficulty.
 */
export abstract class OsuSpeedAimEvaluator {
    /**
     * Spacing threshold for a single hitobject spacing.
     *
     * About 1.25 circles distance between hitobject centers.
     */
    private static readonly singleSpacingThreshold =
        OsuDifficultyHitObject.normalizedDiameter * 1.25;

    /// <summary>
    /// Evaluates the difficulty of aiming the current object, based on:
    /// <list type="bullet">
    /// <item><description>distance between the previous and current object</description></item>
    /// </list>
    /// </summary>
    /**
     * Evaluates the difficulty of aiming the current object, based on:
     *
     * - distance between the previous and current object.
     *
     * @param current The current object.
     */
    static evaluateDifficultyOf(current: OsuDifficultyHitObject): number {
        if (current.object instanceof Spinner) {
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
