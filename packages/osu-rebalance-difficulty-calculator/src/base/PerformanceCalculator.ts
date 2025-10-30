import { Accuracy, MathUtils, ModMap, ModUtil } from "@rian8337/osu-base";
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
     * The calculated maximum combo.
     */
    combo = 0;

    /**
     * The difficulty attributes that is being calculated.
     */
    readonly difficultyAttributes: T | CacheableDifficultyAttributes<T>;

    /**
     * The mods that were used.
     */
    protected readonly mods: ModMap;

    /**
     * The amount of slider ends dropped in the score.
     */
    protected sliderEndsDropped = 0;

    /**
     * The amount of slider ticks missed in the score.
     *
     * This is used to calculate the slider accuracy.
     */
    protected sliderTicksMissed = 0;

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
                nmiss: options?.miss ?? 0,
            });
        }

        const maxCombo = this.difficultyAttributes.maxCombo;
        const miss = this.computedAccuracy.nmiss;
        this.combo = options?.combo ?? maxCombo - miss;

        if (
            options?.sliderEndsDropped !== undefined &&
            options?.sliderTicksMissed !== undefined
        ) {
            this._usingClassicSliderAccuracy = false;
            this.sliderEndsDropped = options.sliderEndsDropped;
            this.sliderTicksMissed = options.sliderTicksMissed;
        } else {
            this._usingClassicSliderAccuracy = true;
            this.sliderEndsDropped = 0;
            this.sliderTicksMissed = 0;
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
        attributes: T | CacheableDifficultyAttributes<T>,
    ): attributes is CacheableDifficultyAttributes<T> {
        return Array.isArray(attributes.mods);
    }
}
