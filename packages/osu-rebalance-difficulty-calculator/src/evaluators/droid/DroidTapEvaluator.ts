import { Spinner, Interpolation, MathUtils } from "@rian8337/osu-base";
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
            current.deltaTime < 5
        ) {
            return 0;
        }

        const prev: DifficultyHitObject | null = current.previous(0);

        let strainTime: number = current.strainTime;

        if (considerCheesability) {
            const greatWindowFull: number = greatWindow * 2;

            // Aim to nerf cheesy rhythms (very fast consecutive doubles with large deltatimes between).
            if (
                prev &&
                strainTime < greatWindowFull &&
                prev.strainTime > strainTime
            ) {
                strainTime = Interpolation.lerp(
                    prev.strainTime,
                    strainTime,
                    strainTime / greatWindowFull
                );
            }

            // Cap deltatime to the OD 300 hitwindow.
            // 0.58 is derived from making sure 260 BPM 1/4 OD5 streams aren't nerfed harshly, whilst 0.91 limits the effect of the cap.
            strainTime /= MathUtils.clamp(
                strainTime / greatWindowFull / 0.58,
                0.91,
                1
            );
        }

        let speedBonus: number = 1;

        if (strainTime < this.minSpeedBonus) {
            speedBonus +=
                0.75 * Math.pow((this.minSpeedBonus - strainTime) / 40, 2);
        }

        return speedBonus / strainTime;
    }
}
