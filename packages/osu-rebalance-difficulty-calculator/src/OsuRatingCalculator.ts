import {
    Interpolation,
    MathUtils,
    ModAutopilot,
    ModDeflate,
    ModFlashlight,
    ModMagnetised,
    ModMap,
    ModRelax,
    ModTouchDevice,
} from "@rian8337/osu-base";

export class OsuRatingCalculator {
    private static readonly difficultyMultiplier = 0.0675;

    constructor(
        private readonly mods: ModMap,
        private readonly totalHits: number,
        private readonly overallDifficulty: number,
    ) {}

    computeAimRating(aimDifficultyValue: number): number {
        if (this.mods.has(ModAutopilot)) {
            return 0;
        }

        let aimRating =
            OsuRatingCalculator.calculateDifficultyRating(aimDifficultyValue);

        if (this.mods.has(ModRelax)) {
            aimRating *= 0.9;
        }

        if (this.mods.has(ModMagnetised)) {
            const magnetisedStrength =
                this.mods.get(ModMagnetised)!.attractionStrength.value;

            aimRating *= 1 - magnetisedStrength;
        }

        let ratingMultiplier = 1;

        // It is important to consider accuracy difficulty when scaling with accuracy.
        ratingMultiplier *=
            0.98 + Math.pow(Math.max(0, this.overallDifficulty), 2) / 2500;

        return aimRating * Math.cbrt(ratingMultiplier);
    }

    computeSpeedRating(speedDifficultyValue: number): number {
        if (this.mods.has(ModRelax)) {
            return 0;
        }

        let speedRating =
            OsuRatingCalculator.calculateDifficultyRating(speedDifficultyValue);

        if (this.mods.has(ModAutopilot)) {
            speedRating *= 0.5;
        }

        if (this.mods.has(ModMagnetised)) {
            // Reduce speed rating because of the distance scaling, with maximum reduction being 0.7.
            const magnetisedStrength =
                this.mods.get(ModMagnetised)!.attractionStrength.value;

            speedRating *= 1 - magnetisedStrength * 0.3;
        }

        let ratingMultiplier = 1;

        ratingMultiplier *=
            0.95 + Math.pow(Math.max(0, this.overallDifficulty), 2) / 750;

        return speedRating * Math.cbrt(ratingMultiplier);
    }

    computeFlashlightRating(flashlightDifficultyValue: number): number {
        if (!this.mods.has(ModFlashlight)) {
            return 0;
        }

        let flashlightRating = OsuRatingCalculator.calculateDifficultyRating(
            flashlightDifficultyValue,
        );

        if (this.mods.has(ModTouchDevice)) {
            flashlightRating = Math.pow(flashlightRating, 0.8);
        }

        if (this.mods.has(ModRelax)) {
            flashlightRating *= 0.7;
        } else if (this.mods.has(ModAutopilot)) {
            flashlightRating *= 0.4;
        }

        if (this.mods.has(ModMagnetised)) {
            const magnetisedStrength =
                this.mods.get(ModMagnetised)!.attractionStrength.value;

            flashlightRating *= 1 - magnetisedStrength;
        }

        if (this.mods.has(ModDeflate)) {
            const deflateInitialScale =
                this.mods.get(ModDeflate)!.startScale.value;

            flashlightRating *= MathUtils.clamp(
                Interpolation.reverseLerp(deflateInitialScale, 11, 1),
                0.1,
                1,
            );
        }

        let ratingMultiplier = 1;

        // Account for shorter maps having a higher ratio of 0 combo/100 combo flashlight radius.
        ratingMultiplier *=
            0.7 +
            0.1 * Math.min(1, this.totalHits / 200) +
            (this.totalHits > 200
                ? 0.2 * Math.min(1, (this.totalHits - 200) / 200)
                : 0);

        // It is important to consider accuracy difficulty when scaling with accuracy.
        ratingMultiplier *=
            0.98 + Math.pow(Math.max(0, this.overallDifficulty), 2) / 2500;

        return flashlightRating * Math.sqrt(ratingMultiplier);
    }

    computeReadingRating(readingDifficultyValue: number): number {
        let readingRating = OsuRatingCalculator.calculateDifficultyRating(
            readingDifficultyValue,
        );

        if (this.mods.has(ModTouchDevice)) {
            readingRating = Math.pow(readingRating, 0.8);
        }

        if (this.mods.has(ModRelax)) {
            readingRating *= 0.7;
        } else if (this.mods.has(ModAutopilot)) {
            readingRating *= 0.4;
        }

        if (this.mods.has(ModMagnetised)) {
            const magnetisedStrength =
                this.mods.get(ModMagnetised)!.attractionStrength.value;

            readingRating *= 1 - magnetisedStrength;
        }

        let ratingMultiplier = 1;

        ratingMultiplier *=
            0.75 + Math.pow(Math.max(0, this.overallDifficulty), 2.2) / 800;

        return readingRating * Math.cbrt(ratingMultiplier);
    }

    static calculateDifficultyRating(difficultyValue: number): number {
        return Math.sqrt(difficultyValue) * this.difficultyMultiplier;
    }
}
