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

    override readonly difficultyAttributes: DroidDifficultyAttributes;
    protected override finalMultiplier = 1.24;
    protected override readonly mode: Modes = Modes.droid;

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
     * The total performance value will be recalculated afterwards.
     *
     * @param value The tap penalty value. Must be greater than 0.
     */
    applyTapPenalty(value: number): void {
        if (value <= 0) {
            throw new RangeError("New tap penalty must be greater than zero.");
        }

        if (value === this._tapPenalty) {
            return;
        }

        this.tap *= this._tapPenalty / value;
        this._tapPenalty = value;

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

        // Scale the aim value with accuracy and OD.
        // const od: number = this.difficultyAttributes.overallDifficulty;
        // const odScaling: number = Math.pow(od, 2) / 2500;
        // this.aim *=
        //     (0.98 + (od > 0 ? odScaling : -odScaling)) *
        //     Math.pow(
        //         this.computedAccuracy.value(this.totalHits),
        //         (14 - Math.max(od, 2.5)) / 2
        //     );

        this.aim *= ErrorFunction.erf(50 / (Math.SQRT2 * this._deviation));
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

        // Calculate accuracy assuming the worst case scenario.
        // const countGreat: number = this.computedAccuracy.n300;
        // const countOk: number = this.computedAccuracy.n100;
        // const countMeh: number = this.computedAccuracy.n50;

        // const relevantTotalDiff: number =
        //     this.totalHits - this.difficultyAttributes.speedNoteCount;

        // const relevantAccuracy: Accuracy = new Accuracy({
        //     n300: Math.max(0, countGreat - relevantTotalDiff),
        //     n100: Math.max(
        //         0,
        //         countOk - Math.max(0, relevantTotalDiff - countGreat)
        //     ),
        //     n50: Math.max(
        //         0,
        //         countMeh - Math.max(0, relevantTotalDiff - countGreat - countOk)
        //     ),
        //     nmiss: this.effectiveMissCount,
        // });

        // Scale the tap value with accuracy and OD.
        // const od: number = this.difficultyAttributes.overallDifficulty;
        // const odScaling: number = Math.pow(od, 2) / 750;
        // this.tap *=
        //     (0.95 + (od > 0 ? odScaling : -odScaling)) *
        //     Math.pow(
        //         (this.computedAccuracy.value(this.totalHits) +
        //             relevantAccuracy.value(
        //                 this.difficultyAttributes.speedNoteCount
        //             )) /
        //             2,
        //         (14 - Math.max(od, 2.5)) / 2
        //     );

        // Scale the tap value with # of 50s to punish doubletapping.
        // this.tap *= Math.pow(
        //     0.99,
        //     Math.max(0, this.computedAccuracy.n50 - this.totalHits / 500)
        // );
        this.tap *= ErrorFunction.erf(20 / (Math.SQRT2 * this._tapDeviation));

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

        // const ncircles: number = this.difficultyAttributes.mods.some(
        //     (m) => m instanceof ModScoreV2
        // )
        //     ? this.totalHits - this.difficultyAttributes.spinnerCount
        //     : this.difficultyAttributes.hitCircleCount;

        // if (ncircles === 0) {
        //     this.accuracy = 0;

        //     return;
        // }

        // const realAccuracy: Accuracy = new Accuracy({
        //     ...this.computedAccuracy,
        //     n300: this.computedAccuracy.n300 - (this.totalHits - ncircles),
        // });

        // Lots of arbitrary values from testing.
        // Considering to use derivation from perfect accuracy in a probabilistic manner - assume normal distribution
        // this.accuracy =
        //     Math.pow(1.4, this.difficultyAttributes.overallDifficulty) *
        //     Math.pow(realAccuracy.value(ncircles), 12) *
        //     10;

        // Bonus for many hitcircles - it's harder to keep good accuracy up for longer
        // this.accuracy *= Math.min(1.15, Math.pow(ncircles / 1000, 0.3));
        this.accuracy = 477.793 * Math.exp(-0.197612 * this._deviation);

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

        // Scale the flashlight value with accuracy slightly.
        // this.flashlight *=
        //     0.5 + this.computedAccuracy.value(this.totalHits) / 2;

        // It is also important to consider accuracy difficulty when doing that.
        // const od: number = this.difficultyAttributes.overallDifficulty;
        // const odScaling: number = Math.pow(od, 2) / 2500;
        // this.flashlight *= 0.98 + (od >= 0 ? odScaling : -odScaling);
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

        // Scale the visual value with accuracy harshly.
        // this.visual *= Math.pow(this.computedAccuracy.value(), 8);

        // It is also important to consider accuracy difficulty when doing that.
        // const od: number = this.difficultyAttributes.overallDifficulty;
        // const odScaling: number = Math.pow(od, 2) / 2500;
        // this.visual *= 0.98 + (od >= 0 ? odScaling : -odScaling);
        this.visual *= ErrorFunction.erf(50 / (Math.SQRT2 * this._deviation));
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

        const hitWindow300: number = new OsuHitWindow(
            this.difficultyAttributes.overallDifficulty
        ).hitWindowFor300();
        const relevantTotalDiff: number =
            this.totalHits - this.difficultyAttributes.speedNoteCount;
        const relevantCountGreat = Math.max(
            0,
            this.computedAccuracy.n300 - relevantTotalDiff
        );

        if (relevantCountGreat == 0) {
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
