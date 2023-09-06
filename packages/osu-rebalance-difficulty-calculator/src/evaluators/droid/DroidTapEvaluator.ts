import { Spinner, ErrorFunction } from "@rian8337/osu-base";
import { DifficultyHitObject } from "../../preprocessing/DifficultyHitObject";
import { SpeedEvaluator } from "../base/SpeedEvaluator";

/**
 * An evaluator for calculating osu!droid tap skill.
 */
export abstract class DroidTapEvaluator extends SpeedEvaluator {
    /**
     * Evaluates the difficulty of tapping the current object, based on:
     *
     * - time between pressing the previous and current object,
     * - distance between those objects,
     * - and how easily they can be cheesed.
     *
     * @param current The current object.
     * @param greatWindow The great hit window of the current object.
     * @param considerCheesability Whether to consider cheesability.
     */
    static evaluateDifficultyOf(
        current: DifficultyHitObject,
        greatWindow: number,
        considerCheesability: boolean,
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
            const next: DifficultyHitObject | null = current.next(0);

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

        let speedBonus: number = 1;

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

        return (speedBonus * Math.pow(doubletapness, 1.5)) / current.strainTime;
    }
}
