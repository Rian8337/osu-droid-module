import {
    Spinner,
    ErrorFunction,
    MathUtils,
    HitResult,
} from "@rian8337/osu-base";
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
            current.object instanceof Spinner ||
            // Exclude overlapping objects that can be tapped at once.
            current.isOverlapping(false)
        ) {
            return 0;
        }

        const doubletapness = considerCheesability
            ? 1 - current.getDoubletapness(current.next(0))
            : 1;

        let difficulty = MathUtils.millisecondsToBPM(current.strainTime);

        difficulty *= this.calculateSpeedBonus(current);

        // Apply penalty if there's doubletappable doubles
        return difficulty * doubletapness;
    }

    private static calculateSpeedBonus(current: DroidDifficultyHitObject): number {
        let { strainTime } = current;

        // Cap deltatime to the OD 300 hitwindow.
        // 0.63 is derived from making sure 200 BPM 1/4 OD8 streams aren't nerfed harshly, whilst 0.92 limits the effect of the cap.
        strainTime /= MathUtils.clamp(
            strainTime / current.hitWindowFor(HitResult.Great) / 0.63,
            0.92,
            1,
        );

        // speedBonus will be 0 for BPM < 200
        let speedBonus = 0;

        // Add additional scaling bonus for streams/bursts higher than 200bpm
        if (MathUtils.millisecondsToBPM(strainTime) > this.minSpeedBonus) {
            speedBonus =
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

        return (1 + speedBonus) / strainTime;
    }
}
