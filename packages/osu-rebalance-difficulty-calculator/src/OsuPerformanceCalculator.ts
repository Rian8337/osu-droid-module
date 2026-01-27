import {
    Accuracy,
    ErrorFunction,
    Interpolation,
    MathUtils,
    ModAutopilot,
    ModBlinds,
    ModFlashlight,
    ModHidden,
    ModNoFail,
    ModRelax,
    ModScoreV2,
    ModSpunOut,
    ModTraceable,
    OsuHitWindow,
} from "@rian8337/osu-base";
import { PerformanceCalculator } from "./base/PerformanceCalculator";
import { OsuAim } from "./skills/osu/OsuAim";
import { OsuSpeed } from "./skills/osu/OsuSpeed";
import { IOsuDifficultyAttributes } from "./structures/IOsuDifficultyAttributes";
import { OsuRatingCalculator } from "./OsuRatingCalculator";

/**
 * A performance points calculator that calculates performance points for osu!standard gamemode.
 */
export class OsuPerformanceCalculator extends PerformanceCalculator<IOsuDifficultyAttributes> {
    /**
     * The aim performance value.
     */
    aim = 0;

    /**
     * The speed performance value.
     */
    speed = 0;

    /**
     * The accuracy performance value.
     */
    accuracy = 0;

    /**
     * The flashlight performance value.
     */
    flashlight = 0;

    /**
     * The amount of misses, including slider breaks.
     */
    get effectiveMissCount(): number {
        return this._effectiveMissCount;
    }

    static readonly finalMultiplier = 1.14;
    static readonly normExponent = 1.1;

    private _effectiveMissCount = 0;
    private speedDeviation = 0;

    protected override calculateValues() {
        this._effectiveMissCount = MathUtils.clamp(
            this.calculateComboBasedEstimatedMissCount(),
            this.computedAccuracy.nmiss,
            this.totalHits,
        );

        let { finalMultiplier } = OsuPerformanceCalculator;

        if (this.mods.has(ModNoFail)) {
            finalMultiplier *= Math.max(
                0.9,
                1 - 0.02 * this._effectiveMissCount,
            );
        }

        if (this.mods.has(ModSpunOut)) {
            finalMultiplier *=
                1 -
                Math.pow(
                    this.difficultyAttributes.spinnerCount / this.totalHits,
                    0.85,
                );
        }

        if (this.mods.has(ModRelax)) {
            const { overallDifficulty: od } = this.difficultyAttributes;

            // Graph: https://www.desmos.com/calculator/vspzsop6td
            // We use OD13.3 as maximum since it's the value at which great hit window becomes 0.
            const n100Multiplier =
                0.75 * Math.max(0, od > 0 ? 1 - od / 13.33 : 1);

            const n50Multiplier = Math.max(
                0,
                od > 0 ? 1 - Math.pow(od / 13.33, 5) : 1,
            );

            // As we're adding 100s and 50s to an approximated number of combo breaks, the result can be higher
            // than total hits in specific scenarios (which breaks some calculations),  so we need to clamp it.
            this._effectiveMissCount = Math.min(
                this._effectiveMissCount +
                    this.computedAccuracy.n100 * n100Multiplier +
                    this.computedAccuracy.n50 * n50Multiplier,
                this.totalHits,
            );
        }

        this.speedDeviation = this.calculateSpeedDeviation();

        this.aim = this.calculateAimValue();
        this.speed = this.calculateSpeedValue();
        this.accuracy = this.calculateAccuracyValue();
        this.flashlight = this.calculateFlashlightValue();

        this.total =
            MathUtils.norm(
                OsuPerformanceCalculator.normExponent,
                this.aim,
                this.speed,
                this.accuracy,
                this.flashlight,
            ) * finalMultiplier;
    }

    /**
     * Calculates the aim performance value of the beatmap.
     */
    private calculateAimValue(): number {
        if (this.mods.has(ModAutopilot)) {
            return 0;
        }

        let { aimDifficulty } = this.difficultyAttributes;
        const { aimDifficultSliderCount, sliderFactor } =
            this.difficultyAttributes;

        if (aimDifficultSliderCount > 0) {
            let estimateImproperlyFollowedDifficultSliders: number;

            if (this.usingClassicSliderAccuracy) {
                // When the score is considered classic (regardless if it was made on old client or not),
                // we consider all missing combo to be dropped difficult sliders.
                estimateImproperlyFollowedDifficultSliders = MathUtils.clamp(
                    Math.min(
                        this.totalImperfectHits,
                        this.difficultyAttributes.maxCombo - this.combo,
                    ),
                    0,
                    aimDifficultSliderCount,
                );
            } else {
                // We add tick misses here since they too mean that the player didn't follow the slider
                // properly. However aren't adding misses here because missing slider heads has a harsh
                // penalty by itself and doesn't mean that the rest of the slider wasn't followed properly.
                estimateImproperlyFollowedDifficultSliders = MathUtils.clamp(
                    this.sliderEndsDropped + this.sliderTicksMissed,
                    0,
                    aimDifficultSliderCount,
                );
            }

            aimDifficulty *=
                (1 - sliderFactor) *
                    Math.pow(
                        1 -
                            estimateImproperlyFollowedDifficultSliders /
                                aimDifficultSliderCount,
                        3,
                    ) +
                sliderFactor;
        }

        let aimValue = OsuAim.difficultyToPerformance(aimDifficulty);

        // Longer maps are worth more
        let lengthBonus = 0.95 + 0.4 * Math.min(1, this.totalHits / 2000);
        if (this.totalHits > 2000) {
            lengthBonus += Math.log10(this.totalHits / 2000) * 0.5;
        }

        aimValue *= lengthBonus;

        if (this.effectiveMissCount > 0) {
            const aimEstimatedSliderBreaks =
                this.calculateEstimatedSliderBreaks(
                    this.difficultyAttributes.aimTopWeightedSliderFactor,
                );

            const relevantMissCount = Math.min(
                this._effectiveMissCount + aimEstimatedSliderBreaks,
                this.totalImperfectHits + this.sliderTicksMissed,
            );

            aimValue *= this.calculateMissPenalty(
                relevantMissCount,
                this.difficultyAttributes.aimDifficultStrainCount,
            );
        }

        // Traceable bonuses are excluded when Blinds is present, as the increased visual difficulty is
        // redundant when notes cannot be seen.
        if (this.mods.has(ModBlinds)) {
            aimValue *=
                1.3 +
                this.totalHits *
                    (0.0016 / (1 + 2 * this._effectiveMissCount)) *
                    Math.pow(this.computedAccuracy.value(), 16) *
                    (1 -
                        0.003 *
                            Math.pow(this.difficultyAttributes.drainRate, 2));
        } else if (this.mods.has(ModTraceable)) {
            aimValue *=
                1 +
                OsuRatingCalculator.calculateVisibilityBonus(
                    this.mods,
                    this.difficultyAttributes.approachRate,
                    undefined,
                    this.difficultyAttributes.sliderFactor,
                );
        }

        // Scale the aim value with accuracy.
        aimValue *= this.computedAccuracy.value();

        return aimValue;
    }

    /**
     * Calculates the speed performance value of the beatmap.
     */
    private calculateSpeedValue(): number {
        if (
            this.mods.has(ModRelax) ||
            this.speedDeviation === Number.POSITIVE_INFINITY
        ) {
            return 0;
        }

        let speedValue = OsuSpeed.difficultyToPerformance(
            this.difficultyAttributes.speedDifficulty,
        );

        if (this._effectiveMissCount > 0) {
            const speedEstimatedSliderBreaks =
                this.calculateEstimatedSliderBreaks(
                    this.difficultyAttributes.speedTopWeightedSliderFactor,
                );

            const relevantMissCount = Math.min(
                this._effectiveMissCount + speedEstimatedSliderBreaks,
                this.totalImperfectHits + this.sliderTicksMissed,
            );

            speedValue *= this.calculateMissPenalty(
                relevantMissCount,
                this.difficultyAttributes.speedDifficultStrainCount,
            );
        }

        // Traceable bonuses are excluded when Blinds is present, as the increased visual difficulty is
        // redundant when notes cannot be seen.
        if (this.mods.has(ModBlinds)) {
            // Increasing the speed value by object count for Blinds is not ideal, so the minimum buff is given.
            speedValue *= 1.12;
        } else if (this.mods.has(ModTraceable)) {
            speedValue *=
                1 +
                OsuRatingCalculator.calculateVisibilityBonus(
                    this.mods,
                    this.difficultyAttributes.approachRate,
                    undefined,
                    this.difficultyAttributes.sliderFactor,
                );
        }

        // Calculate accuracy assuming the worst case scenario.
        const countGreat = this.computedAccuracy.n300;
        const countOk = this.computedAccuracy.n100;
        const countMeh = this.computedAccuracy.n50;

        const relevantTotalDiff =
            this.totalHits - this.difficultyAttributes.speedNoteCount;

        const relevantAccuracy = new Accuracy(
            this.difficultyAttributes.speedNoteCount > 0
                ? {
                      n300: Math.max(0, countGreat - relevantTotalDiff),
                      n100: Math.max(
                          0,
                          countOk - Math.max(0, relevantTotalDiff - countGreat),
                      ),
                      n50: Math.max(
                          0,
                          countMeh -
                              Math.max(
                                  0,
                                  relevantTotalDiff - countGreat - countOk,
                              ),
                      ),
                  }
                : // Set accuracy to 0.
                  { n300: 0, nobjects: 1 },
        );

        speedValue *= this.calculateSpeedHighDeviationNerf();

        // Scale the speed value with accuracy and OD.
        speedValue *= Math.pow(
            (this.computedAccuracy.value() + relevantAccuracy.value()) / 2,
            (14.5 - this.difficultyAttributes.overallDifficulty) / 2,
        );

        return speedValue;
    }

    /**
     * Calculates the accuracy performance value of the beatmap.
     */
    private calculateAccuracyValue(): number {
        if (this.mods.has(ModRelax)) {
            return 0;
        }

        const ncircles = this.mods.has(ModScoreV2)
            ? this.totalHits - this.difficultyAttributes.spinnerCount
            : this.difficultyAttributes.hitCircleCount;

        if (ncircles === 0) {
            return 0;
        }

        const realAccuracy = new Accuracy({
            ...this.computedAccuracy,
            n300: this.computedAccuracy.n300 - (this.totalHits - ncircles),
        });

        // Lots of arbitrary values from testing.
        // Considering to use derivation from perfect accuracy in a probabilistic manner - assume normal distribution
        let accuracyValue =
            Math.pow(1.52163, this.difficultyAttributes.overallDifficulty) *
            // It is possible to reach a negative accuracy with this formula. Cap it at zero - zero points.
            Math.pow(realAccuracy.n300 < 0 ? 0 : realAccuracy.value(), 24) *
            2.83;

        // Bonus for many hitcircles - it's harder to keep good accuracy up for longer
        accuracyValue *= Math.min(1.15, Math.pow(ncircles / 1000, 0.3));

        // Increasing the accuracy value by object count for Blinds isn't ideal, so the minimum buff is given.
        if (this.mods.has(ModBlinds)) {
            accuracyValue *= 1.14;
        } else if (this.mods.has(ModHidden) || this.mods.has(ModTraceable)) {
            // Decrease bonus for AR > 10.
            accuracyValue *=
                1 +
                0.08 *
                    Interpolation.reverseLerp(
                        this.difficultyAttributes.approachRate,
                        11.5,
                        10,
                    );
        }

        if (this.mods.has(ModFlashlight)) {
            accuracyValue *= 1.02;
        }

        return accuracyValue;
    }

    /**
     * Calculates the flashlight performance value of the beatmap.
     */
    private calculateFlashlightValue(): number {
        if (!this.mods.has(ModFlashlight)) {
            return 0;
        }

        let flashlightValue =
            Math.pow(this.difficultyAttributes.flashlightDifficulty, 2) * 25;

        // Combo scaling
        flashlightValue *= Math.min(
            Math.pow(this.combo / this.difficultyAttributes.maxCombo, 0.8),
            1,
        );

        if (this.effectiveMissCount > 0) {
            // Penalize misses by assessing # of misses relative to the total # of objects. Default a 3% reduction for any # of misses.
            flashlightValue *=
                0.97 *
                Math.pow(
                    1 -
                        Math.pow(
                            this.effectiveMissCount / this.totalHits,
                            0.775,
                        ),
                    Math.pow(this.effectiveMissCount, 0.875),
                );
        }

        // Account for shorter maps having a higher ratio of 0 combo/100 combo flashlight radius.
        flashlightValue *=
            0.7 +
            0.1 * Math.min(1, this.totalHits / 200) +
            (this.totalHits > 200
                ? 0.2 * Math.min(1, (this.totalHits - 200) / 200)
                : 0);

        // Scale the flashlight value with accuracy slightly.
        flashlightValue *= 0.5 + this.computedAccuracy.value() / 2;

        return flashlightValue;
    }

    /**
     * Calculates a strain-based miss penalty.
     *
     * Strain-based miss penalty assumes that a player will miss on the hardest parts of a map,
     * so we use the amount of relatively difficult sections to adjust miss penalty
     * to make it more punishing on maps with lower amount of hard sections.
     */
    private calculateMissPenalty(
        missCount: number,
        difficultStrainCount: number,
    ): number {
        if (missCount === 0) {
            return 1;
        }

        return (
            0.96 /
            (missCount / (4 * Math.pow(Math.log(difficultStrainCount), 0.94)) +
                1)
        );
    }

    /**
     * Estimates a player's deviation on speed notes using {@link calculateDeviation}, assuming worst-case.
     *
     * Treats all speed notes as hit circles.
     */
    private calculateSpeedDeviation(): number {
        if (this.totalSuccessfulHits === 0) {
            return Number.POSITIVE_INFINITY;
        }

        // Calculate accuracy assuming the worst case scenario
        const speedNoteCount =
            this.difficultyAttributes.speedNoteCount +
            (this.totalHits - this.difficultyAttributes.speedNoteCount) * 0.1;

        // Assume worst case: all mistakes were on speed notes
        const relevantCountMiss = Math.min(
            this.computedAccuracy.nmiss,
            speedNoteCount,
        );

        const relevantCountMeh = Math.min(
            this.computedAccuracy.n50,
            speedNoteCount - relevantCountMiss,
        );

        const relevantCountOk = Math.min(
            this.computedAccuracy.n100,
            speedNoteCount - relevantCountMiss - relevantCountMeh,
        );

        const relevantCountGreat = Math.max(
            0,
            speedNoteCount -
                relevantCountMiss -
                relevantCountMeh -
                relevantCountOk,
        );

        return this.calculateDeviation(
            relevantCountGreat,
            relevantCountOk,
            relevantCountMeh,
        );
    }

    /**
     * Estimates the player's tap deviation based on the OD, given number of greats, oks, mehs and misses,
     * assuming the player's mean hit error is 0. The estimation is consistent in that two SS scores on the
     * same map with the same settings will always return the same deviation.
     *
     * Misses are ignored because they are usually due to misaiming.
     *
     * Greats and oks are assumed to follow a normal distribution, whereas mehs are assumed to follow a uniform distribution.
     */
    private calculateDeviation(
        relevantCountGreat: number,
        relevantCountOk: number,
        relevantCountMeh: number,
    ): number {
        if (relevantCountGreat + relevantCountOk + relevantCountMeh <= 0) {
            return Number.POSITIVE_INFINITY;
        }

        // Obtain the great, ok, and meh windows.
        const { clockRate, overallDifficulty } = this.difficultyAttributes;

        const hitWindow = new OsuHitWindow(
            OsuHitWindow.greatWindowToOD(
                // Convert current OD to non clock rate-adjusted OD.
                new OsuHitWindow(overallDifficulty).greatWindow * clockRate,
            ),
        );

        const greatWindow = hitWindow.greatWindow / clockRate;
        const okWindow = hitWindow.okWindow / clockRate;
        const mehWindow = hitWindow.mehWindow / clockRate;

        // The sample proportion of successful hits.
        const n = Math.max(1, relevantCountGreat + relevantCountOk);
        const p = relevantCountGreat / n;

        // 99% critical value for the normal distribution (one-tailed).
        const z = 2.32634787404;

        // We can be 99% confident that the population proportion is at least this value.
        const pLowerBound = Math.min(
            p,
            (n * p + Math.pow(z, 2) / 2) / (n + Math.pow(z, 2)) -
                (z / (n + Math.pow(z, 2))) *
                    Math.sqrt(n * p * (1 - p) + Math.pow(z, 2) / 4),
        );

        let deviation: number;

        // Tested maximum precision for the deviation calculation.
        if (pLowerBound > 0.01) {
            // Compute deviation assuming 300s and 109s are normally distributed.
            deviation =
                greatWindow / (Math.SQRT2 * ErrorFunction.erfInv(pLowerBound));

            // Subtract the deviation provided by tails that land outside the 100 hit window from the deviation computed above.
            // This is equivalent to calculating the deviation of a normal distribution truncated at +-okHitWindow.
            const okWindowTailAmount =
                (Math.sqrt(2 / Math.PI) *
                    okWindow *
                    Math.exp(-0.5 * Math.pow(okWindow / deviation, 2))) /
                (deviation *
                    ErrorFunction.erf(okWindow / (Math.SQRT2 * deviation)));

            deviation *= Math.sqrt(1 - okWindowTailAmount);
        } else {
            // A tested limit value for the case of a score only containing 100s.
            deviation = okWindow / Math.sqrt(3);
        }

        // Compute and add the variance for 50s, assuming that they are uniformly distriubted.
        const mehVariance =
            (mehWindow * mehWindow +
                okWindow * mehWindow +
                okWindow * okWindow) /
            3;

        deviation = Math.sqrt(
            ((relevantCountGreat + relevantCountOk) * Math.pow(deviation, 2) +
                relevantCountMeh * mehVariance) /
                (relevantCountGreat + relevantCountOk + relevantCountMeh),
        );

        return deviation;
    }

    /**
     * Calculates multiplier for speed to account for improper tapping based on the deviation and speed difficulty.
     *
     * [Graph](https://www.desmos.com/calculator/dmogdhzofn)
     */
    private calculateSpeedHighDeviationNerf(): number {
        if (this.speedDeviation == Number.POSITIVE_INFINITY) {
            return 0;
        }

        const speedValue = OsuSpeed.difficultyToPerformance(
            this.difficultyAttributes.speedDifficulty,
        );

        // Decide a point where the PP value achieved compared to the speed deviation is assumed to be tapped
        // improperly. Any PP above this point is considered "excess" speed difficulty. This is used to cause
        // PP above the cutoff to scale logarithmically towards the original speed value thus nerfing the value.
        const excessSpeedDifficultyCutoff =
            100 + 220 * Math.pow(22 / this.speedDeviation, 6.5);

        if (speedValue <= excessSpeedDifficultyCutoff) {
            return 1;
        }

        const scale = 50;
        const adjustedSpeedValue =
            scale *
            (Math.log((speedValue - excessSpeedDifficultyCutoff) / scale + 1) +
                excessSpeedDifficultyCutoff / scale);

        // 220 UR and less are considered tapped correctly to ensure that normal scores will be punished as little as possible
        const t = 1 - Interpolation.reverseLerp(this.speedDeviation, 22, 27);

        return (
            Interpolation.lerp(adjustedSpeedValue, speedValue, t) / speedValue
        );
    }

    private calculateEstimatedSliderBreaks(
        topWeightedSliderFactor: number,
    ): number {
        const { n100 } = this.computedAccuracy;

        if (!this.usingClassicSliderAccuracy || n100 === 0) {
            return 0;
        }

        const missedComboPercent =
            1 - this.combo / this.difficultyAttributes.maxCombo;
        let estimatedSliderBreaks = Math.min(
            n100,
            this._effectiveMissCount * topWeightedSliderFactor,
        );

        // Scores with more Oks are more likely to have slider breaks.
        const okAdjustment = (n100 - estimatedSliderBreaks + 0.5) / n100;

        // There is a low probability of extra slider breaks on effective miss counts close to 1, as
        // score based calculations are good at indicating if only a single break occurred.
        estimatedSliderBreaks *= MathUtils.smoothstep(
            this._effectiveMissCount,
            1,
            2,
        );

        return (
            estimatedSliderBreaks *
            okAdjustment *
            MathUtils.offsetLogistic(missedComboPercent, 0.33, 15)
        );
    }

    /**
     * Calculates the amount of misses + sliderbreaks from combo.
     */
    private calculateComboBasedEstimatedMissCount(): number {
        let missCount = this.computedAccuracy.nmiss;
        const { combo } = this;
        const { aimTopWeightedSliderFactor, sliderCount, maxCombo } =
            this.difficultyAttributes;

        if (sliderCount <= 0) {
            return missCount;
        }

        if (this.usingClassicSliderAccuracy) {
            // If sliders in the beatmap are hard, it's likely for player to drop sliderends.
            // However, if the beatmap has easy sliders, it's more likely for player to sliderbreak.
            const likelyMissedSliderendPortion =
                0.04 +
                0.06 * Math.pow(Math.min(aimTopWeightedSliderFactor, 1), 2);

            // Consider that full combo is maximum combo minus dropped slider tails since
            // they don't contribute to combo but also don't break it.
            // In classic scores, we can't know the amount of dropped sliders so we estimate
            // to 10% of all sliders in the beatmap.
            const fullComboThreshold =
                maxCombo -
                Math.min(
                    // 4 is the minimum leniency baseline to ensure that dropping one (for few) sliderends will
                    // not instantly be treated as a sliderbreak even in cases where the slider count is low.
                    // 4 was picked because in a lot of short stream beatmaps with small amount of sliders, there
                    // are 2-3 sliders on which sliderends are often dropped. This is a kind of optimization to
                    // achieve the most accurate result on average.
                    4 + likelyMissedSliderendPortion * sliderCount,
                    sliderCount,
                );

            if (combo < fullComboThreshold) {
                missCount = fullComboThreshold / Math.max(1, combo);
            }

            // In classic scores, there can't be more misses than a sum of all non-perfect judgements.
            missCount = Math.min(missCount, this.totalImperfectHits);

            // Every slider has *at least* 2 combo attributed in classic mechanics.
            // If they broke on a slider with a tick, then this still works since they would have lost at least 2 combo (the tick and the end).
            // Using this as a max means a score that loses 1 combo on a map can't possibly have been a slider break.
            // It must have been a slider end.
            const maxPossibleSliderBreaks = Math.min(
                sliderCount,
                (maxCombo - combo) / 2,
            );

            const sliderBreaks = missCount - this.computedAccuracy.nmiss;

            if (sliderBreaks > maxPossibleSliderBreaks) {
                missCount =
                    this.computedAccuracy.nmiss + maxPossibleSliderBreaks;
            }
        } else {
            const fullComboThreshold = maxCombo - this.sliderEndsDropped;

            if (combo < fullComboThreshold) {
                missCount = fullComboThreshold / Math.max(1, combo);
            }

            // Combine regular misses with tick misses, since tick misses break combo as well.
            missCount = Math.min(
                missCount,
                this.sliderTicksMissed + this.computedAccuracy.nmiss,
            );
        }

        return missCount;
    }

    override toString(): string {
        return (
            this.total.toFixed(2) +
            " pp (" +
            this.aim.toFixed(2) +
            " aim, " +
            this.speed.toFixed(2) +
            " speed, " +
            this.accuracy.toFixed(2) +
            " accuracy, " +
            this.flashlight.toFixed(2) +
            " flashlight)"
        );
    }
}
