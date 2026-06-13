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
     * The amount of notes that are considered difficult with respect to the reading skill.
     */
    readingDifficultNoteCount: number;

    /**
     * Describes how much of {@link aimDifficultStrainCount} is contributed to by circles or sliders.
     *
     * A value closer to 0 indicates most of {@link aimDifficultStrainCount} is contributed by circles.
     *
     * A value closer to infinity indicates most of {@link aimDifficultStrainCount} is contributed by sliders.
     */
    aimTopWeightedSliderFactor: number;

    /**
     * Describes how much of {@link tapDifficultStrainCount} is contributed to by circles or sliders.
     *
     * A value closer to 0 indicates most of {@link tapDifficultStrainCount} is contributed by circles.
     *
     * A value closer to infinity indicates most of {@link tapDifficultStrainCount} is contributed by sliders.
     */
    tapTopWeightedSliderFactor: number;

    /**
     * The maximum score obtainable on the beatmap.
     */
    maximumScore: number;
}
