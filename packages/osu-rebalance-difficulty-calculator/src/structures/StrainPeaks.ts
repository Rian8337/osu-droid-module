/**
 * Represents the strain peaks of various calculated difficulties.
 */
export interface StrainPeaks {
    /**
     * The strain peaks of aim difficulty if sliders are considered.
     */
    aimWithSliders: number[];
    /**
     * The strain peaks of aim difficulty if sliders are not considered.
     */
    aimWithoutSliders: number[];
    /**
     * The strain peaks of speed difficulty.
     */
    speed: number[];
    /**
     * The strain peaks of flashlight difficulty.
     */
    flashlight: number[];
}
