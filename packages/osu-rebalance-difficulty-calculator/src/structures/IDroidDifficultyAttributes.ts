import { IDifficultyAttributes } from "./IDifficultyAttributes";

/**
 * Holds data that can be used to calculate osu!droid performance points.
 */
export interface IDroidDifficultyAttributes extends IDifficultyAttributes {
    /**
     * The difficulty corresponding to the tap skill.
     */
    tapDifficulty: number;

    /**
     * The difficulty corresponding to the rhythm skill.
     */
    rhythmDifficulty: number;

    /**
     * The difficulty corresponding to the reading skill.
     */
    readingDifficulty: number;

    /**
     * The amount of strains that are considered difficult with respect to the tap skill.
     */
    tapDifficultStrainCount: number;

    /**
     * The amount of sliders that are considered difficult with respect to the tap skill, weighted by consistency.
     */
    tapTopWeightedSliderFactor: number;

    /**
     * The amount of strains that are considered difficult with respect to the flashlight skill.
     */
    flashlightDifficultStrainCount: number;

    /**
     * The amount of sliders that are considered difficult with respect to the flashlight skill, weighted by consistency.
     */
    flashlightTopWeightedSliderFactor: number;

    /**
     * The amount of notes that are considered difficult with respect to the reading skill.
     */
    readingDifficultNoteCount: number;

    /**
     * The amount of sliders that are considered difficult with respect to the reading skill, weighted by consistency.
     */
    readingTopWeightedSliderFactor: number;

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

    /**
     * The maximum score obtainable on the beatmap.
     */
    maximumScore: number;
}
