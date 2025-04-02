import {
    Accuracy,
    MathUtils,
    Mod,
    ModNoFail,
    ModRelax,
    ModSpunOut,
    ModUtil,
    Modes,
} from "@rian8337/osu-base";
import { CacheableDifficultyAttributes } from "../structures/CacheableDifficultyAttributes";
import { IDifficultyAttributes } from "../structures/IDifficultyAttributes";
import { PerformanceCalculationOptions } from "../structures/PerformanceCalculationOptions";

/**
 * The base class of performance calculators.
 */
export abstract class PerformanceCalculator<T extends IDifficultyAttributes> {
    /**
     * The overall performance value.
     */
    total = 0;

    /**
     * The calculated accuracy.
     */
    computedAccuracy = new Accuracy({});

    /**
     * The difficulty attributes that is being calculated.
     */
    readonly difficultyAttributes: T | CacheableDifficultyAttributes<T>;

    /**
     * The mods that were used.
     */
    protected readonly mods: Mod[];

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
    protected effectiveMissCount = 0;

    /**
     * Nerf factor used for nerfing beatmaps with very likely dropped sliderends.
     */
    protected sliderNerfFactor = 1;

    /**
     * @param difficultyAttributes The difficulty attributes to calculate.
     */
    constructor(difficultyAttributes: T | CacheableDifficultyAttributes<T>) {
        this.difficultyAttributes = difficultyAttributes;

        this.mods = this.isCacheableAttribute(difficultyAttributes)
            ? ModUtil.deserializeMods(difficultyAttributes.mods)
            : difficultyAttributes.mods;
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

        this.total = this.calculateTotalValue();

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
    protected abstract calculateTotalValue(): number;

    /**
     * The total hits that can be done in the beatmap.
     */
    protected get totalHits(): number {
        return (
            this.difficultyAttributes.hitCircleCount +
            this.difficultyAttributes.sliderCount +
            this.difficultyAttributes.spinnerCount
        );
    }

    /**
     * The total hits that were successfully done.
     */
    protected get totalSuccessfulHits(): number {
        return (
            this.computedAccuracy.n300 +
            this.computedAccuracy.n100 +
            this.computedAccuracy.n50
        );
    }

    /**
     * The total of imperfect hits (100s, 50s, misses).
     */
    protected get totalImperfectHits(): number {
        return (
            this.computedAccuracy.n100 +
            this.computedAccuracy.n50 +
            this.computedAccuracy.nmiss
        );
    }

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
        const maxCombo = this.difficultyAttributes.maxCombo;
        const miss = this.computedAccuracy.nmiss;
        const combo = options?.combo ?? maxCombo - miss;

        if (options?.accPercent instanceof Accuracy) {
            // Copy into new instance to not modify the original
            this.computedAccuracy = new Accuracy(options.accPercent);

            if (this.computedAccuracy.n300 <= 0) {
                this.computedAccuracy.n300 = Math.max(
                    0,
                    this.totalHits -
                        this.computedAccuracy.n100 -
                        this.computedAccuracy.n50 -
                        this.computedAccuracy.nmiss,
                );
            } else {
                this.computedAccuracy.nmiss = Math.max(
                    0,
                    this.totalHits - this.totalSuccessfulHits,
                );
            }
        } else {
            this.computedAccuracy = new Accuracy({
                percent: options?.accPercent,
                nobjects: this.totalHits,
                nmiss: options?.miss || 0,
            });
        }

        this.effectiveMissCount = this.calculateEffectiveMissCount(
            combo,
            maxCombo,
        );

        if (this.mods.some((m) => m instanceof ModNoFail)) {
            this.finalMultiplier *= Math.max(
                0.9,
                1 - 0.02 * this.effectiveMissCount,
            );
        }

        if (this.mods.some((m) => m instanceof ModSpunOut)) {
            this.finalMultiplier *=
                1 -
                Math.pow(
                    this.difficultyAttributes.spinnerCount / this.totalHits,
                    0.85,
                );
        }

        if (this.mods.some((m) => m instanceof ModRelax)) {
            // Graph: https://www.desmos.com/calculator/bc9eybdthb
            // We use OD13.3 as maximum since it's the value at which great hit window becomes 0.
            const n100Multiplier = Math.max(
                0,
                this.difficultyAttributes.overallDifficulty > 0
                    ? 1 -
                          Math.pow(
                              this.difficultyAttributes.overallDifficulty /
                                  13.33,
                              1.8,
                          )
                    : 1,
            );

            const n50Multiplier = Math.max(
                0,
                this.difficultyAttributes.overallDifficulty > 0.0
                    ? 1 -
                          Math.pow(
                              this.difficultyAttributes.overallDifficulty /
                                  13.33,
                              5,
                          )
                    : 1,
            );

            // As we're adding 100s and 50s to an approximated number of combo breaks, the result can be higher
            // than total hits in specific scenarios (which breaks some calculations),  so we need to clamp it.
            this.effectiveMissCount = Math.min(
                this.effectiveMissCount +
                    this.computedAccuracy.n100 * n100Multiplier +
                    this.computedAccuracy.n50 * n50Multiplier,
                this.totalHits,
            );
        }

        if (this.difficultyAttributes.aimDifficultSliderCount > 0) {
            // Consider all missing combo to be dropped difficult sliders.
            const estimateImproperlyFollowedDifficultSliders = MathUtils.clamp(
                Math.min(this.totalImperfectHits, maxCombo - combo),
                0,
                this.difficultyAttributes.aimDifficultSliderCount,
            );

            this.sliderNerfFactor =
                (1 - this.difficultyAttributes.sliderFactor) *
                    Math.pow(
                        1 -
                            estimateImproperlyFollowedDifficultSliders /
                                this.difficultyAttributes
                                    .aimDifficultSliderCount,
                        3,
                    ) +
                this.difficultyAttributes.sliderFactor;
        }
    }

    /**
     * Calculates a strain-based miss penalty.
     *
     * Strain-based miss penalty assumes that a player will miss on the hardest parts of a map,
     * so we use the amount of relatively difficult sections to adjust miss penalty
     * to make it more punishing on maps with lower amount of hard sections.
     */
    protected calculateStrainBasedMissPenalty(
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
     * Calculates the amount of misses + sliderbreaks from combo.
     */
    private calculateEffectiveMissCount(
        combo: number,
        maxCombo: number,
    ): number {
        // Guess the number of misses + slider breaks from combo.
        let comboBasedMissCount = 0;

        if (this.difficultyAttributes.sliderCount > 0) {
            const fullComboThreshold =
                maxCombo - 0.1 * this.difficultyAttributes.sliderCount;

            if (combo < fullComboThreshold) {
                // Clamp miss count to maximum amount of possible breaks.
                comboBasedMissCount = Math.min(
                    fullComboThreshold / Math.max(1, combo),
                    this.totalImperfectHits,
                );
            }
        }

        return Math.max(this.computedAccuracy.nmiss, comboBasedMissCount);
    }

    /**
     * Determines whether an attribute is a cacheable attribute.
     *
     * @param attributes The attributes to check.
     * @returns Whether the attributes are cacheable.
     */
    private isCacheableAttribute(
        attributes: T | CacheableDifficultyAttributes<T>,
    ): attributes is CacheableDifficultyAttributes<T> {
        return typeof attributes.mods === "string";
    }
}
