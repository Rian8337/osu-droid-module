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
     * @param singletapped Whether to assume that the object was singletapped.
     * @param strainTimeCap The strain time to cap the object's strain time to.
     */
    static evaluateDifficultyOf(
        current: DroidDifficultyHitObject,
        greatWindow: number,
        considerCheesability: boolean,
        singletapped: boolean,
        strainTimeCap?: number,
    ): number {
        if (
            current.object instanceof Spinner ||
            // Exclude overlapping objects that can be tapped at once.
            current.isOverlapping(false)
        ) {
            return 0;
        }

        let doubletapness = 1;

        if (considerCheesability) {
            // Nerf doubletappable doubles.
            const next = current.next(0);

            if (next) {
                const greatWindowFull = greatWindow * 2;
                const currentDeltaTime = Math.max(1, current.deltaTime);
                const nextDeltaTime = Math.max(1, next.deltaTime);
                const deltaDifference = Math.abs(
                    nextDeltaTime - currentDeltaTime,
                );
                const speedRatio =
                    currentDeltaTime /
                    Math.max(currentDeltaTime, deltaDifference);
                const windowRatio = Math.pow(
                    Math.min(1, currentDeltaTime / greatWindowFull),
                    2,
                );
                doubletapness = Math.pow(speedRatio, 1 - windowRatio);
            }
        }

        let effectiveStrainTime = singletapped
            ? current.strainTime / 2
            : current.strainTime;

        if (strainTimeCap !== undefined) {
            // We cap the strain time to 50 here as the chance of vibro is higher in any BPM higher than 300.
            effectiveStrainTime = Math.max(
                50,
                strainTimeCap,
                effectiveStrainTime,
            );
        }

        let speedBonus: number = 1;

        if (effectiveStrainTime < this.minSpeedBonus) {
            speedBonus +=
                0.75 *
                Math.pow(
                    ErrorFunction.erf(
                        (this.minSpeedBonus - effectiveStrainTime) / 40,
                    ),
                    2,
                );
        }

        return (
            (speedBonus * Math.pow(doubletapness, 1.5)) / effectiveStrainTime
        );
    }
}
