import { HitResult, MathUtils, Spinner } from "@rian8337/osu-base";
import { OsuDifficultyHitObject } from "../../preprocessing/OsuDifficultyHitObject";

/**
 * An evaluator for calculating osu!standard speed skill.
 */
export abstract class OsuSpeedEvaluator {
    // ~200 1/4 BPM streams
    private static readonly minSpeedBonus = 200;

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

        const doubletapness = 1 - current.getDoubletapness(current.next(0));

        let difficulty = MathUtils.millisecondsToBPM(current.strainTime);

        difficulty *= this.calculateSpeedBonus(current);

        // Apply penalty if there's doubletappable doubles
        return difficulty * doubletapness;
    }

    private static calculateSpeedBonus(current: OsuDifficultyHitObject): number {
        let { strainTime } = current;

        // Cap deltatime to the OD 300 hitwindow.
        // 0.93 is derived from making sure 260 BPM 1/4 OD8 streams aren't nerfed harshly, whilst 0.92 limits the effect of the cap.
        strainTime /= MathUtils.clamp(
            strainTime / current.hitWindowFor(HitResult.Great) / 0.93,
            0.92,
            1,
        );

        // speedBonus will be 0.0 for BPM < 200
        let speedBonus = 0;

        // Add additional scaling bonus for streams/bursts higher than 200bpm
        if (MathUtils.millisecondsToBPM(strainTime) > this.minSpeedBonus) {
            speedBonus =
                0.75 *
                Math.pow(
                    (MathUtils.bpmToMilliseconds(this.minSpeedBonus) -
                        strainTime) /
                        40,
                    2,
                );
        }

        return (1 + speedBonus) / strainTime;
    }
}
