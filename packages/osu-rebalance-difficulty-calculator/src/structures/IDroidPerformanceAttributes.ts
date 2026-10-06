import { IPerformanceAttributes } from "./IPerformanceAttributes";

/**
 * Represents the calculated performance of a score in osu!droid.
 */
export interface IDroidPerformanceAttributes extends IPerformanceAttributes {
    /**
     * The aim performance points.
     */
    aim: number;

    /**
     * The tap performance points.
     */
    tap: number;

    /**
     * The accuracy performance points.
     */
    accuracy: number;

    /**
     * The flashlight performance points.
     */
    flashlight: number;

    /**
     * The reading performance points.
     */
    reading: number;

    /**
     * The penalty used to penalize the tap performance points.
     */
    tapPenalty: number;

    /**
     * The estimated deviation of the score.
     */
    deviation: number;

    /**
     * The estimated tap deviation of the score.
     */
    tapDeviation: number;

    /**
     * The penalty used to penalize the aim performance points.
     */
    sliderCheesePenalty: number;
}
