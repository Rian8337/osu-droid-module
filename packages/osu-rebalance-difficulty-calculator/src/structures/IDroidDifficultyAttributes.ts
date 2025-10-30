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
     * Describes how much of {@link tapDifficultStrainCount} is contributed to by circles or sliders.
     *
     * A value closer to 0 indicates most of {@link tapDifficultStrainCount} is contributed by circles.
     *
     * A value closer to infinity indicates most of {@link tapDifficultStrainCount} is contributed by sliders.
     */
    tapTopWeightedSliderFactor: number;

    /**
     * The amount of strains that are considered difficult with respect to the flashlight skill.
     */
    flashlightDifficultStrainCount: number;

    /**
     * Describes how much of {@link flashlightDifficultStrainCount} is contributed to by circles or sliders.
     *
     * A value closer to 0 indicates most of {@link flashlightDifficultStrainCount} is contributed by circles.
     *
     * A value closer to infinity indicates most of {@link flashlightDifficultStrainCount} is contributed by sliders.
     */
    flashlightTopWeightedSliderFactor: number;

    /**
     * The amount of notes that are considered difficult with respect to the reading skill.
     */
    readingDifficultNoteCount: number;

    /**
     * Describes how much of {@link readingDifficultNoteCount} is contributed to by circles or sliders.
     *
     * A value closer to 0 indicates most of {@link readingDifficultNoteCount} is contributed by circles.
     *
     * A value closer to infinity indicates most of {@link readingDifficultNoteCount} is contributed by sliders.
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
