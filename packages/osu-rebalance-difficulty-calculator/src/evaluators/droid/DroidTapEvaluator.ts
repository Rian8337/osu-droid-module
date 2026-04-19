import { Spinner, ErrorFunction, MathUtils } from "@rian8337/osu-base";
import { DroidDifficultyHitObject } from "../../preprocessing/DroidDifficultyHitObject";

/**
 * An evaluator for calculating osu!droid tap skill.
 */
export abstract class DroidTapEvaluator {
    // ~200 1/4 BPM streams
    private static readonly minSpeedBonus = 200;

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
     */
    static evaluateDifficultyOf(
        current: DroidDifficultyHitObject,
        considerCheesability: boolean,
    ): number {
        if (
            current.index < 0 ||
            current.object instanceof Spinner ||
            // Exclude overlapping objects that can be tapped at once.
            current.isOverlapping(false)
        ) {
            return 0;
        }

        const doubletapness = considerCheesability
            ? 1 - current.getDoubletapness(current.next(0))
            : 1;

        let speedBonus = 1;

        if (
            MathUtils.millisecondsToBPM(current.strainTime) > this.minSpeedBonus
        ) {
            speedBonus +=
                0.75 *
                Math.pow(
                    ErrorFunction.erf(
                        (MathUtils.bpmToMilliseconds(this.minSpeedBonus) -
                            current.strainTime) /
                            40,
                    ),
                    2,
                );
        }

        let strain = (speedBonus * 1000) / current.strainTime;
        strain *= this.highBpmBonus(current.strainTime);

        return strain * Math.pow(doubletapness, 1.5);
    }

    private static highBpmBonus(ms: number): number {
        return 1 / (1 - Math.pow(0.3, ms / 1000));
    }
}
