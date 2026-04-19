import {
    DroidHitWindow,
    ErrorFunction,
    Interpolation,
    MathUtils,
    ModFlashlight,
    ModNoFail,
    ModPrecise,
    ModRelax,
    ModScoreV2,
    PreciseDroidHitWindow,
} from "@rian8337/osu-base";
import { PerformanceCalculator } from "./base/PerformanceCalculator";
import { DroidDifficultyCalculator } from "./DroidDifficultyCalculator";
import { DroidAim } from "./skills/droid/DroidAim";
import { DroidFlashlight } from "./skills/droid/DroidFlashlight";
import { DroidReading } from "./skills/droid/DroidReading";
import { DroidTap } from "./skills/droid/DroidTap";
import { IDroidDifficultyAttributes } from "./structures/IDroidDifficultyAttributes";
import { PerformanceCalculationOptions } from "./structures/PerformanceCalculationOptions";

/**
 * A performance points calculator that calculates performance points for osu!droid gamemode.
 */
export class DroidPerformanceCalculator extends PerformanceCalculator<IDroidDifficultyAttributes> {
    /**
     * The aim performance value.
     */
    aim = 0;

    /**
     * The tap performance value.
     */
    tap = 0;

    /**
     * The accuracy performance value.
     */
    accuracy = 0;

    /**
     * The flashlight performance value.
     */
    flashlight = 0;

    /**
     * The reading performance value.
     */
    reading = 0;

    /**
     * The penalty used to penalize the tap performance value.
     *
     * Can be properly obtained by analyzing the replay associated with the score.
     */
    get tapPenalty(): number {
        return this._tapPenalty;
    }

    /**
     * The estimated deviation of the score.
     */
    get deviation(): number {
        return this._deviation;
    }

    /**
     * The estimated tap deviation of the score.
     */
    get tapDeviation(): number {
        return this._tapDeviation;
    }

    /**
     * The penalty used to penalize the aim performance value.
     *
     * Can be properly obtained by analyzing the replay associated with the score.
     */
    get aimSliderCheesePenalty(): number {
        return this._aimSliderCheesePenalty;
    }

    /**
     * The total score achieved in the score.
     */
    get totalScore(): number | null {
        return this._totalScore;
    }

    /**
     * The amount of misses, including slider breaks.
     */
    get effectiveMissCount(): number {
        return this._effectiveMissCount;
    }

    static readonly finalMultiplier = 1.24;
    static readonly normExponent = 1.1;

    private _aimSliderCheesePenalty = 1;
    private _tapPenalty = 1;

    private _effectiveMissCount = 0;
    private _deviation = 0;
    private _tapDeviation = 0;
    private _totalScore: number | null = null;

    protected override calculateValues() {
        if (this.usingClassicSliderAccuracy && this.totalScore !== null) {
            const remainingScore =
                this.difficultyAttributes.maximumScore - this.totalScore;

            // If there is less than one miss, let combo-based miss count decide whether this is full combo.
            const scoreBasedMissCount = Math.max(
                1,
                (this.totalScore - remainingScore) / this.totalScore,
            );

            // Cap result by very harsh version of combo-based miss count.
            this._effectiveMissCount = Math.min(
                scoreBasedMissCount,
                this.calculateMaximumComboBasedMissCount(),
            );
        } else {
            this._effectiveMissCount =
                this.calculateComboBasedEstimatedMissCount();
        }

        this._effectiveMissCount = MathUtils.clamp(
            this._effectiveMissCount,
            this.computedAccuracy.nmiss,
            this.totalHits,
        );

        let { finalMultiplier } = DroidPerformanceCalculator;

        if (this.mods.has(ModNoFail)) {
            finalMultiplier *= Math.max(
                0.9,
                1 - 0.02 * this._effectiveMissCount,
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

        this._deviation = this.calculateAimDeviation();
        this._tapDeviation = this.calculateTapDeviation();

        this.aim = this.calculateAimValue();
        this.tap = this.calculateTapValue();
        this.accuracy = this.calculateAccuracyValue();
        this.flashlight = this.calculateFlashlightValue();
        this.reading = this.calculateReadingValue();

        const cognitionValue = DroidDifficultyCalculator.sumCognitionDifficulty(
            this.reading,
            this.flashlight,
        );

        this.total =
            MathUtils.norm(
                DroidPerformanceCalculator.normExponent,
                this.aim,
                this.tap,
                this.accuracy,
                cognitionValue,
            ) * finalMultiplier;
    }

    protected override handleOptions(
        options?: PerformanceCalculationOptions,
    ): void {
        this._tapPenalty = MathUtils.clamp(options?.tapPenalty ?? 1, 0, 1);

        this._aimSliderCheesePenalty = MathUtils.clamp(
            options?.aimSliderCheesePenalty ?? 1,
            0,
            1,
        );

        this._totalScore =
            options?.totalScore !== undefined
                ? MathUtils.clamp(
                      options.totalScore,
                      0,
                      this.difficultyAttributes.maximumScore,
                  )
                : null;

        super.handleOptions(options);
    }

    /**
     * Calculates the aim performance value of the beatmap.
     */
    private calculateAimValue(): number {
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

        let aimValue = DroidAim.difficultyToPerformance(aimDifficulty);

        if (this._effectiveMissCount > 0) {
            const aimEstimatedSliderBreaks =
                this.calculateEstimatedSliderBreaks(
                    this.difficultyAttributes.aimTopWeightedSliderFactor,
                );

            const relevantMissCount = Math.min(
                this._effectiveMissCount + aimEstimatedSliderBreaks,
                this.totalImperfectHits + this.sliderTicksMissed,
            );

            aimValue *= Math.min(
                this.calculateStrainBasedMissPenalty(
                    relevantMissCount,
                    this.difficultyAttributes.aimDifficultStrainCount,
                ),
                this.proportionalMissPenalty,
            );
        }

        // Scale the aim value with estimated full combo deviation.
        aimValue *= this.calculateDeviationBasedLengthScaling();

        // Scale the aim value with slider cheese penalty.
        aimValue *= this._aimSliderCheesePenalty;

        // Scale the aim value with deviation.
        aimValue *=
            1.025 *
            Math.pow(
                ErrorFunction.erf(25 / (Math.SQRT2 * this._deviation)),
                0.475,
            );

        return aimValue;
    }

    /**
     * Calculates the tap performance value of the beatmap.
     */
    private calculateTapValue(): number {
        let tapValue = DroidTap.difficultyToPerformance(
            this.difficultyAttributes.tapDifficulty,
        );

        if (this._effectiveMissCount > 0) {
            const tapEstimatedSliderBreaks =
                this.calculateEstimatedSliderBreaks(
                    this.difficultyAttributes.tapTopWeightedSliderFactor,
                );

            const relevantMissCount = Math.min(
                this._effectiveMissCount + tapEstimatedSliderBreaks,
                this.totalImperfectHits + this.sliderTicksMissed,
            );

            tapValue *= this.calculateStrainBasedMissPenalty(
                relevantMissCount,
                this.difficultyAttributes.tapDifficultStrainCount,
            );
        }

        // Scale the tap value with estimated full combo deviation.
        // Consider notes that are difficult to tap with respect to other notes, but
        // also cap the note count to prevent buffing filler patterns.
        tapValue *= Math.min(
            1,
            this.calculateDeviationBasedLengthScaling(
                Math.min(
                    this.difficultyAttributes.speedNoteCount,
                    this.totalHits / 1.45,
                ),
            ),
        );

        // An effective hit window is created based on the tap SR. The higher the tap difficulty, the shorter the hit window.
        // For example, a tap SR of 4 leads to an effective hit window of 25ms, which is OD 10 with Precise mod.
        const effectiveHitWindow =
            25 * Math.pow(4 / this.difficultyAttributes.tapDifficulty, 1.5);

        // Find the proportion of 300s on speed notes assuming the hit window was the effective hit window.
        const effectiveAccuracy = ErrorFunction.erf(
            effectiveHitWindow / this._tapDeviation,
        );

        console.log("Effective hit window:", effectiveHitWindow);
        console.log("Effective accuracy:", effectiveAccuracy);

        // Scale the tap value with normalized accuracy.
        tapValue *= Math.pow(effectiveAccuracy, 2);

        tapValue *= this.calculateTapHighDeviationNerf();

        // Scale the tap value with three-fingered penalty.
        tapValue /= this._tapPenalty;

        return tapValue;
    }

    /**
     * Calculates the accuracy performance value of the beatmap.
     */
    private calculateAccuracyValue(): number {
        if (this.mods.has(ModRelax) || this.totalSuccessfulHits === 0) {
            return 0;
        }

        let accuracyValue = 650 * Math.exp(-0.1 * this._deviation);

        const ncircles = this.mods.has(ModScoreV2)
            ? this.totalHits - this.difficultyAttributes.spinnerCount
            : this.difficultyAttributes.hitCircleCount;

        // Bonus for many hitcircles - it's harder to keep good accuracy up for longer.
        accuracyValue *= Math.pow(
            Math.log(1 + ((Math.E - 1) * ncircles) / 1000),
            ncircles < 1000 ? 0.5 : 0.25,
        );

        // Scale the accuracy value with rhythm complexity.
        accuracyValue *= MathUtils.offsetLogistic(
            this.difficultyAttributes.rhythmDifficulty,
            1,
            0.5,
            1.8,
        );

        // Penalize accuracy pp after the first miss.
        accuracyValue *= Math.pow(
            0.97,
            Math.max(0, this._effectiveMissCount - 1),
        );

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

        let flashlightValue = DroidFlashlight.difficultyToPerformance(
            this.difficultyAttributes.flashlightDifficulty,
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

        // Scale the flashlight value with deviation.
        flashlightValue *= ErrorFunction.erf(
            50 / (Math.SQRT2 * this._deviation),
        );

        return flashlightValue;
    }

    /**
     * Calculates the reading performance value of the beatmap.
     */
    private calculateReadingValue(): number {
        let readingValue = DroidReading.difficultyToPerformance(
            this.difficultyAttributes.readingDifficulty,
        );

        if (this._effectiveMissCount > 0) {
            const readingEstimatedSliderBreaks =
                this.calculateEstimatedSliderBreaks(
                    this.difficultyAttributes.aimTopWeightedSliderFactor,
                );

            const relevantMissCount = Math.min(
                this._effectiveMissCount + readingEstimatedSliderBreaks,
                this.totalImperfectHits + this.sliderTicksMissed,
            );

            readingValue *= Math.min(
                this.calculateStrainBasedMissPenalty(
                    relevantMissCount,
                    this.difficultyAttributes.readingDifficultNoteCount,
                ),
                this.proportionalMissPenalty,
            );
        }

        // Scale the reading value with estimated full combo deviation.
        // As reading is easily "bypassable" with memorization, punish for memorization.
        readingValue *= Math.min(
            1,
            this.calculateDeviationBasedLengthScaling(undefined, true),
        );

        // Scale the reading value with deviation.
        readingValue *=
            1.025 *
            Math.pow(
                ErrorFunction.erf(25 / (Math.SQRT2 * this._deviation)),
                1.25,
            );

        return readingValue;
    }

    /**
     * Calculates a strain-based miss penalty.
     *
     * Strain-based miss penalty assumes that a player will miss on the hardest parts of a map,
     * so we use the amount of relatively difficult sections to adjust miss penalty
     * to make it more punishing on maps with lower amount of hard sections.
     */
    private calculateStrainBasedMissPenalty(
        missCount: number,
        difficultStrainCount: number,
    ): number {
        if (missCount === 0) {
            return 1;
        }

        // https://www.desmos.com/calculator/naggvbcz0a
        return 0.93 / (missCount / (4 * Math.log(difficultStrainCount)) + 1);
    }

    /**
     * The object-based proportional miss penalty.
     */
    private get proportionalMissPenalty(): number {
        if (this._effectiveMissCount === 0) {
            return 1;
        }

        const aimEstimatedSliderBreaks = this.calculateEstimatedSliderBreaks(
            this.difficultyAttributes.aimTopWeightedSliderFactor,
        );

        const relevantMissCount = Math.min(
            this._effectiveMissCount + aimEstimatedSliderBreaks,
            this.totalImperfectHits + this.sliderTicksMissed,
        );

        if (relevantMissCount === 0) {
            return 1;
        }

        const missProportion =
            (this.totalHits - relevantMissCount) / (this.totalHits + 1);
        const noMissProportion = this.totalHits / (this.totalHits + 1);

        return (
            // Aim deviation-based scale.
            (ErrorFunction.erfInv(missProportion) /
                ErrorFunction.erfInv(noMissProportion)) *
            // Cheesing-based scale (i.e. 50% misses is deliberately only hitting each other
            // note, 90% misses is deliberately only hitting 1 note every 10 notes).
            Math.pow(missProportion, 8)
        );
    }

    /**
     * Calculates the object-based length scaling based on the deviation of a player for a full
     * combo in this beatmap, taking retries into account.
     *
     * @param objectCount The amount of objects to be considered. Defaults to the amount of
     * objects in this beatmap.
     * @param punishForMemorization Whether to punish the deviation for memorization. Defaults to `false`.
     */
    private calculateDeviationBasedLengthScaling(
        objectCount: number = this.totalHits,
        punishForMemorization = false,
    ): number {
        // Assume a sample proportion of hits for a full combo to be `(n - 0.5) / n` due to
        // continuity correction, where `n` is the object count.
        const calculateProportion = (notes: number): number =>
            (notes - 0.5) / notes;

        // Keeping `x` notes as the benchmark, assume that a player will retry a beatmap
        // `max(1, x/n)` times relative to an `x`-note beatmap.
        const benchmarkNotes = 700;

        // Calculate the proportion equivalent to the bottom half of retry count percentile of
        // scores and take it as the player's "real" proportion.
        const retryProportion = (
            proportion: number,
            notes: number,
            tries: number,
        ) =>
            proportion +
            Math.sqrt((2 * proportion * (1 - proportion)) / notes) *
                ErrorFunction.erfInv(1 / tries - 1);

        // Using the proportion, we calculate the deviation based off that proportion and again
        // compared to the hit deviation for proportion `(n - 0.5) / n`.
        let multiplier = Math.max(
            0,
            ErrorFunction.erfInv(
                retryProportion(
                    calculateProportion(objectCount),
                    objectCount,
                    Math.max(1, benchmarkNotes / objectCount),
                ),
            ) / ErrorFunction.erfInv(calculateProportion(benchmarkNotes)) || 0,
        );

        // Punish for memorization if needed.
        if (punishForMemorization) {
            multiplier *= Math.min(1, Math.sqrt(objectCount / benchmarkNotes));
        }

        return multiplier;
    }

    /**
     * Estimates the player's deviation based on the OD, number of circles and sliders,
     * and number of 300s, 100s, 50s, and misses, assuming the player's mean hit error is 0.
     *
     * The estimation is consistent in that two SS scores on the same map
     * with the same settings will always return the same deviation.
     *
     * Sliders are treated as circles with a 50 hit window.
     *
     * Misses are ignored because they are usually due to misaiming, and 50s
     * are grouped with 100s since they are usually due to misreading.
     *
     * Inaccuracies are capped to the number of circles in the map.
     */
    private calculateAimDeviation(): number {
        return this.calculateDeviation(
            this.computedAccuracy.n300,
            this.computedAccuracy.n100,
            this.computedAccuracy.n50,
        );
    }

    /**
     * Does the same as {@link calculateAimDeviation}, but only for notes and inaccuracies that are relevant to tap difficulty.
     *
     * Treats all difficult speed notes as circles, so this method can sometimes return a lower deviation than {@link calculateAimDeviation}.
     * This is fine though, since this method is only used to scale tap pp.
     */
    private calculateTapDeviation(): number {
        if (this.totalSuccessfulHits === 0) {
            return Number.POSITIVE_INFINITY;
        }

        // Calculate accuracy assuming the worst case scenario.
        const speedNoteCount =
            this.difficultyAttributes.speedNoteCount +
            (this.totalHits - this.difficultyAttributes.speedNoteCount) * 0.1;

        // Assume worst case - all non-300s happened in speed notes.
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

        const { clockRate } = this.difficultyAttributes;
        const hitWindow = this.getHitWindow();

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
     * Calculates a multiplier for tap to account for improper tapping based on the deviation and tap difficulty.
     *
     * [Graph](https://www.desmos.com/calculator/z5l9ebrwpi)
     */
    private calculateTapHighDeviationNerf(): number {
        if (this.tapDeviation == Number.POSITIVE_INFINITY) {
            return 0;
        }

        const tapValue = DroidTap.difficultyToPerformance(
            this.difficultyAttributes.tapDifficulty,
        );

        // Decide a point where the PP value achieved compared to the tap deviation is assumed to be tapped
        // improperly. Any PP above this point is considered "excess" tap difficulty. This is used to cause
        // PP above the cutoff to scale logarithmically towards the original tap value thus nerfing the value.
        const excessTapDifficultyCutoff =
            100 + 250 * Math.pow(25 / this.tapDeviation, 6.5);

        if (tapValue <= excessTapDifficultyCutoff) {
            return 1;
        }

        const scale = 50;
        const adjustedTapValue =
            scale *
            (Math.log((tapValue - excessTapDifficultyCutoff) / scale + 1) +
                excessTapDifficultyCutoff / scale);

        // 250 UR and less are considered tapped correctly to ensure that normal scores will be punished as little as possible.
        const t = 1 - Interpolation.reverseLerp(this.tapDeviation, 25, 30);

        return Interpolation.lerp(adjustedTapValue, tapValue, t) / tapValue;
    }

    private getHitWindow() {
        const { overallDifficulty } = this.difficultyAttributes;

        return this.mods.has(ModPrecise)
            ? new PreciseDroidHitWindow(overallDifficulty)
            : new DroidHitWindow(overallDifficulty);
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

    private calculateMaximumComboBasedMissCount(): number {
        let missCount = this.computedAccuracy.nmiss;
        const { combo } = this;
        const { aimTopWeightedSliderFactor, sliderCount, maxCombo } =
            this.difficultyAttributes;

        if (sliderCount <= 0) {
            return missCount;
        }

        // If sliders in the beatmap are hard, it's likely for player to drop sliderends.
        // However, if the beatmap has easy sliders, it's more likely for player to sliderbreak.
        const likelyMissedSliderendPortion =
            0.04 + 0.06 * Math.pow(Math.min(aimTopWeightedSliderFactor, 1), 2);

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
            missCount = Math.pow(fullComboThreshold / Math.max(1, combo), 2.5);
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
            missCount = this.computedAccuracy.nmiss + maxPossibleSliderBreaks;
        }

        return missCount;
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
            this.tap.toFixed(2) +
            " tap, " +
            this.accuracy.toFixed(2) +
            " accuracy, " +
            this.flashlight.toFixed(2) +
            " flashlight, " +
            this.reading.toFixed(2) +
            " reading)"
        );
    }
}
