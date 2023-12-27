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
     * - distance between those objects,
     * - how easily they can be cheesed,
     * - and the strain time cap.
     *
     * @param current The current object.
     * @param greatWindow The great hit window of the current object.
     * @param considerCheesability Whether to consider cheesability.
     * @param strainTimeCap The strain time to cap the object's strain time to.
     */
    static evaluateDifficultyOf(
        current: DroidDifficultyHitObject,
        greatWindow: number,
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

        let doubletapness: number = 1;

        if (considerCheesability) {
            // Nerf doubletappable doubles.
            const next: DroidDifficultyHitObject | null = current.next(0);

            if (next) {
                const greatWindowFull: number = greatWindow * 2;
                const currentDeltaTime: number = Math.max(1, current.deltaTime);
                const nextDeltaTime: number = Math.max(1, next.deltaTime);
                const deltaDifference: number = Math.abs(
                    nextDeltaTime - currentDeltaTime,
                );
                const speedRatio: number =
                    currentDeltaTime /
                    Math.max(currentDeltaTime, deltaDifference);
                const windowRatio: number = Math.pow(
                    Math.min(1, currentDeltaTime / greatWindowFull),
                    2,
                );
                doubletapness = Math.pow(speedRatio, 1 - windowRatio);
            }
        }

        const strainTime: number =
            strainTimeCap !== undefined
                ? // We cap the strain time to 50 here as the chance of vibro is higher in any BPM higher than 300.
                  Math.max(50, strainTimeCap, current.strainTime)
                : current.strainTime;
        let speedBonus: number = 1;

        if (strainTime < this.minSpeedBonus) {
            speedBonus +=
                0.75 *
                Math.pow(
                    ErrorFunction.erf((this.minSpeedBonus - strainTime) / 40),
                    2,
                );
        }

        return (speedBonus * Math.pow(doubletapness, 1.5)) / strainTime;
    }
}
