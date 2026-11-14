import { ErrorFunction, MathUtils, Spinner } from "@rian8337/osu-base";
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
            (current.object instanceof Spinner && current.object.spinsRequired <= 0) ||
            // Exclude overlapping objects that can be tapped at once.
            current.isOverlapping(false)
        ) {
            return 0;
        }

        const next = current.next(0);
        let deltaTime = current.strainTime;

        if (next && considerCheesability) {
            // If the current and next object are a doubletappable double, then we want
            // to partially combine their delta times to treat it as a single press.
            const doubletapness = current.getDoubletapness(next);

            deltaTime += next.strainTime * doubletapness * 0.2;
        }

        return (
            MathUtils.millisecondsToBPM(deltaTime) *
            this.calculateSpeedBonus(deltaTime)
        );
    }

    private static calculateSpeedBonus(deltaTime: number): number {
        // speedBonus will be 0 for BPM < 200
        let speedBonus = 0;

        // Add additional scaling bonus for streams/bursts higher than 200bpm
        if (MathUtils.millisecondsToBPM(deltaTime) > this.minSpeedBonus) {
            speedBonus =
                0.75 *
                Math.pow(
                    ErrorFunction.erf(
                        (MathUtils.bpmToMilliseconds(this.minSpeedBonus) -
                            deltaTime) /
                            40,
                    ),
                    2,
                );
        }

        return (1 + speedBonus) / deltaTime;
    }
}
