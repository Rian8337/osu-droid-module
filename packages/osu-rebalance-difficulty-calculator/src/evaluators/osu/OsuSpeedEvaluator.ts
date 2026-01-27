import { MathUtils, Spinner } from "@rian8337/osu-base";
import { OsuDifficultyHitObject } from "../../preprocessing/OsuDifficultyHitObject";

/**
 * An evaluator for calculating osu!standard speed skill.
 */
export abstract class OsuSpeedEvaluator {
    // ~200 1/4 BPM streams
    private static readonly minSpeedBonus = 75;

    /**
     * Evaluates the difficulty of tapping the current object, based on:
     *
     * - time between pressing the previous and current object,
     * - and how easily they can be cheesed.
     *
     * @param current The current object.
     */
    static evaluateDifficultyOf(current: OsuDifficultyHitObject): number {
        if (current.object instanceof Spinner) {
            return 0;
        }

        let strainTime = current.strainTime;

        // Nerf doubletappable doubles.
        const doubletapness = 1 - current.getDoubletapness(current.next(0));

        // Cap deltatime to the OD 300 hitwindow.
        // 0.93 is derived from making sure 260 BPM 1/4 OD8 streams aren't nerfed harshly, whilst 0.92 limits the effect of the cap.
        strainTime /= MathUtils.clamp(
            strainTime / current.fullGreatWindow / 0.93,
            0.92,
            1,
        );

        // speedBonus will be 0.0 for BPM < 200
        let speedBonus = 0;

        // Add additional scaling bonus for streams/bursts higher than 200bpm
        if (strainTime < this.minSpeedBonus) {
            speedBonus =
                0.75 * Math.pow((this.minSpeedBonus - strainTime) / 40, 2);
        }

        // Base difficulty with all bonuses
        let difficulty = ((1 + speedBonus) * 1000) / strainTime;

        difficulty *= this.highBpmBonus(current.strainTime);

        // Apply penalty if there's doubletappable doubles
        return difficulty * doubletapness;
    }

    private static highBpmBonus(ms: number): number {
        return 1 / (1 - Math.pow(0.3, ms / 1000));
    }
}
