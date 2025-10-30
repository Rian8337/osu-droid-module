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
     *
     * If {@link accPercent} is provided as an {@link Accuracy} object, this value will be ignored.
     */
    miss?: number;

    /**
     * The amount of slider ends dropped in the score.
     */
    sliderEndsDropped?: number;

    /**
     * The amount of slider ticks missed in the score.
     */
    sliderTicksMissed?: number;

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
     * The total score achieved in the score.
     */
    totalScore?: number;
}
