import { Accuracy, MapStats } from "@rian8337/osu-base";

/**
 * Represents options for performance calculation.
 */
export interface PerformanceCalculationOptions {
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
     * The tap penalty to apply for penalized scores. Only used when using `DroidPerformanceCalculator`.
     */
    tapPenalty?: number;

    /**
     * Custom map statistics to apply custom speed multiplier as well as old statistics.
     *
     * @deprecated Using this property will very likely give a wrong result and will be removed in 3.0.
     * Pass this property when calculating difficulty instead.
     */
    stats?: MapStats;
}
