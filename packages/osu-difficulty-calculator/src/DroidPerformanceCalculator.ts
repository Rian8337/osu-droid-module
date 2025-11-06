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
    OsuHitWindow,
    PreciseDroidHitWindow,
} from "@rian8337/osu-base";
import { PerformanceCalculator } from "./base/PerformanceCalculator";
import { DroidAim } from "./skills/droid/DroidAim";
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
     * The penalty used to penalize the flashlight performance value.
     *
     * Can be properly obtained by analyzing the replay associated with the score.
     */
    get flashlightSliderCheesePenalty(): number {
        return this._flashlightSliderCheesePenalty;
    }

    /**
     * The amount of misses, including slider breaks.
     */
    get effectiveMissCount(): number {
        return this._effectiveMissCount;
    }

    static readonly finalMultiplier = 1.24;

    private _aimSliderCheesePenalty = 1;
    private _flashlightSliderCheesePenalty = 1;
    private _tapPenalty = 1;

    private _effectiveMissCount = 0;
    private _deviation = 0;
    private _tapDeviation = 0;

    protected override calculateValues() {
        const { sliderCount, maxCombo } = this.difficultyAttributes;

        if (sliderCount > 0) {
            if (this.usingClassicSliderAccuracy) {
                // Consider that full combo is maximum combo minus dropped slider tails since
                // they don't contribute to combo but also don't break it.
                // In classic scores, we can't know the amount of dropped sliders so we estimate
                // to 10% of all sliders in the beatmap.
                const fullComboThreshold = maxCombo - 0.1 * sliderCount;

                if (this.combo < fullComboThreshold) {
                    this._effectiveMissCount =
                        fullComboThreshold / Math.max(1, this.combo);
                }

                // In classic scores, there can't be more misses than a sum of all non-perfect judgements.
                this._effectiveMissCount = Math.min(
                    this._effectiveMissCount,
                    this.totalImperfectHits,
                );
            } else {
                const fullComboThreshold = maxCombo - this.sliderEndsDropped;

                if (this.combo < fullComboThreshold) {
                    this._effectiveMissCount =
                        fullComboThreshold / Math.max(1, this.combo);
                }

                // Combine regular misses with tick misses, since tick misses break combo as well.
                this._effectiveMissCount = Math.min(
                    this._effectiveMissCount,
                    this.sliderTicksMissed + this.computedAccuracy.nmiss,
                );
            }
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

        this._deviation = this.calculateDeviation();
        this._tapDeviation = this.calculateTapDeviation();

        this.aim = this.calculateAimValue();
        this.tap = this.calculateTapValue();
        this.accuracy = this.calculateAccuracyValue();
        this.flashlight = this.calculateFlashlightValue();
        this.reading = this.calculateReadingValue();

        this.total =
            Math.pow(
                Math.pow(this.aim, 1.1) +
                    Math.pow(this.tap, 1.1) +
                    Math.pow(this.accuracy, 1.1) +
                    Math.pow(this.flashlight, 1.1) +
                    Math.pow(this.reading, 1.1),
                1 / 1.1,
            ) * finalMultiplier;
    }

    protected override handleOptions(
        options?: PerformanceCalculationOptions,
    ): void {
        this._tapPenalty = options?.tapPenalty ?? 1;
        this._aimSliderCheesePenalty = options?.aimSliderCheesePenalty ?? 1;
        this._flashlightSliderCheesePenalty =
            options?.flashlightSliderCheesePenalty ?? 1;

        super.handleOptions(options);
    }

    /**
     * Calculates the aim performance value of the beatmap.
     */
    private calculateAimValue(): number {
        let aimValue = DroidAim.difficultyToPerformance(
            this.difficultyAttributes.aimDifficulty,
        );

        aimValue *= Math.min(
            this.calculateStrainBasedMissPenalty(
                this.difficultyAttributes.aimDifficultStrainCount,
            ),
            this.proportionalMissPenalty,
        );

        // Scale the aim value with estimated full combo deviation.
        aimValue *= this.calculateDeviationBasedLengthScaling();

        const { aimDifficultSliderCount, sliderFactor, maxCombo } =
            this.difficultyAttributes;

        if (aimDifficultSliderCount > 0) {
            let estimateImproperlyFollowedDifficultSliders: number;

            if (this.usingClassicSliderAccuracy) {
                // When the score is considered classic (regardless if it was made on old client or not),
                // we consider all missing combo to be dropped difficult sliders.
                estimateImproperlyFollowedDifficultSliders = MathUtils.clamp(
                    Math.min(this.totalImperfectHits, maxCombo - this.combo),
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

            aimValue *=
                (1 - sliderFactor) *
                    Math.pow(
                        1 -
                            estimateImproperlyFollowedDifficultSliders /
                                aimDifficultSliderCount,
                        3,
                    ) +
                sliderFactor;
        }

        // Scale the aim value with slider cheese penalty.
        aimValue *= this._aimSliderCheesePenalty;

        // Scale the aim value with deviation.
        aimValue *=
            1.025 *
            Math.pow(
                ErrorFunction.erf(25 / (Math.SQRT2 * this._deviation)),
                0.475,
            );

        // OD 7 SS stays the same.
        aimValue *= 0.98 + Math.pow(7, 2) / 2500;

        return aimValue;
    }

    /**
     * Calculates the tap performance value of the beatmap.
     */
    private calculateTapValue(): number {
        let tapValue = DroidTap.difficultyToPerformance(
            this.difficultyAttributes.tapDifficulty,
        );

        tapValue *= this.calculateStrainBasedMissPenalty(
            this.difficultyAttributes.tapDifficultStrainCount,
        );

        // Scale the tap value with estimated full combo deviation.
        // Consider notes that are difficult to tap with respect to other notes, but
        // also cap the note count to prevent buffing filler patterns.
        tapValue *= this.calculateDeviationBasedLengthScaling(
            Math.min(
                this.difficultyAttributes.speedNoteCount,
                this.totalHits / 1.45,
            ),
        );

        // Normalize the deviation to 300 BPM.
        const normalizedDeviation =
            this.tapDeviation *
            Math.max(1, 50 / this.difficultyAttributes.averageSpeedDeltaTime);
        // We expect the player to get 7500/x deviation when doubletapping x BPM.
        // Using this expectation, we penalize scores with deviation above 25.
        const averageBPM =
            60000 / 4 / this.difficultyAttributes.averageSpeedDeltaTime;
        const adjustedDeviation =
            normalizedDeviation *
            (1 +
                1 /
                    (1 +
                        Math.exp(
                            -(normalizedDeviation - 7500 / averageBPM) /
                                ((2 * 300) / averageBPM),
                        )));

        // Scale the tap value with tap deviation.
        tapValue *=
            1.05 *
            Math.pow(
                ErrorFunction.erf(20 / (Math.SQRT2 * adjustedDeviation)),
                0.6,
            );

        // Additional scaling for tap value based on average BPM and how "vibroable" the beatmap is.
        // Higher BPMs require more precise tapping. When the deviation is too high,
        // it can be assumed that the player taps invariant to rhythm.
        // We harshen the punishment for such scenario.
        tapValue *=
            (1 - Math.pow(this.difficultyAttributes.vibroFactor, 6)) /
                (1 +
                    Math.exp(
                        (this._tapDeviation - 7500 / averageBPM) /
                            ((2 * 300) / averageBPM),
                    )) +
            Math.pow(this.difficultyAttributes.vibroFactor, 6);

        tapValue *= this.calculateTapHighDeviationNerf();

        // Scale the tap value with three-fingered penalty.
        tapValue /= this._tapPenalty;

        // OD 8 SS stays the same.
        tapValue *= 0.95 + Math.pow(8, 2) / 750;

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
        accuracyValue *= Math.min(
            1.15,
            Math.sqrt(Math.log(1 + ((Math.E - 1) * ncircles) / 1000)),
        );

        // Scale the accuracy value with rhythm complexity.
        accuracyValue *=
            1.5 /
            (1 +
                Math.exp(
                    -(this.difficultyAttributes.rhythmDifficulty - 1) / 2,
                ));

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

        let flashlightValue =
            Math.pow(this.difficultyAttributes.flashlightDifficulty, 1.6) * 25;

        flashlightValue *= Math.min(
            this.calculateStrainBasedMissPenalty(
                this.difficultyAttributes.flashlightDifficultStrainCount,
            ),
            this.proportionalMissPenalty,
        );

        // Account for shorter maps having a higher ratio of 0 combo/100 combo flashlight radius.
        flashlightValue *=
            0.7 +
            0.1 * Math.min(1, this.totalHits / 200) +
            (this.totalHits > 200
                ? 0.2 * Math.min(1, (this.totalHits - 200) / 200)
                : 0);

        // Scale the flashlight value with slider cheese penalty.
        flashlightValue *= this._flashlightSliderCheesePenalty;

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
        let readingValue = Math.pow(
            Math.pow(this.difficultyAttributes.readingDifficulty, 2) * 25,
            0.8,
        );

        readingValue *= Math.min(
            this.calculateStrainBasedMissPenalty(
                this.difficultyAttributes.readingDifficultNoteCount,
            ),
            this.proportionalMissPenalty,
        );

        // Scale the reading value with estimated full combo deviation.
        // As reading is easily "bypassable" with memorization, punish for memorization.
        readingValue *= this.calculateDeviationBasedLengthScaling(
            undefined,
            true,
        );

        // Scale the reading value with deviation.
        readingValue *=
            1.05 * ErrorFunction.erf(25 / (Math.SQRT2 * this._deviation));

        // OD 5 SS stays the same.
        readingValue *= 0.98 + Math.pow(5, 2) / 2500;

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
        difficultStrainCount: number,
    ): number {
        if (this.effectiveMissCount === 0) {
            return 1;
        }

        return (
            0.96 /
            (this.effectiveMissCount /
                (4 * Math.pow(Math.log(difficultStrainCount), 0.94)) +
                1)
        );
    }

    /**
     * The object-based proportional miss penalty.
     */
    private get proportionalMissPenalty(): number {
        if (this._effectiveMissCount === 0) {
            return 1;
        }

        const missProportion =
            (this.totalHits - this._effectiveMissCount) / (this.totalHits + 1);
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
        punishForMemorization: boolean = false,
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
    private calculateDeviation(): number {
        if (this.totalSuccessfulHits === 0) {
            return Number.POSITIVE_INFINITY;
        }

        const { clockRate } = this.difficultyAttributes;
        const hitWindow = this.getConvertedHitWindow();

        const hitWindow300 = hitWindow.greatWindow / clockRate;
        const hitWindow100 = hitWindow.okWindow / clockRate;
        const hitWindow50 = hitWindow.mehWindow / clockRate;

        const { n100, n50, nmiss } = this.computedAccuracy;

        let objectCount = this.difficultyAttributes.hitCircleCount;

        if (this.mods.has(ModScoreV2)) {
            objectCount += this.difficultyAttributes.sliderCount;
        }

        const missCount = Math.min(nmiss, objectCount);
        const mehCount = Math.min(n50, objectCount - missCount);
        const okCount = Math.min(n100, objectCount - missCount - mehCount);
        const greatCount = Math.max(
            0,
            objectCount - missCount - mehCount - okCount,
        );

        // Assume 100s, 50s, and misses happen on circles. If there are less non-300s on circles than 300s,
        // compute the deviation on circles.
        if (greatCount > 0) {
            // The probability that a player hits a circle is unknown, but we can estimate it to be
            // the number of greats on circles divided by the number of circles, and then add one
            // to the number of circles as a bias correction.
            const greatProbabilityCircle =
                greatCount / (objectCount - missCount - mehCount + 1);

            // Compute the deviation assuming 300s and 100s are normally distributed, and 50s are uniformly distributed.
            // Begin with the normal distribution first.
            let deviationOnCircles =
                hitWindow300 /
                (Math.SQRT2 * ErrorFunction.erfInv(greatProbabilityCircle));

            deviationOnCircles *= Math.sqrt(
                1 -
                    (Math.sqrt(2 / Math.PI) *
                        hitWindow100 *
                        Math.exp(
                            -0.5 *
                                Math.pow(hitWindow100 / deviationOnCircles, 2),
                        )) /
                        (deviationOnCircles *
                            ErrorFunction.erf(
                                hitWindow100 /
                                    (Math.SQRT2 * deviationOnCircles),
                            )),
            );

            // Then compute the variance for 50s.
            const mehVariance =
                (hitWindow50 * hitWindow50 +
                    hitWindow100 * hitWindow50 +
                    hitWindow100 * hitWindow100) /
                3;

            // Find the total deviation.
            deviationOnCircles = Math.sqrt(
                ((greatCount + okCount) * Math.pow(deviationOnCircles, 2) +
                    mehCount * mehVariance) /
                    (greatCount + okCount + mehCount),
            );

            return deviationOnCircles;
        }

        // If there are more non-300s than there are circles, compute the deviation on sliders instead.
        // Here, all that matters is whether or not the slider was missed, since it is impossible
        // to get a 100 or 50 on a slider by mis-tapping it.
        const sliderCount = this.difficultyAttributes.sliderCount;
        const missCountSliders = Math.min(sliderCount, nmiss - missCount);
        const greatCountSliders = sliderCount - missCountSliders;

        // We only get here if nothing was hit. In this case, there is no estimate for deviation.
        // Note that this is never negative, so checking if this is only equal to 0 makes sense.
        if (greatCountSliders === 0) {
            return Number.POSITIVE_INFINITY;
        }

        const greatProbabilitySlider = greatCountSliders / (sliderCount + 1);

        return (
            hitWindow50 /
            (Math.SQRT2 * ErrorFunction.erfInv(greatProbabilitySlider))
        );
    }

    /**
     * Does the same as {@link calculateDeviation}, but only for notes and inaccuracies that are relevant to tap difficulty.
     *
     * Treats all difficult speed notes as circles, so this method can sometimes return a lower deviation than {@link calculateDeviation}.
     * This is fine though, since this method is only used to scale tap pp.
     */
    private calculateTapDeviation(): number {
        if (this.totalSuccessfulHits === 0) {
            return Number.POSITIVE_INFINITY;
        }

        const { clockRate, speedNoteCount } = this.difficultyAttributes;
        const hitWindow = this.getConvertedHitWindow();

        const hitWindow300 = hitWindow.greatWindow / clockRate;
        const hitWindow100 = hitWindow.okWindow / clockRate;
        const hitWindow50 = hitWindow.mehWindow / clockRate;
        const { n100, n50, nmiss } = this.computedAccuracy;

        // Assume a fixed ratio of non-300s hit in speed notes based on speed note count ratio and OD.
        // Graph: https://www.desmos.com/calculator/iskvgjkxr4
        const speedNoteRatio = speedNoteCount / this.totalHits;
        const nonGreatRatio =
            1 -
            (Math.pow(
                Math.exp(Math.sqrt(hitWindow300)) + 1,
                1 - speedNoteRatio,
            ) -
                1) /
                Math.exp(Math.sqrt(hitWindow300));

        // Assume worst case - all non-300s happened in speed notes.
        const relevantCountMiss = Math.min(
            nmiss * nonGreatRatio,
            speedNoteCount,
        );

        const relevantCountMeh = Math.min(
            n50 * nonGreatRatio,
            speedNoteCount - relevantCountMiss,
        );

        const relevantCountOk = Math.min(
            n100 * nonGreatRatio,
            speedNoteCount - relevantCountMiss - relevantCountMeh,
        );

        const relevantCountGreat = Math.max(
            0,
            speedNoteCount -
                relevantCountMiss -
                relevantCountMeh -
                relevantCountOk,
        );

        if (relevantCountGreat + relevantCountOk + relevantCountMeh <= 0) {
            return Number.POSITIVE_INFINITY;
        }

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
                hitWindow300 / (Math.SQRT2 * ErrorFunction.erfInv(pLowerBound));

            // Subtract the deviation provided by tails that land outside the 100 hit window from the deviation computed above.
            // This is equivalent to calculating the deviation of a normal distribution truncated at +-okHitWindow.
            const hitWindow100TailAmount =
                (Math.sqrt(2 / Math.PI) *
                    hitWindow100 *
                    Math.exp(-0.5 * Math.pow(hitWindow100 / deviation, 2))) /
                (deviation *
                    ErrorFunction.erf(hitWindow100 / (Math.SQRT2 * deviation)));

            deviation *= Math.sqrt(1 - hitWindow100TailAmount);
        } else {
            // A tested limit value for the case of a score only containing 100s.
            deviation = hitWindow100 / Math.sqrt(3);
        }

        // Compute and add the variance for 50s, assuming that they are uniformly distriubted.
        const mehVariance =
            (hitWindow50 * hitWindow50 +
                hitWindow100 * hitWindow50 +
                hitWindow100 * hitWindow100) /
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

    private getConvertedHitWindow() {
        const hitWindow300 = new OsuHitWindow(
            this.difficultyAttributes.overallDifficulty,
        ).greatWindow;

        if (this.mods.has(ModPrecise)) {
            return new PreciseDroidHitWindow(
                PreciseDroidHitWindow.greatWindowToOD(
                    hitWindow300 * this.difficultyAttributes.clockRate,
                ),
            );
        } else {
            return new DroidHitWindow(
                DroidHitWindow.greatWindowToOD(
                    hitWindow300 * this.difficultyAttributes.clockRate,
                ),
            );
        }
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
