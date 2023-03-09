import { Spinner, MathUtils, ErrorFunction } from "@rian8337/osu-base";
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
        considerCheesability: boolean
    ): number {
        if (
            current.object instanceof Spinner ||
            // Exclude overlapping objects that can be tapped at once.
            current.isOverlapping(false)
        ) {
            return 0;
        }

        let strainTime: number = current.strainTime;
        let doubletapness: number = 1;

        if (considerCheesability) {
            const greatWindowFull: number = greatWindow * 2;

            // Nerf doubletappable doubles.
            const next: DifficultyHitObject | null = current.next(0);

            if (next) {
                const currentDeltaTime: number = Math.max(1, current.deltaTime);
                const nextDeltaTime: number = Math.max(1, next.deltaTime);
                const deltaDifference: number = Math.abs(
                    nextDeltaTime - currentDeltaTime
                );
                const speedRatio: number =
                    currentDeltaTime /
                    Math.max(currentDeltaTime, deltaDifference);
                const windowRatio: number = Math.pow(
                    Math.min(1, currentDeltaTime / greatWindowFull),
                    2
                );
                doubletapness = Math.pow(speedRatio, 1 - windowRatio);
            }

            // Cap deltatime to the OD 300 hitwindow.
            // 0.63 is derived from making sure 240 BPM 1/4 OD5 streams aren't nerfed harshly, whilst 0.9 limits the effect of the cap.
            strainTime /= MathUtils.clamp(
                strainTime / greatWindowFull / 0.63,
                0.9,
                1
            );
        }

        let speedBonus: number = 1;

        if (strainTime < this.minSpeedBonus) {
            speedBonus +=
                0.75 *
                Math.pow(
                    ErrorFunction.erf((this.minSpeedBonus - strainTime) / 40),
                    2
                );
        }

        return (speedBonus * doubletapness) / strainTime;
    }
}
