import {
    ModRelax,
    ModFlashlight,
    Modes,
    Utils,
    OsuHitWindow,
    MapStats,
    DroidHitWindow,
    ModPrecise,
    ErrorFunction,
    ModScoreV2,
} from "@rian8337/osu-base";
import { PerformanceCalculator } from "./base/PerformanceCalculator";
import { DroidDifficultyAttributes } from "./structures/DroidDifficultyAttributes";
import { PerformanceCalculationOptions } from "./structures/PerformanceCalculationOptions";

/**
 * A performance points calculator that calculates performance points for osu!droid gamemode.
 */
export class DroidPerformanceCalculator extends PerformanceCalculator {
    /**
     * The aim performance value.
     */
    aim: number = 0;

    /**
     * The tap performance value.
     */
    tap: number = 0;

    /**
     * The accuracy performance value.
     */
    accuracy: number = 0;

    /**
     * The flashlight performance value.
     */
    flashlight: number = 0;

    /**
     * The visual performance value.
     */
    visual: number = 0;

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

    override readonly difficultyAttributes: DroidDifficultyAttributes;
    protected override finalMultiplier = 1.24;
    protected override readonly mode: Modes = Modes.droid;

    private _aimSliderCheesePenalty: number = 1;
    private _flashlightSliderCheesePenalty: number = 1;
    private _visualSliderCheesePenalty: number = 1;

    private _tapPenalty: number = 1;
    private _deviation: number = 0;
    private _tapDeviation: number = 0;

    /**
     * @param difficultyAttributes The difficulty attributes to calculate.
     */
    constructor(difficultyAttributes: DroidDifficultyAttributes) {
        super();

        this.difficultyAttributes = Utils.deepCopy(difficultyAttributes);
    }

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
                "New tap penalty must be greater than or equal to one."
            );
        }

        if (value === this._tapPenalty) {
            return;
        }

        this.tap *= this._tapPenalty / value;
        this._tapPenalty = value;

        this.calculateTotalValue();
    }

    /**
     * Applies an aim slider cheese penalty value to this calculator.
     *
     * The aim and total performance value will be recalculated afterwards.
     *
     * @param value The slider cheese penalty value. Must be between than 0 (exclusive) and 1 (inclusive).
     */
    applyAimSliderCheesePenalty(value: number): void {
        if (value <= 0) {
            throw new RangeError(
                "New aim slider cheese penalty must be greater than zero."
            );
        }

        if (value > 1) {
            throw new RangeError(
                "New aim slider cheese penalty must be less than or equal to one."
            );
        }

        if (value === this._aimSliderCheesePenalty) {
            return;
        }

        this.aim *= value / this._aimSliderCheesePenalty;
        this._aimSliderCheesePenalty = value;

        this.calculateTotalValue();
    }

    /**
     * Applies a flashlight slider cheese penalty value to this calculator.
     *
     * The flashlight and total performance value will be recalculated afterwards.
     *
     * @param value The slider cheese penalty value. Must be between 0 (exclusive) and 1 (inclusive).
     */
    applyFlashlightSliderCheesePenalty(value: number): void {
        if (value <= 0) {
            throw new RangeError(
                "New flashlight slider cheese penalty must be greater than zero."
            );
        }

        if (value > 1) {
            throw new RangeError(
                "New flashlight slider cheese penalty must be less than or equal to one."
            );
        }

        if (value === this._flashlightSliderCheesePenalty) {
            return;
        }

        this.flashlight *= value / this._flashlightSliderCheesePenalty;
        this._flashlightSliderCheesePenalty = value;

        this.calculateTotalValue();
    }

    /**
     * Applies a visual slider cheese penalty value to this calculator.
     *
     * The visual and total performance value will be recalculated afterwards.
     *
     * @param value The slider cheese penalty value. Must be between 0 (exclusive) and 1 (inclusive).
     */
    applyVisualSliderCheesePenalty(value: number): void {
        if (value <= 0) {
            throw new RangeError(
                "New visual slider cheese penalty must be greater than zero."
            );
        }

        if (value > 1) {
            throw new RangeError(
                "New visual slider cheese penalty must be less than or equal to one."
            );
        }

        if (value === this._visualSliderCheesePenalty) {
            return;
        }

        this.visual *= value / this._visualSliderCheesePenalty;
        this._visualSliderCheesePenalty = value;

        this.calculateTotalValue();
    }

    protected override calculateValues(): void {
        this._deviation = this.calculateDeviation();
        this._tapDeviation = this.calculateTapDeviation();

        this.calculateAimValue();
        this.calculateTapValue();
        this.calculateAccuracyValue();
        this.calculateFlashlightValue();
        this.calculateVisualValue();
    }

    protected override calculateTotalValue(): void {
        this.total =
            Math.pow(
                Math.pow(this.aim, 1.1) +
                    Math.pow(this.tap, 1.1) +
                    Math.pow(this.accuracy, 1.1) +
                    Math.pow(this.flashlight, 1.1) +
                    Math.pow(this.visual, 1.1),
                1 / 1.1
            ) * this.finalMultiplier;
    }

    protected override handleOptions(
        options?: PerformanceCalculationOptions
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
    private calculateAimValue(): void {
        this.aim = this.baseValue(
            Math.pow(this.difficultyAttributes.aimDifficulty, 0.8)
        );

        if (this.effectiveMissCount > 0) {
            // Penalize misses by assessing # of misses relative to the total # of objects.
            // Default a 3% reduction for any # of misses.
            this.aim *=
                0.97 *
                Math.pow(
                    1 -
                        Math.pow(
                            this.effectiveMissCount / this.totalHits,
                            0.775
                        ),
                    this.effectiveMissCount
                );
        }

        // Combo scaling
        this.aim *= this.comboPenalty;

        // Scale the aim value with slider factor to nerf very likely dropped sliderends.
        this.aim *= this.sliderNerfFactor;

        // Scale the aim value with slider cheese penalty.
        this.aim *= this._aimSliderCheesePenalty;

        // Scale the aim value with deviation.
        this.aim *=
            1.05 *
            Math.pow(
                ErrorFunction.erf(32.0625 / (Math.SQRT2 * this._deviation)),
                1.5
            );
    }

    /**
     * Calculates the tap performance value of the beatmap.
     */
    private calculateTapValue(): void {
        this.tap = this.baseValue(this.difficultyAttributes.tapDifficulty);

        if (this.effectiveMissCount > 0) {
            // Penalize misses by assessing # of misses relative to the total # of objects.
            // Default a 3% reduction for any # of misses.
            this.tap *=
                0.97 *
                Math.pow(
                    1 -
                        Math.pow(
                            this.effectiveMissCount / this.totalHits,
                            0.775
                        ),
                    Math.pow(this.effectiveMissCount, 0.875)
                );
        }

        // Combo scaling
        this.tap *= this.comboPenalty;

        // Scale the tap value with tap deviation.
        this.tap *=
            1.1 *
            Math.pow(
                ErrorFunction.erf(25 / (Math.SQRT2 * this._tapDeviation)),
                1.25
            );

        // Scale the tap value with three-fingered penalty.
        this.tap /= this._tapPenalty;
    }

    /**
     * Calculates the accuracy performance value of the beatmap.
     */
    private calculateAccuracyValue(): void {
        if (
            this.difficultyAttributes.mods.some((m) => m instanceof ModRelax) ||
            this.totalSuccessfulHits === 0
        ) {
            this.accuracy = 0;

            return;
        }

        this.accuracy =
            650 *
            Math.exp(-0.125 * this._deviation) *
            // The following function is to give higher reward for deviations lower than 25 (250 UR).
            (15 / (this._deviation + 15) + 0.65);

        // Bonus for many hitcircles - it's harder to keep good accuracy up for longer.
        const ncircles: number = this.difficultyAttributes.mods.some(
            (m) => m instanceof ModScoreV2
        )
            ? this.totalHits - this.difficultyAttributes.spinnerCount
            : this.difficultyAttributes.hitCircleCount;

        this.accuracy *= Math.min(
            1.15,
            Math.sqrt(Math.log(1 + ((Math.E - 1) * ncircles) / 1000))
        );

        // Scale the accuracy value with rhythm complexity.
        this.accuracy *=
            1.5 /
            (1 +
                Math.exp(
                    -(this.difficultyAttributes.rhythmDifficulty - 1) / 2
                ));

        if (
            this.difficultyAttributes.mods.some(
                (m) => m instanceof ModFlashlight
            )
        ) {
            this.accuracy *= 1.02;
        }
    }

    /**
     * Calculates the flashlight performance value of the beatmap.
     */
    private calculateFlashlightValue(): void {
        if (
            !this.difficultyAttributes.mods.some(
                (m) => m instanceof ModFlashlight
            )
        ) {
            this.flashlight = 0;

            return;
        }

        this.flashlight =
            Math.pow(this.difficultyAttributes.flashlightDifficulty, 1.6) * 25;

        // Combo scaling
        this.flashlight *= this.comboPenalty;

        if (this.effectiveMissCount > 0) {
            // Penalize misses by assessing # of misses relative to the total # of objects. Default a 3% reduction for any # of misses.
            this.flashlight *=
                0.97 *
                Math.pow(
                    1 -
                        Math.pow(
                            this.effectiveMissCount / this.totalHits,
                            0.775
                        ),
                    Math.pow(this.effectiveMissCount, 0.875)
                );
        }

        // Account for shorter maps having a higher ratio of 0 combo/100 combo flashlight radius.
        this.flashlight *=
            0.7 +
            0.1 * Math.min(1, this.totalHits / 200) +
            (this.totalHits > 200
                ? 0.2 * Math.min(1, (this.totalHits - 200) / 200)
                : 0);

        // Scale the flashlight value with slider cheese penalty.
        this.flashlight *= this._flashlightSliderCheesePenalty;

        // Scale the flashlight value with deviation.
        this.flashlight *= ErrorFunction.erf(
            50 / (Math.SQRT2 * this._deviation)
        );
    }

    /**
     * Calculates the visual performance value of the beatmap.
     */
    private calculateVisualValue(): void {
        this.visual =
            Math.pow(this.difficultyAttributes.visualDifficulty, 1.6) * 22.5;

        if (this.effectiveMissCount > 0) {
            // Penalize misses by assessing # of misses relative to the total # of objects. Default a 3% reduction for any # of misses.
            this.visual *=
                0.97 *
                Math.pow(
                    1 -
                        Math.pow(
                            this.effectiveMissCount / this.totalHits,
                            0.775
                        ),
                    this.effectiveMissCount
                );
        }

        // Combo scaling
        this.visual *= this.comboPenalty;

        // Scale the visual value with object count to penalize short maps.
        this.visual *= Math.min(
            1,
            1.650668 +
                (0.4845796 - 1.650668) /
                    (1 + Math.pow(this.totalHits / 817.9306, 1.147469))
        );

        // Scale the visual value with slider cheese penalty.
        this.visual *= this._visualSliderCheesePenalty;

        // Scale the visual value with deviation.
        this.visual *=
            1.065 *
            Math.pow(
                ErrorFunction.erf(30 / (Math.SQRT2 * this._deviation)),
                1.75
            );
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

        const hitWindow300: number = new OsuHitWindow(
            this.difficultyAttributes.overallDifficulty
        ).hitWindowFor300();

        // Obtain the 50 hit window for droid.
        const clockRate: number = new MapStats({
            mods: this.difficultyAttributes.mods,
        }).calculate().speedMultiplier;

        const realHitWindow300: number = hitWindow300 * clockRate;
        const droidHitWindow: DroidHitWindow = new DroidHitWindow(
            OsuHitWindow.hitWindow300ToOD(realHitWindow300)
        );
        const hitWindow50: number =
            droidHitWindow.hitWindowFor50(
                this.difficultyAttributes.mods.some(
                    (m) => m instanceof ModPrecise
                )
            ) / clockRate;

        const greatCountOnCircles: number =
            this.difficultyAttributes.hitCircleCount -
            this.computedAccuracy.n100 -
            this.computedAccuracy.n50 -
            this.computedAccuracy.nmiss;

        // The probability that a player hits a circle is unknown, but we can estimate it to be
        // the number of greats on circles divided by the number of circles, and then add one
        // to the number of circles as a bias correction / bayesian prior.
        const greatProbabilityCircle: number = Math.max(
            0,
            greatCountOnCircles / (this.difficultyAttributes.hitCircleCount + 1)
        );
        let greatProbabilitySlider: number;

        if (greatCountOnCircles < 0) {
            const nonCircleMisses: number = -greatCountOnCircles;
            greatProbabilitySlider = Math.max(
                0,
                (this.difficultyAttributes.sliderCount - nonCircleMisses) /
                    (this.difficultyAttributes.sliderCount + 1)
            );
        } else {
            greatProbabilitySlider =
                this.difficultyAttributes.sliderCount /
                (this.difficultyAttributes.sliderCount + 1);
        }

        if (greatProbabilityCircle === 0 && greatProbabilitySlider === 0) {
            return Number.POSITIVE_INFINITY;
        }

        const deviationOnCircles: number =
            hitWindow300 /
            (Math.SQRT2 * ErrorFunction.erfInv(greatProbabilityCircle));
        const deviationOnSliders: number =
            hitWindow50 /
            (Math.SQRT2 * ErrorFunction.erfInv(greatProbabilitySlider));

        return Math.min(deviationOnCircles, deviationOnSliders);
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

        // Assume a fixed ratio of non-300s hit in speed notes based on speed note count ratio and OD.
        // Graph: https://www.desmos.com/calculator/31argjcxqc
        const hitWindow300: number = new OsuHitWindow(
            this.difficultyAttributes.overallDifficulty
        ).hitWindowFor300();
        const speedNoteRatio: number =
            this.difficultyAttributes.speedNoteCount / this.totalHits;

        const nonGreatCount: number =
            this.computedAccuracy.n100 +
            this.computedAccuracy.n50 +
            this.computedAccuracy.nmiss;
        const nonGreatRatio: number =
            (ErrorFunction.erf(5 * Math.sqrt(speedNoteRatio)) /
                ErrorFunction.erf(5)) *
            (1 -
                (1 - speedNoteRatio) *
                    ErrorFunction.erf(1 - speedNoteRatio) *
                    ErrorFunction.erf(20 / hitWindow300));
        const relevantCountGreat: number = Math.max(
            0,
            this.difficultyAttributes.speedNoteCount -
                nonGreatCount * nonGreatRatio
        );

        if (relevantCountGreat === 0) {
            return Number.POSITIVE_INFINITY;
        }

        const greatProbability: number =
            relevantCountGreat / (this.difficultyAttributes.speedNoteCount + 1);

        return (
            hitWindow300 / (Math.SQRT2 * ErrorFunction.erfInv(greatProbability))
        );
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
