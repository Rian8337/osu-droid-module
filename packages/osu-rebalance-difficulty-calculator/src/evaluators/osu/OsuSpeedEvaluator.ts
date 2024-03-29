import { MathUtils, Spinner } from "@rian8337/osu-base";
import { OsuDifficultyHitObject } from "../../preprocessing/OsuDifficultyHitObject";
import { SpeedEvaluator } from "../base/SpeedEvaluator";

/**
 * An evaluator for calculating osu!standard speed skill.
 */
export abstract class OsuSpeedEvaluator extends SpeedEvaluator {
    /**
     * Spacing threshold for a single hitobject spacing.
     */
    private static readonly SINGLE_SPACING_THRESHOLD: number = 125;

    /**
     * Evaluates the difficulty of tapping the current object, based on:
     *
     * - time between pressing the previous and current object,
     * - distance between those objects,
     * - and how easily they can be cheesed.
     *
     * @param current The current object.
     * @param greatWindow The great hit window of the current object.
     */
    static evaluateDifficultyOf(
        current: OsuDifficultyHitObject,
        greatWindow: number,
    ): number {
        if (current.object instanceof Spinner) {
            return 0;
        }

        const prev: OsuDifficultyHitObject | null = current.previous(0);

        let strainTime: number = current.strainTime;

        const greatWindowFull: number = greatWindow * 2;

        // Nerf doubletappable doubles.
        const next: OsuDifficultyHitObject | null = current.next(0);
        let doubletapness: number = 1;

        if (next) {
            const currentDeltaTime: number = Math.max(1, current.deltaTime);
            const nextDeltaTime: number = Math.max(1, next.deltaTime);
            const deltaDifference: number = Math.abs(
                nextDeltaTime - currentDeltaTime,
            );
            const speedRatio: number =
                currentDeltaTime / Math.max(currentDeltaTime, deltaDifference);
            const windowRatio: number = Math.pow(
                Math.min(1, currentDeltaTime / greatWindowFull),
                2,
            );
            doubletapness = Math.pow(speedRatio, 1 - windowRatio);
        }

        // Cap deltatime to the OD 300 hitwindow.
        // 0.93 is derived from making sure 260 BPM 1/4 OD8 streams aren't nerfed harshly, whilst 0.92 limits the effect of the cap.
        strainTime /= MathUtils.clamp(
            strainTime / greatWindowFull / 0.93,
            0.92,
            1,
        );

        let speedBonus: number = 1;
        if (strainTime < this.minSpeedBonus) {
            speedBonus +=
                0.75 * Math.pow((this.minSpeedBonus - strainTime) / 40, 2);
        }

        const travelDistance: number = prev?.travelDistance ?? 0;
        const distance: number = Math.min(
            this.SINGLE_SPACING_THRESHOLD,
            travelDistance + current.minimumJumpDistance,
        );

        return (
            ((speedBonus +
                speedBonus *
                    Math.pow(distance / this.SINGLE_SPACING_THRESHOLD, 3.5)) *
                doubletapness) /
            strainTime
        );
    }
}
