import { Spinner } from "@rian8337/osu-base";
import { DroidDifficultyHitObject } from "../../preprocessing/DroidDifficultyHitObject";

/**
 * An evaluator for calculating osu!droid flow aim difficulty.
 */
export abstract class DroidFlowAimEvaluator {
    private static readonly singleSpacingThreshold =
        DroidDifficultyHitObject.normalizedDiameter;

    // 200 1/4 BPM delta time
    private static readonly minSpeedBonus = 75;

    /**
     * Evaluates the difficulty of aiming the current object, based on:
     *
     * - the distance between the current object and the previous object.
     * - the time elapsed between the current object and the previous object.
     *
     * @param current The current object.
     */
    static evaluateDifficultyOf(current: DroidDifficultyHitObject): number {
        if (
            current.object instanceof Spinner ||
            // Exclude overlapping objects that can be tapped at once.
            current.isOverlapping(true)
        ) {
            return 0;
        }

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

        return (
            (200 *
                speedBonus *
                shortDistancePenalty *
                // Apply reduced small circle bonus for flow aim difficulty since it does not scale as hard as snap aim.
                Math.sqrt(current.smallCircleBonus)) /
            current.strainTime
        );
    }
}
