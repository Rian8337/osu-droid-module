import {
    Accuracy,
    MapStats,
    modes,
    Mod,
    ModNoFail,
    ModSpunOut,
    ModRelax,
    MathUtils,
} from "@rian8337/osu-base";
import { DifficultyCalculator } from "./DifficultyCalculator";

/**
 * The base class of performance calculators.
 */
export abstract class PerformanceCalculator {
    /**
     * The overall performance value.
     */
    total: number = 0;

    /**
     * The calculated accuracy.
     */
    computedAccuracy: Accuracy = new Accuracy({});

    /**
     * The calculated beatmap.
     */
    abstract stars: DifficultyCalculator;

    /**
     * The map statistics after applying modifications.
     */
    protected mapStatistics: MapStats = new MapStats();

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
     * The amount of misses that are filtered out from sliderbreaks.
     */
    protected effectiveMissCount: number = 0;

    /**
     * Nerf factor used for nerfing beatmaps with very likely dropped sliderends.
     */
    protected sliderNerfFactor: number = 1;

    /**
     * Calculates the performance points of a beatmap.
     */
    abstract calculate(params: {
        /**
         * The star rating instance to calculate.
         */
        stars: DifficultyCalculator;

        /**
         * The maximum combo achieved in the score.
         */
        combo?: number;

        /**
         * The accuracy achieved in the score.
         */
        accPercent?: Accuracy | number;

        /**
         * The amount of misses achieved in the score.
         */
        miss?: number;

        /**
         * The tap penalty to apply for penalized scores. Only applies to droid gamemode.
         */
        tapPenalty?: number;

        /**
         * Custom map statistics to apply custom speed multiplier and force AR values as well as old statistics.
         */
        stats?: MapStats;
    }): this;

    /**
     * Returns a string representative of the class.
     */
    abstract toString(): string;

    /**
     * Internal calculation method, used to process calculation from implementations.
     */
    protected calculateInternal(
        params: {
            /**
             * The star rating instance to calculate.
             */
            stars: DifficultyCalculator;

            /**
             * The maximum combo achieved in the score.
             */
            combo?: number;

            /**
             * The accuracy achieved in the score.
             */
            accPercent?: Accuracy | number;

            /**
             * The amount of misses achieved in the score.
             */
            miss?: number;

            /**
             * The tap penalty to apply for penalized scores. Only applies to droid gamemode.
             */
            tapPenalty?: number;

            /**
             * Custom map statistics to apply custom speed multiplier and force AR values as well as old statistics.
             */
            stats?: MapStats;
        },
        mode: modes
    ): this {
        this.handleParams(params, mode);

        this.calculateValues();

        this.total = this.calculateTotalValue();

        return this;
    }

    /**
     * Calculates values that will be used for calculating the total performance value of the beatmap.
     */
    protected abstract calculateValues(): void;

    /**
     * Calculates the total performance value of the beatmap.
     */
    protected abstract calculateTotalValue(): number;

    /**
     * Calculates the base performance value of a star rating.
     */
    protected baseValue(stars: number): number {
        return Math.pow(5 * Math.max(1, stars / 0.0675) - 4, 3) / 100000;
    }

    /**
     * Processes given parameters for usage in performance calculation.
     */
    private handleParams(
        params: {
            /**
             * The star rating instance to calculate.
             */
            stars: DifficultyCalculator;

            /**
             * The maximum combo achieved in the score.
             */
            combo?: number;

            /**
             * The accuracy achieved in the score.
             */
            accPercent?: Accuracy | number;

            /**
             * The amount of misses achieved in the score.
             */
            miss?: number;

            /**
             * The tap penalty to apply for penalized scores.
             */
            tapPenalty?: number;

            /**
             * Custom map statistics to apply custom speed multiplier and force AR values as well as old statistics.
             */
            stats?: MapStats;
        },
        mode: modes
    ): void {
        this.stars = params.stars;

        const maxCombo: number = this.stars.map.maxCombo;
        const miss: number = this.computedAccuracy.nmiss;
        const combo: number = params.combo ?? maxCombo - miss;
        const mod: Mod[] = this.stars.mods;
        const baseAR: number = this.stars.map.difficulty.ar!;
        const baseOD: number = this.stars.map.difficulty.od;

        // Penalize misses by assessing # of misses relative to the total # of objects. Default a 3% reduction for any # of misses.
        this.comboPenalty = Math.min(Math.pow(combo / maxCombo, 0.8), 1);

        if (params.accPercent instanceof Accuracy) {
            // Copy into new instance to not modify the original
            this.computedAccuracy = new Accuracy(params.accPercent);
        } else {
            this.computedAccuracy = new Accuracy({
                percent: params.accPercent,
                nobjects: this.stars.objects.length,
                nmiss: params.miss || 0,
            });
        }

        this.effectiveMissCount = this.calculateEffectiveMissCount(
            combo,
            maxCombo
        );

        if (this.stars.mods.some((m) => m instanceof ModNoFail)) {
            this.finalMultiplier *= Math.max(
                0.9,
                1 - 0.02 * this.effectiveMissCount
            );
        }
        if (this.stars.mods.some((m) => m instanceof ModSpunOut)) {
            this.finalMultiplier *=
                1 -
                Math.pow(
                    this.stars.map.hitObjects.spinners /
                        this.stars.objects.length,
                    0.85
                );
        }
        if (this.stars.mods.some((m) => m instanceof ModRelax)) {
            // As we're adding 100s and 50s to an approximated number of combo breaks, the result can be higher
            // than total hits in specific scenarios (which breaks some calculations),  so we need to clamp it.
            this.effectiveMissCount = Math.min(
                this.effectiveMissCount +
                    this.computedAccuracy.n100 +
                    this.computedAccuracy.n50,
                this.stars.objects.length
            );

            this.finalMultiplier *= 0.6;
        }

        this.mapStatistics = new MapStats({
            ar: baseAR,
            od: baseOD,
            mods: mod,
        });

        if (this.stars.map.hitObjects.sliders > 0) {
            // We assume 15% of sliders in a beatmap are difficult since there's no way to tell from the performance calculator.
            const estimateDifficultSliders: number =
                this.stars.map.hitObjects.sliders * 0.15;
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
                (1 - this.stars.attributes.sliderFactor) *
                    Math.pow(
                        1 -
                            estimateSliderEndsDropped /
                                estimateDifficultSliders,
                        3
                    ) +
                this.stars.attributes.sliderFactor;
        }

        if (params.stats) {
            this.mapStatistics.ar = params.stats.ar ?? this.mapStatistics.ar;
            this.mapStatistics.isForceAR =
                params.stats.isForceAR ?? this.mapStatistics.isForceAR;
            this.mapStatistics.speedMultiplier =
                params.stats.speedMultiplier ??
                this.mapStatistics.speedMultiplier;
            this.mapStatistics.oldStatistics =
                params.stats.oldStatistics ?? this.mapStatistics.oldStatistics;
        }

        this.mapStatistics.calculate({ mode: mode });
    }

    /**
     * Calculates the amount of misses + sliderbreaks from combo.
     */
    private calculateEffectiveMissCount(
        combo: number,
        maxCombo: number
    ): number {
        let comboBasedMissCount: number = 0;

        if (this.stars.map.hitObjects.sliders > 0) {
            const fullComboThreshold: number =
                maxCombo - 0.1 * this.stars.map.hitObjects.sliders;

            if (combo < fullComboThreshold) {
                // We're clamping miss count because since it's derived from combo, it can
                // be higher than the amount of objects and that breaks some calculations.
                comboBasedMissCount = Math.min(
                    fullComboThreshold / Math.max(1, combo),
                    this.stars.objects.length
                );
            }
        }

        return Math.max(this.computedAccuracy.nmiss, comboBasedMissCount);
    }
}
