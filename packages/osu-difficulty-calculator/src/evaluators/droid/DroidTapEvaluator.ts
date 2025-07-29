import { Spinner, ErrorFunction } from "@rian8337/osu-base";
import { DroidDifficultyHitObject } from "../../preprocessing/DroidDifficultyHitObject";

/**
 * An evaluator for calculating osu!droid tap skill.
 */
export abstract class DroidTapEvaluator {
    // ~200 1/4 BPM streams
    private static readonly minSpeedBonus = 75;

    /**
     * Evaluates the difficulty of tapping the current object, based on:
     *
     * - time between pressing the previous and current object,
     * - distance between those objects,
     * - how easily they can be cheesed,
     * - and the strain time cap.
     *
     * @param current The current object.
     * @param considerCheesability Whether to consider cheesability.
     * @param strainTimeCap The strain time to cap the object's strain time to.
     */
    static evaluateDifficultyOf(
        current: DroidDifficultyHitObject,
        considerCheesability: boolean,
        strainTimeCap?: number,
    ): number {
        if (
            current.object instanceof Spinner ||
            // Exclude overlapping objects that can be tapped at once.
            current.isOverlapping(false)
        ) {
            return 0;
        }

        const doubletapness = considerCheesability
            ? 1 - current.doubletapness
            : 1;

        const strainTime =
            strainTimeCap !== undefined
                ? // We cap the strain time to 50 here as the chance of vibro is higher in any BPM higher than 300.
                  Math.max(50, strainTimeCap, current.strainTime)
                : current.strainTime;
        let speedBonus = 1;

        if (strainTime < this.minSpeedBonus) {
            speedBonus +=
                0.75 *
                Math.pow(
                    ErrorFunction.erf((this.minSpeedBonus - strainTime) / 40),
                    2,
                );
        }

        return (speedBonus * Math.pow(doubletapness, 1.5) * 1000) / strainTime;
    }
}
