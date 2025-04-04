import {
    DroidHitWindow,
    ErrorFunction,
    ModFlashlight,
    ModPrecise,
    ModRelax,
    ModScoreV2,
    Modes,
    OsuHitWindow,
    PreciseDroidHitWindow,
} from "@rian8337/osu-base";
import { PerformanceCalculator } from "./base/PerformanceCalculator";
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
     * The visual performance value.
     */
    visual = 0;

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
     * The penalty used to penalize the visual performance value.
     *
     * Can be properly obtained by analyzing the replay associated with the score.
     */
    get visualSliderCheesePenalty(): number {
        return this._visualSliderCheesePenalty;
    }

    protected override finalMultiplier = 1.24;
    protected override readonly mode = Modes.droid;

    private _aimSliderCheesePenalty = 1;
    private _flashlightSliderCheesePenalty = 1;
    private _visualSliderCheesePenalty = 1;

    private _tapPenalty = 1;
    private _deviation = 0;
    private _tapDeviation = 0;

    /**
     * Applies a tap penalty value to this calculator.
     *
     * The tap and total performance value will be recalculated afterwards.
     *
     * @param value The tap penalty value. Must be greater than or equal to 1.
     */
    applyTapPenalty(value: number): void {
        if (value < 1) {
            throw new RangeError(
                "New tap penalty must be greater than or equal to one.",
            );
        }

        if (value === this._tapPenalty) {
            return;
        }

        this._tapPenalty = value;
        this.tap = this.calculateTapValue();
        this.total = this.calculateTotalValue();
    }

    /**
     * Applies an aim slider cheese penalty value to this calculator.
     *
     * The aim and total performance value will be recalculated afterwards.
     *
     * @param value The slider cheese penalty value. Must be between than 0 and 1.
     */
    applyAimSliderCheesePenalty(value: number): void {
        if (value < 0) {
            throw new RangeError(
                "New aim slider cheese penalty must be greater than or equal to zero.",
            );
        }

        if (value > 1) {
            throw new RangeError(
                "New aim slider cheese penalty must be less than or equal to one.",
            );
        }

        if (value === this._aimSliderCheesePenalty) {
            return;
        }

        this._aimSliderCheesePenalty = value;
        this.aim = this.calculateAimValue();
        this.total = this.calculateTotalValue();
    }

    /**
     * Applies a flashlight slider cheese penalty value to this calculator.
     *
     * The flashlight and total performance value will be recalculated afterwards.
     *
     * @param value The slider cheese penalty value. Must be between 0 and 1.
     */
    applyFlashlightSliderCheesePenalty(value: number): void {
        if (value < 0) {
            throw new RangeError(
                "New flashlight slider cheese penalty must be greater than or equal to zero.",
            );
        }

        if (value > 1) {
            throw new RangeError(
                "New flashlight slider cheese penalty must be less than or equal to one.",
            );
        }

        if (value === this._flashlightSliderCheesePenalty) {
            return;
        }

        this._flashlightSliderCheesePenalty = value;
        this.flashlight = this.calculateFlashlightValue();
        this.total = this.calculateTotalValue();
    }

    /**
     * Applies a visual slider cheese penalty value to this calculator.
     *
     * The visual and total performance value will be recalculated afterwards.
     *
     * @param value The slider cheese penalty value. Must be between 0 and 1.
     */
    applyVisualSliderCheesePenalty(value: number): void {
        if (value < 0) {
            throw new RangeError(
                "New visual slider cheese penalty must be greater than or equal to zero.",
            );
        }

        if (value > 1) {
            throw new RangeError(
                "New visual slider cheese penalty must be less than or equal to one.",
            );
        }

        if (value === this._visualSliderCheesePenalty) {
            return;
        }

        this._visualSliderCheesePenalty = value;
        this.visual = this.calculateVisualValue();
        this.total = this.calculateTotalValue();
    }

    protected override calculateValues(): void {
        this._deviation = this.calculateDeviation();
        this._tapDeviation = this.calculateTapDeviation();

        this.aim = this.calculateAimValue();
        this.tap = this.calculateTapValue();
        this.accuracy = this.calculateAccuracyValue();
        this.flashlight = this.calculateFlashlightValue();
        this.visual = this.calculateVisualValue();
    }

    protected override calculateTotalValue(): number {
        return (
            Math.pow(
                Math.pow(this.aim, 1.1) +
                    Math.pow(this.tap, 1.1) +
                    Math.pow(this.accuracy, 1.1) +
                    Math.pow(this.flashlight, 1.1) +
                    Math.pow(this.visual, 1.1),
                1 / 1.1,
            ) * this.finalMultiplier
        );
    }

    protected override handleOptions(
        options?: PerformanceCalculationOptions,
    ): void {
        this._tapPenalty = options?.tapPenalty ?? 1;
        this._aimSliderCheesePenalty = options?.aimSliderCheesePenalty ?? 1;
        this._flashlightSliderCheesePenalty =
            options?.flashlightSliderCheesePenalty ?? 1;
        this._visualSliderCheesePenalty =
            options?.visualSliderCheesePenalty ?? 1;

        super.handleOptions(options);
    }

    /**
     * Calculates the aim performance value of the beatmap.
     */
    private calculateAimValue(): number {
        let aimValue = this.baseValue(
            Math.pow(this.difficultyAttributes.aimDifficulty, 0.8),
        );

        aimValue *= Math.min(
            this.calculateStrainBasedMissPenalty(
                this.difficultyAttributes.aimDifficultStrainCount,
            ),
            this.proportionalMissPenalty,
        );

        // Scale the aim value with estimated full combo deviation.
        aimValue *= this.calculateDeviationBasedLengthScaling();

        // Scale the aim value with slider factor to nerf very likely dropped sliderends.
        aimValue *= this.sliderNerfFactor;

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
        let tapValue = this.baseValue(this.difficultyAttributes.tapDifficulty);

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
            Math.max(0, this.effectiveMissCount - 1),
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
     * Calculates the visual performance value of the beatmap.
     */
    private calculateVisualValue(): number {
        let visualValue =
            Math.pow(this.difficultyAttributes.visualDifficulty, 1.6) * 22.5;

        visualValue *= Math.min(
            this.calculateStrainBasedMissPenalty(
                this.difficultyAttributes.visualDifficultStrainCount,
            ),
            this.proportionalMissPenalty,
        );

        // Scale the visual value with estimated full combo deviation.
        // As visual is easily "bypassable" with memorization, punish for memorization.
        visualValue *= this.calculateDeviationBasedLengthScaling(
            undefined,
            true,
        );

        // Scale the visual value with slider cheese penalty.
        visualValue *= this._visualSliderCheesePenalty;

        // Scale the visual value with deviation.
        visualValue *=
            1.05 *
            Math.pow(
                ErrorFunction.erf(25 / (Math.SQRT2 * this._deviation)),
                0.775,
            );

        // OD 5 SS stays the same.
        visualValue *= 0.98 + Math.pow(5, 2) / 2500;

        return visualValue;
    }

    /**
     * The object-based proportional miss penalty.
     */
    private get proportionalMissPenalty(): number {
        if (this.effectiveMissCount === 0) {
            return 1;
        }

        const missProportion =
            (this.totalHits - this.effectiveMissCount) / (this.totalHits + 1);
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
     * Estimates the player's tap deviation based on the OD, number of circles and sliders,
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

        const circleCount = this.difficultyAttributes.hitCircleCount;
        const missCountCircles = Math.min(nmiss, circleCount);
        const mehCountCircles = Math.min(n50, circleCount - missCountCircles);
        const okCountCircles = Math.min(
            n100,
            circleCount - missCountCircles - mehCountCircles,
        );
        const greatCountCircles = Math.max(
            0,
            circleCount - missCountCircles - mehCountCircles - okCountCircles,
        );

        // Assume 100s, 50s, and misses happen on circles. If there are less non-300s on circles than 300s,
        // compute the deviation on circles.
        if (greatCountCircles > 0) {
            // The probability that a player hits a circle is unknown, but we can estimate it to be
            // the number of greats on circles divided by the number of circles, and then add one
            // to the number of circles as a bias correction.
            const greatProbabilityCircle =
                greatCountCircles /
                (circleCount - missCountCircles - mehCountCircles + 1);

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
                ((greatCountCircles + okCountCircles) *
                    Math.pow(deviationOnCircles, 2) +
                    mehCountCircles * mehVariance) /
                    (greatCountCircles + okCountCircles + mehCountCircles),
            );

            return deviationOnCircles;
        }

        // If there are more non-300s than there are circles, compute the deviation on sliders instead.
        // Here, all that matters is whether or not the slider was missed, since it is impossible
        // to get a 100 or 50 on a slider by mis-tapping it.
        const sliderCount = this.difficultyAttributes.sliderCount;
        const missCountSliders = Math.min(
            sliderCount,
            nmiss - missCountCircles,
        );
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

        const { speedNoteCount, clockRate } = this.difficultyAttributes;
        const hitWindow = this.getConvertedHitWindow();

        const hitWindow300 = hitWindow.greatWindow / clockRate;
        const hitWindow100 = hitWindow.okWindow / clockRate;
        const hitWindow50 = hitWindow.mehWindow / clockRate;

        const { n100, n50, nmiss } = this.computedAccuracy;

        // Assume a fixed ratio of non-300s hit in speed notes based on speed note count ratio and OD.
        // Graph: https://www.desmos.com/calculator/iskvgjkxr4
        const speedNoteRatio = speedNoteCount / this.totalHits;

        const nonGreatCount = n100 + n50 + nmiss;
        const nonGreatRatio =
            1 -
            (Math.pow(
                Math.exp(Math.sqrt(hitWindow300)) + 1,
                1 - speedNoteRatio,
            ) -
                1) /
                Math.exp(Math.sqrt(hitWindow300));

        const relevantCountGreat = Math.max(
            0,
            speedNoteCount - nonGreatCount * nonGreatRatio,
        );
        const relevantCountOk = n100 * nonGreatRatio;
        const relevantCountMeh = n50 * nonGreatRatio;
        const relevantCountMiss = nmiss * nonGreatRatio;

        // Assume 100s, 50s, and misses happen on circles. If there are less non-300s on circles than 300s,
        // compute the deviation on circles.
        if (relevantCountGreat > 0) {
            // The probability that a player hits a circle is unknown, but we can estimate it to be
            // the number of greats on circles divided by the number of circles, and then add one
            // to the number of circles as a bias correction.
            const greatProbabilityCircle =
                relevantCountGreat /
                (speedNoteCount - relevantCountMiss - relevantCountMeh + 1);

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
                ((relevantCountGreat + relevantCountOk) *
                    Math.pow(deviationOnCircles, 2) +
                    relevantCountMeh * mehVariance) /
                    (relevantCountGreat + relevantCountOk + relevantCountMeh),
            );

            return deviationOnCircles;
        }

        return Number.POSITIVE_INFINITY;
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
            " acc, " +
            this.flashlight.toFixed(2) +
            " flashlight, " +
            this.visual.toFixed(2) +
            " visual)"
        );
    }
}
