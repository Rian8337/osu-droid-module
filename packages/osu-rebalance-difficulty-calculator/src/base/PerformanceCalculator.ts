import {
    Accuracy,
    ModNoFail,
    ModSpunOut,
    ModRelax,
    MathUtils,
    Modes,
} from "@rian8337/osu-base";
import { PerformanceCalculationOptions } from "../structures/PerformanceCalculationOptions";
import { DifficultyCalculator } from "./DifficultyCalculator";

/**
 * The base class of performance calculators.
 */
export abstract class PerformanceCalculator<T extends DifficultyCalculator> {
    /**
     * The overall performance value.
     */
    total: number = 0;

    /**
     * The calculated accuracy.
     */
    computedAccuracy: Accuracy = new Accuracy({});

    /**
     * The difficulty calculator that is being calculated.
     */
    readonly difficultyCalculator: T;

    /**
     * Penalty for combo breaks.
     */
    protected comboPenalty: number = 0;

    /**
     * The global multiplier to be applied to the final performance value.
     *
     * This is being adjusted to keep the final value scaled around what it used to be when changing things.
     */
    protected abstract finalMultiplier: number;

    /**
     * The gamemode to calculate for.
     */
    protected abstract readonly mode: Modes;

    /**
     * The amount of misses that are filtered out from sliderbreaks.
     */
    protected effectiveMissCount: number = 0;

    /**
     * Nerf factor used for nerfing beatmaps with very likely dropped sliderends.
     */
    protected sliderNerfFactor: number = 1;

    /**
     * @param difficultyCalculator The difficulty calculator to calculate.
     */
    constructor(difficultyCalculator: T) {
        this.difficultyCalculator = difficultyCalculator;
    }

    /**
     * Calculates the performance points of the beatmap.
     *
     * @param options Options for performance calculation.
     * @returns The current instance.
     */
    calculate(options?: PerformanceCalculationOptions): this {
        this.handleOptions(options);

        this.calculateValues();

        this.calculateTotalValue();

        return this;
    }

    /**
     * Returns a string representative of the class.
     */
    abstract toString(): string;

    /**
     * Calculates all values that will be used for calculating the total
     * performance value of the beatmap and stores them in this instance.
     */
    protected abstract calculateValues(): void;

    /**
     * Calculates the total performance value of the beatmap and stores it in this instance.
     */
    protected abstract calculateTotalValue(): void;

    /**
     * Calculates the base performance value of a star rating.
     */
    protected baseValue(stars: number): number {
        return Math.pow(5 * Math.max(1, stars / 0.0675) - 4, 3) / 100000;
    }

    /**
     * Processes given options for usage in performance calculation.
     *
     * @param options Options for performance calculation.
     */
    protected handleOptions(options?: PerformanceCalculationOptions): void {
        const maxCombo: number = this.difficultyCalculator.beatmap.maxCombo;
        const miss: number = this.computedAccuracy.nmiss;
        const combo: number = options?.combo ?? maxCombo - miss;

        this.comboPenalty = Math.min(Math.pow(combo / maxCombo, 0.8), 1);

        if (options?.accPercent instanceof Accuracy) {
            // Copy into new instance to not modify the original
            this.computedAccuracy = new Accuracy(options.accPercent);

            if (this.computedAccuracy.n300 <= 0) {
                this.computedAccuracy.n300 =
                    this.difficultyCalculator.objects.length -
                    this.computedAccuracy.n100 -
                    this.computedAccuracy.n50 -
                    this.computedAccuracy.nmiss;
            }
        } else {
            this.computedAccuracy = new Accuracy({
                percent: options?.accPercent,
                nobjects: this.difficultyCalculator.objects.length,
                nmiss: options?.miss || 0,
            });
        }

        this.effectiveMissCount = this.calculateEffectiveMissCount(
            combo,
            maxCombo
        );

        if (
            this.difficultyCalculator.mods.some((m) => m instanceof ModNoFail)
        ) {
            this.finalMultiplier *= Math.max(
                0.9,
                1 - 0.02 * this.effectiveMissCount
            );
        }

        if (
            this.difficultyCalculator.mods.some((m) => m instanceof ModSpunOut)
        ) {
            this.finalMultiplier *=
                1 -
                Math.pow(
                    this.difficultyCalculator.beatmap.hitObjects.spinners /
                        this.difficultyCalculator.objects.length,
                    0.85
                );
        }

        if (this.difficultyCalculator.mods.some((m) => m instanceof ModRelax)) {
            // Graph: https://www.desmos.com/calculator/bc9eybdthb
            // We use OD13.3 as maximum since it's the value at which great hit window becomes 0.
            const n100Multiplier: number = Math.max(
                0,
                this.difficultyCalculator.stats.od! > 0
                    ? 1 -
                          Math.pow(
                              this.difficultyCalculator.stats.od! / 13.33,
                              1.8
                          )
                    : 1
            );

            const n50Multiplier: number = Math.max(
                0,
                this.difficultyCalculator.stats.od! > 0.0
                    ? 1 -
                          Math.pow(
                              this.difficultyCalculator.stats.od! / 13.33,
                              5
                          )
                    : 1
            );

            // As we're adding 100s and 50s to an approximated number of combo breaks, the result can be higher
            // than total hits in specific scenarios (which breaks some calculations),  so we need to clamp it.
            this.effectiveMissCount = Math.min(
                this.effectiveMissCount +
                    this.computedAccuracy.n100 * n100Multiplier +
                    this.computedAccuracy.n50 * n50Multiplier,
                this.difficultyCalculator.objects.length
            );
        }

        if (this.difficultyCalculator.beatmap.hitObjects.sliders > 0) {
            // We assume 15% of sliders in a beatmap are difficult since there's no way to tell from the performance calculator.
            const estimateDifficultSliders: number =
                this.difficultyCalculator.beatmap.hitObjects.sliders * 0.15;
            const estimateSliderEndsDropped: number = MathUtils.clamp(
                Math.min(
                    this.computedAccuracy.n300 +
                        this.computedAccuracy.n50 +
                        this.computedAccuracy.nmiss,
                    maxCombo - combo
                ),
                0,
                estimateDifficultSliders
            );

            this.sliderNerfFactor =
                (1 - this.difficultyCalculator.attributes.sliderFactor) *
                    Math.pow(
                        1 -
                            estimateSliderEndsDropped /
                                estimateDifficultSliders,
                        3
                    ) +
                this.difficultyCalculator.attributes.sliderFactor;
        }
    }

    /**
     * Calculates the amount of misses + sliderbreaks from combo.
     */
    private calculateEffectiveMissCount(
        combo: number,
        maxCombo: number
    ): number {
        let comboBasedMissCount: number = 0;

        if (this.difficultyCalculator.beatmap.hitObjects.sliders > 0) {
            const fullComboThreshold: number =
                maxCombo -
                0.1 * this.difficultyCalculator.beatmap.hitObjects.sliders;

            if (combo < fullComboThreshold) {
                // Clamp miss count to maximum amount of possible breaks.
                comboBasedMissCount = Math.min(
                    fullComboThreshold / Math.max(1, combo),
                    this.computedAccuracy.n300 +
                        this.computedAccuracy.n100 +
                        this.computedAccuracy.nmiss
                );
            }
        }

        return Math.max(this.computedAccuracy.nmiss, comboBasedMissCount);
    }
}
