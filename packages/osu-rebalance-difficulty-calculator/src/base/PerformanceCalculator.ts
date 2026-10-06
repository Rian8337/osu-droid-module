import { Accuracy, MathUtils, ModMap, ModUtil } from "@rian8337/osu-base";
import { CacheableDifficultyAttributes } from "../structures/CacheableDifficultyAttributes";
import { IDifficultyAttributes } from "../structures/IDifficultyAttributes";
import { IPerformanceAttributes } from "../structures/IPerformanceAttributes";
import { PerformanceCalculationOptions } from "../structures/PerformanceCalculationOptions";

/**
 * The base class of performance calculators.
 */
export abstract class PerformanceCalculator<
    TDifficultyAttributes extends IDifficultyAttributes,
    TPerformanceAttributes extends IPerformanceAttributes,
> {
    /**
     * The calculated accuracy.
     */
    computedAccuracy = new Accuracy({});

    /**
     * The calculated maximum combo.
     */
    combo = 0;

    /**
     * The difficulty attributes that is being calculated.
     */
    readonly difficultyAttributes:
        | TDifficultyAttributes
        | CacheableDifficultyAttributes<TDifficultyAttributes>;

    /**
     * The mods that were used.
     */
    protected readonly mods: ModMap;

    private _sliderEndsDropped = 0;

    /**
     * The amount of slider ends dropped in the score.
     */
    protected get sliderEndsDropped(): number {
        return this._sliderEndsDropped;
    }

    private _sliderTicksMissed = 0;

    /**
     * The amount of slider ticks missed in the score.
     *
     * This is used to calculate the slider accuracy.
     */
    protected get sliderTicksMissed(): number {
        return this._sliderTicksMissed;
    }

    private _usingClassicSliderAccuracy = false;

    /**
     * Whether this score uses classic slider accuracy.
     */
    protected get usingClassicSliderAccuracy(): boolean {
        return this._usingClassicSliderAccuracy;
    }

    /**
     * @param difficultyAttributes The difficulty attributes to calculate.
     */
    constructor(
        difficultyAttributes:
            | TDifficultyAttributes
            | CacheableDifficultyAttributes<TDifficultyAttributes>,
    ) {
        this.difficultyAttributes = difficultyAttributes;

        this.mods = this.isCacheableAttribute(difficultyAttributes)
            ? ModUtil.deserializeMods(difficultyAttributes.mods)
            : difficultyAttributes.mods;
    }

    /**
     * Calculates the performance points of the beatmap.
     *
     * @param options Options for performance calculation.
     * @returns The attributes representing the performance.
     */
    calculate(options?: PerformanceCalculationOptions): TPerformanceAttributes {
        this.handleOptions(options);

        return this.createPerformanceAttributes();
    }

    /**
     * Creates the performance attributes for this calculator.
     *
     * @returns The performance attributes.
     */
    protected abstract createPerformanceAttributes(): TPerformanceAttributes;

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
     * Processes given options for usage in performance calculation.
     *
     * @param options Options for performance calculation.
     */
    protected handleOptions(options?: PerformanceCalculationOptions): void {
        if (options?.accPercent instanceof Accuracy) {
            // Copy into new instance to not modify the original
            this.computedAccuracy = new Accuracy(options.accPercent);

            if (!this.computedAccuracy.isN300Resolved) {
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
        } else if (options?.accPercent !== undefined) {
            this.computedAccuracy = Accuracy.fromPercent(
                options.accPercent,
                this.totalHits,
                options.miss ?? 0,
            );
        } else {
            this.computedAccuracy = Accuracy.fromHitCounts(
                { nmiss: options?.miss ?? 0 },
                this.totalHits,
            );
        }

        const maxCombo = this.difficultyAttributes.maxCombo;
        const miss = this.computedAccuracy.nmiss;
        this.combo = options?.combo ?? maxCombo - miss;

        if (
            options?.sliderEndsDropped !== undefined &&
            options.sliderTicksMissed !== undefined
        ) {
            this._usingClassicSliderAccuracy = false;
            this._sliderEndsDropped = options.sliderEndsDropped;
            this._sliderTicksMissed = options.sliderTicksMissed;
        } else {
            this._usingClassicSliderAccuracy = true;
            this._sliderEndsDropped = 0;
            this._sliderTicksMissed = 0;
        }

        // Ensure that combo is within possible bounds.
        this.combo = MathUtils.clamp(
            this.combo,
            0,
            maxCombo - miss - this.sliderEndsDropped - this.sliderTicksMissed,
        );
    }

    /**
     * Determines whether an attribute is a cacheable attribute.
     *
     * @param attributes The attributes to check.
     * @returns Whether the attributes are cacheable.
     */
    private isCacheableAttribute(
        attributes:
            | TDifficultyAttributes
            | CacheableDifficultyAttributes<TDifficultyAttributes>,
    ): attributes is CacheableDifficultyAttributes<TDifficultyAttributes> {
        return Array.isArray(attributes.mods);
    }
}
