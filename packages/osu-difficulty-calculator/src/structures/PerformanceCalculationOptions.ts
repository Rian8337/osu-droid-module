import { Accuracy } from "@rian8337/osu-base";

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
     * The aim slider cheese penalty to apply for penalized scores. Only used when using `DroidPerformanceCalculator`.
     */
    aimSliderCheesePenalty?: number;

    /**
     * The flashlight slider cheese penalty to apply for penalized scores. Only used when using `DroidPerformanceCalculator`.
     */
    flashlightSliderCheesePenalty?: number;

    /**
     * The visual slider cheese penalty to apply for penalized scores. Only used when using `DroidPerformanceCalculator`.
     */
    visualSliderCheesePenalty?: number;
}
