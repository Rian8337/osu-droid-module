/**
 * Represents the strain peaks of various calculated difficulties.
 */
export interface StrainPeaks {
    /**
     * The strain peaks of aim difficulty if sliders are considered.
     */
    aimWithSliders: readonly number[];

    /**
     * The strain peaks of aim difficulty if sliders are not considered.
     */
    aimWithoutSliders: readonly number[];

    /**
     * The strain peaks of speed difficulty.
     */
    speed: readonly number[];

    /**
     * The strain peaks of flashlight difficulty.
     */
    flashlight: readonly number[];
}
