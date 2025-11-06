import {
    Interpolation,
    MathUtils,
    ModAutopilot,
    ModDeflate,
    ModFlashlight,
    ModHidden,
    ModMagnetised,
    ModMap,
    ModRelax,
    ModTouchDevice,
    ModTraceable,
} from "@rian8337/osu-base";

export class OsuRatingCalculator {
    private static readonly difficultyMultiplier = 0.0675;

    constructor(
        private readonly mods: ModMap,
        private readonly totalHits: number,
        private readonly approachRate: number,
        private readonly overallDifficulty: number,
        private readonly mechanicalDifficultyRating: number,
        private readonly sliderFactor: number,
    ) {}

    computeAimRating(aimDifficultyValue: number): number {
        if (this.mods.has(ModAutopilot)) {
            return 0;
        }

        let aimRating =
            OsuRatingCalculator.calculateDifficultyRating(aimDifficultyValue);

        if (this.mods.has(ModTouchDevice)) {
            aimRating = Math.pow(aimRating, 0.8);
        }

        if (this.mods.has(ModRelax)) {
            aimRating *= 0.9;
        }

        if (this.mods.has(ModMagnetised)) {
            const magnetisedStrength =
                this.mods.get(ModMagnetised)!.attractionStrength.value;

            aimRating *= 1 - magnetisedStrength;
        }

        let ratingMultiplier = 1;

        const approachRateLengthBonus =
            0.95 +
            0.4 * Math.min(1, this.totalHits / 2000) +
            (this.totalHits > 2000
                ? Math.log10(this.totalHits / 2000) * 0.5
                : 0);

        let approachRateFactor = 0;

        if (this.approachRate > 10.33) {
            approachRateFactor = 0.3 * (this.approachRate - 10.33);
        } else if (this.approachRate < 8) {
            approachRateFactor = 0.05 * (8 - this.approachRate);
        }

        if (this.mods.has(ModRelax)) {
            approachRateFactor = 0;
        }

        // Buff for longer beatmaps with high AR.
        ratingMultiplier += approachRateFactor * approachRateLengthBonus;

        if (this.mods.has(ModHidden)) {
            const visibilityFactor = this.calculateAimVisibilityFactor();

            ratingMultiplier += OsuRatingCalculator.calculateVisibilityBonus(
                this.mods,
                this.approachRate,
                visibilityFactor,
                this.sliderFactor,
            );
        }

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

        const approachRateLengthBonus =
            0.95 +
            0.4 * Math.min(1, this.totalHits / 2000) +
            (this.totalHits > 2000
                ? Math.log10(this.totalHits / 2000) * 0.5
                : 0);

        let approachRateFactor = 0;

        if (this.approachRate > 10.33) {
            approachRateFactor = 0.3 * (this.approachRate - 10.33);
        }

        if (this.mods.has(ModAutopilot)) {
            approachRateFactor = 0;
        }

        // Buff for longer beatmaps with high AR.
        ratingMultiplier += approachRateFactor * approachRateLengthBonus;

        if (this.mods.has(ModHidden)) {
            const visibilityFactor = this.calculateSpeedVisibilityFactor();

            ratingMultiplier += OsuRatingCalculator.calculateVisibilityBonus(
                this.mods,
                this.approachRate,
                visibilityFactor,
                this.sliderFactor,
            );
        }

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

    private calculateAimVisibilityFactor(): number {
        const approachRateFactorEndpoint = 11.5;

        const mechanicalDifficultyFactor = Interpolation.reverseLerp(
            this.mechanicalDifficultyRating,
            5,
            10,
        );

        const approachRateFactorStartingPoint = Interpolation.lerp(
            9,
            10.33,
            mechanicalDifficultyFactor,
        );

        return Interpolation.reverseLerp(
            this.approachRate,
            approachRateFactorEndpoint,
            approachRateFactorStartingPoint,
        );
    }

    private calculateSpeedVisibilityFactor(): number {
        const approachRateFactorEndpoint = 11.5;

        const mechanicalDifficultyFactor = Interpolation.reverseLerp(
            this.mechanicalDifficultyRating,
            5,
            10,
        );

        const approachRateFactorStartingPoint = Interpolation.lerp(
            10,
            10.33,
            mechanicalDifficultyFactor,
        );

        return Interpolation.reverseLerp(
            this.approachRate,
            approachRateFactorEndpoint,
            approachRateFactorStartingPoint,
        );
    }

    /**
     * Calculates a visibility bonus that is applicable to Hidden and Traceable.
     *
     * @param mods The mods applied to the calculation.
     * @param approachRate The approach rate of the beatmap.
     * @param visibilityFactor The visibility factor to apply.
     * @param sliderFactor The slider factor to apply.
     * @returns The visibility bonus multiplier.
     */
    static calculateVisibilityBonus(
        mods: ModMap,
        approachRate: number,
        visibilityFactor = 1,
        sliderFactor = 1,
    ): number {
        const isAlwaysPartiallyVisible =
            mods.get(ModHidden)?.onlyFadeApproachCircles.value ??
            mods.has(ModTraceable);

        // Start from normal curve, rewarding lower AR up to AR 7.
        // Traceable forcefully requires a lower reading bonus for now as it is post-applied in pp, which make
        // it multiplicative with the regular AR bonuses.
        // This means it has an advantage over Hidden, so we decrease the multiplier to compensate.
        // This should be removed once we are able to apply Traceable bonuses in star rating (requires real-time
        // difficulty calculations being possible).
        let readingBonus =
            (isAlwaysPartiallyVisible ? 0.025 : 0.04) *
            (12 - Math.max(approachRate, 7));

        readingBonus *= visibilityFactor;

        // We want to reward slideraim on low AR less.
        const sliderVisibilityFactor = Math.pow(sliderFactor, 3);

        // For AR up to 0, reduce reward for very low ARs when object is visible.
        if (approachRate < 7) {
            readingBonus +=
                (isAlwaysPartiallyVisible ? 0.02 : 0.045) *
                (7 - Math.max(approachRate, 0)) *
                sliderVisibilityFactor;
        }

        // Starting from AR 0, cap values so they won't grow to infinity.
        if (approachRate < 0) {
            readingBonus +=
                (isAlwaysPartiallyVisible ? 0.01 : 0.1) *
                (1 - Math.pow(1.5, approachRate)) *
                sliderVisibilityFactor;
        }

        return readingBonus;
    }

    static calculateDifficultyRating(difficultyValue: number): number {
        return Math.sqrt(difficultyValue) * this.difficultyMultiplier;
    }
}
