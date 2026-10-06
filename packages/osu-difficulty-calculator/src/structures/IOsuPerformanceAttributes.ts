import { IPerformanceAttributes } from "./IPerformanceAttributes";

/**
 * Represents the calculated performance of a score in osu!.
 */
export interface IOsuPerformanceAttributes extends IPerformanceAttributes {
    /**
     * The aim performance points.
     */
    aim: number;

    /**
     * The speed performance points.
     */
    speed: number;

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
}
