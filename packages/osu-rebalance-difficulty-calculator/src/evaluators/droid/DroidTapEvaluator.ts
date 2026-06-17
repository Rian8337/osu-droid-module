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
     * @param strainTimeMultiplier Optional multiplier applied to the strain time before all calculations. Used by touch device evaluator to halve the doubled per-hand strain time.
     */
    static evaluateDifficultyOf(
        current: DroidDifficultyHitObject,
        considerCheesability: boolean,
        strainTimeMultiplier = 1,
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

        const strainTime = current.strainTime * strainTimeMultiplier;

        let speedBonus = 1;

        if (MathUtils.millisecondsToBPM(strainTime) > this.minSpeedBonus) {
            speedBonus +=
                0.75 *
                Math.pow(
                    ErrorFunction.erf(
                        (MathUtils.bpmToMilliseconds(this.minSpeedBonus) -
                            strainTime) /
                            40,
                    ),
                    2,
                );
        }

        let strain = (speedBonus * 1000) / strainTime;
        strain *= this.highBpmBonus(strainTime);

        return strain * Math.pow(doubletapness, 1.5);
    }

    private static highBpmBonus(ms: number): number {
        return 1 / (1 - Math.pow(0.3, ms / 1000));
    }
}
