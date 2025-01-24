import { Spinner, ErrorFunction } from "@rian8337/osu-base";
import { SpeedEvaluator } from "../base/SpeedEvaluator";
import { DroidDifficultyHitObject } from "../../preprocessing/DroidDifficultyHitObject";

/**
 * An evaluator for calculating osu!droid tap skill.
 */
export abstract class DroidTapEvaluator extends SpeedEvaluator {
    /**
     * Evaluates the difficulty of tapping the current object, based on:
     *
     * - time between pressing the previous and current object,
     * - how easily they can be cheesed,
     * - and the strain time cap.
     *
     * @param current The current object.
     * @param considerCheesability Whether to consider cheesability.
     */
    static evaluateDifficultyOf(
        current: DroidDifficultyHitObject,
        considerCheesability: boolean,
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

        let speedBonus = 1;

        if (current.strainTime < this.minSpeedBonus) {
            speedBonus +=
                0.75 *
                Math.pow(
                    ErrorFunction.erf(
                        (this.minSpeedBonus - current.strainTime) / 40,
                    ),
                    2,
                );
        }

        return (
            (speedBonus * Math.pow(doubletapness, 1.5) * 1000) /
            current.strainTime
        );
    }
}
