/**
 * Information about the result of a slider cheese check.
 */
export interface SliderCheeseInformation {
    /**
     * The value used to penalize the aim performance value.
     */
    aimPenalty: number;

    /**
     * The value used to penalize the flashlight performance value.
     */
    flashlightPenalty: number;

    /**
     * The value used to penalize the visual performance value.
     */
    visualPenalty: number;
}
