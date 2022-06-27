import { Accuracy } from "@rian8337/osu-base";
import { CalculationOptions } from "./CalculationOptions";

/**
 * Represents options for performance calculation.
 */
export interface PerformanceCalculationOptions extends CalculationOptions {
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
}
