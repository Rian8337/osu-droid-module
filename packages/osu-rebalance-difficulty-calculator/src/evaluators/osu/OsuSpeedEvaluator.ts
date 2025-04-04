import { MathUtils, ModAutopilot, ModMap, Spinner } from "@rian8337/osu-base";
import { OsuDifficultyHitObject } from "../../preprocessing/OsuDifficultyHitObject";

/**
 * An evaluator for calculating osu!standard speed skill.
 */
export abstract class OsuSpeedEvaluator {
    /**
     * Spacing threshold for a single hitobject spacing.
     *
     * About 1.25 circles distance between hitobject centers.
     */
    private static readonly SINGLE_SPACING_THRESHOLD = 125;

    // ~200 1/4 BPM streams
    private static readonly minSpeedBonus = 75;

    private static readonly DISTANCE_MULTIPLIER = 0.9;

    /**
     * Evaluates the difficulty of tapping the current object, based on:
     *
     * - time between pressing the previous and current object,
     * - distance between those objects,
     * - and how easily they can be cheesed.
     *
     * @param current The current object.
     * @param mods The mods applied.
     */
    static evaluateDifficultyOf(
        current: OsuDifficultyHitObject,
        mods: ModMap,
    ): number {
        if (current.object instanceof Spinner) {
            return 0;
        }

        const prev = current.previous(0);
        let strainTime = current.strainTime;

        // Nerf doubletappable doubles.
        const doubletapness = 1 - current.doubletapness;

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

        const travelDistance = prev?.travelDistance ?? 0;

        // Cap distance at spacing threshold
        const distance = Math.min(
            this.SINGLE_SPACING_THRESHOLD,
            travelDistance + current.minimumJumpDistance,
        );

        // Max distance bonus is 1 * `distance_multiplier` at single_spacing_threshold
        let distanceBonus =
            Math.pow(distance / this.SINGLE_SPACING_THRESHOLD, 3.95) *
            this.DISTANCE_MULTIPLIER;

        if (mods.has(ModAutopilot)) {
            distanceBonus = 0;
        }

        // Base difficulty with all bonuses
        const difficulty =
            ((1 + speedBonus + distanceBonus) * 1000) / strainTime;

        // Apply penalty if there's doubletappable doubles
        return difficulty * doubletapness;
    }
}
