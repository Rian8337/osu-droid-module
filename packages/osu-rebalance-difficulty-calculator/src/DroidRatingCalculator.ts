import {
    ModAutopilot,
    ModFlashlight,
    ModMap,
    ModRelax,
} from "@rian8337/osu-base";

export class DroidRatingCalculator {
    private static readonly mechanicalDifficultyMultiplier = 0.18;
    private static readonly cognitionDifficultyMultiplier = 0.0675;

    constructor(
        private readonly mods: ModMap,
        private readonly totalHits: number,
    ) {}

    computeAimRating(aimDifficultyValue: number): number {
        if (this.mods.has(ModAutopilot)) {
            return 0;
        }

        let aimRating =
            DroidRatingCalculator.calculateMechanicalDifficultyRating(
                aimDifficultyValue,
            );

        if (this.mods.has(ModRelax)) {
            aimRating *= 0.9;
        }

        return aimRating;
    }

    computeTapRating(tapDifficultyValue: number): number {
        if (this.mods.has(ModRelax)) {
            return 0;
        }

        const tapRating =
            DroidRatingCalculator.calculateMechanicalDifficultyRating(
                tapDifficultyValue,
            );

        return tapRating;
    }

    computeFlashlightRating(flashlightDifficultyValue: number): number {
        if (!this.mods.has(ModFlashlight)) {
            return 0;
        }

        let flashlightRating =
            DroidRatingCalculator.calculateMechanicalDifficultyRating(
                flashlightDifficultyValue,
            );

        if (this.mods.has(ModRelax)) {
            flashlightRating *= 0.7;
        } else if (this.mods.has(ModAutopilot)) {
            flashlightRating *= 0.4;
        }

        let ratingMultiplier = 1;

        // Account for shorter maps having a higher ratio of 0 combo/100 combo flashlight radius.
        ratingMultiplier *=
            0.7 +
            0.1 * Math.min(1, this.totalHits / 200) +
            (this.totalHits > 200
                ? 0.2 * Math.min(1, (this.totalHits - 200) / 200)
                : 0);

        return flashlightRating * Math.sqrt(ratingMultiplier);
    }

    computeReadingRating(readingDifficultyValue: number): number {
        let readingRating =
            DroidRatingCalculator.calculateCognitionDifficultyRating(
                readingDifficultyValue,
            );

        if (this.mods.has(ModRelax)) {
            readingRating *= 0.7;
        } else if (this.mods.has(ModAutopilot)) {
            readingRating *= 0.4;
        }

        return readingRating;
    }

    static calculateMechanicalDifficultyRating(
        difficultyValue: number,
    ): number {
        return Math.sqrt(difficultyValue) * this.mechanicalDifficultyMultiplier;
    }

    static calculateCognitionDifficultyRating(difficultyValue: number): number {
        return Math.sqrt(difficultyValue) * this.cognitionDifficultyMultiplier;
    }
}
