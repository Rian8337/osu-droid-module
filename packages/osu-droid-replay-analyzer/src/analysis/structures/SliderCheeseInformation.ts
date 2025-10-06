/**
 * Information about the result of a slider cheese check.
 */
export interface SliderCheeseInformation {
    /**
     * The value used to penalize the aim performance value, from 0 to 1.
     */
    aimPenalty: number;

    /**
     * The value used to penalize the flashlight performance value, from 0 to 1.
     */
    flashlightPenalty: number;
}
