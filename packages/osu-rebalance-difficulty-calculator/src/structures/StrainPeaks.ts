import { TimedStrainPeak } from "./TimedStrainPeak";

/**
 * Represents the strain peaks of various calculated difficulties.
 */
export interface StrainPeaks {
    /**
     * The strain peaks of aim difficulty if sliders are considered.
     */
    aimWithSliders: readonly TimedStrainPeak[];

    /**
     * The strain peaks of aim difficulty if sliders are not considered.
     */
    aimWithoutSliders: readonly TimedStrainPeak[];

    /**
     * The strain peaks of speed difficulty.
     */
    speed: readonly TimedStrainPeak[];

    /**
     * The strain peaks of flashlight difficulty.
     */
    flashlight: readonly TimedStrainPeak[];
}
