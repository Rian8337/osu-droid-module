import { Spinner } from "@rian8337/osu-base";
import { DroidDifficultyHitObject } from "../../preprocessing/DroidDifficultyHitObject";
import { DroidAimEvaluator } from "./DroidAimEvaluator";

/**
 * An evaluator for calculating osu!droid flow aim skill.
 */
export abstract class DroidFlowAimEvaluator extends DroidAimEvaluator {
    private static readonly singleSpacingThreshold: number = 100;

    // 200 1/4 BPM delta time
    private static readonly minSpeedBonus: number = 75;

    /**
     * Evaluates the difficulty of aiming the current object, based on:
     *
     * - time between pressing the previous and current object,
     * - and distance between those objects.
     *
     * @param current The current object.
     * @param withSliders Whether to take slider difficulty into account.
     */
    static evaluateDifficultyOf(current: DroidDifficultyHitObject): number {
        if (
            current.object instanceof Spinner ||
            // Exclude overlapping objects that can be tapped at once.
            current.isOverlapping(false)
        ) {
            return 0;
        }

        let speedBonus: number = 1;

        if (current.strainTime < this.minSpeedBonus) {
            speedBonus +=
                0.75 *
                Math.pow((this.minSpeedBonus - current.strainTime) / 40, 2);
        }

        const travelDistance: number = current.previous(0)?.travelDistance ?? 0;
        const shortDistancePenalty: number = Math.pow(
            Math.min(
                this.singleSpacingThreshold,
                travelDistance + current.minimumJumpDistance,
            ) / this.singleSpacingThreshold,
            3.5,
        );

        return (200 * speedBonus * shortDistancePenalty) / current.strainTime;
    }
}
