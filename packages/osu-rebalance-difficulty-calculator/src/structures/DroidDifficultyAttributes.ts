import { DifficultyAttributes } from "./DifficultyAttributes";

/**
 * Holds data that can be used to calculate osu!droid performance points.
 */
export interface DroidDifficultyAttributes extends DifficultyAttributes {
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
     * The amount of strains that are considered difficult with respect to the aim skill.
     */
    aimDifficultStrainCount: number;

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

    /**
     * The average delta time of speed objects.
     */
    averageSpeedDeltaTime: number;

    /**
     * Describes how much of tap difficulty is contributed by notes that are "vibroable".
     *
     * A value closer to 1 indicates most of tap difficulty is contributed by notes that are not "vibroable".
     *
     * A value closer to 0 indicates most of tap difficulty is contributed by notes that are "vibroable".
     */
    vibroFactor: number;
}
