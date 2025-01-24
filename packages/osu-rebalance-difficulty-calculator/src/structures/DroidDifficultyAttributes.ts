import { DifficultyAttributes } from "./DifficultyAttributes";

/**
 * Holds data that can be used to calculate osu!droid performance points.
 */
export interface DroidDifficultyAttributes extends DifficultyAttributes {
    /**
     * The number of sliders weighted by difficulty.
     */
    aimDifficultSliderCount: number;

    /**
     * The difficulty corresponding to the tap skill.
     */
    tapDifficulty: number;

    /**
     * The difficulty corresponding to the rhythm skill.
     */
    rhythmDifficulty: number;

    /**
     * The difficulty corresponding to the visual skill.
     */
    visualDifficulty: number;

    /**
     * The amount of strains that are considered difficult with respect to the tap skill.
     */
    tapDifficultStrainCount: number;

    /**
     * The amount of strains that are considered difficult with respect to the flashlight skill.
     */
    flashlightDifficultStrainCount: number;

    /**
     * The amount of strains that are considered difficult with respect to the visual skill.
     */
    visualDifficultStrainCount: number;
}
