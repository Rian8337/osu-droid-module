import { ModMap } from "@rian8337/osu-base";

/**
 * Holds data that can be used to calculate performance points.
 */
export interface IDifficultyAttributes {
    /**
     * The mods which were applied to the beatmap.
     */
    mods: ModMap;

    /**
     * The combined star rating of all skills.
     */
    starRating: number;

    /**
     * The maximum achievable combo.
     */
    maxCombo: number;

    /**
     * The difficulty corresponding to the aim skill.
     */
    aimDifficulty: number;

    /**
     * The difficulty corresponding to the flashlight skill.
     */
    flashlightDifficulty: number;

    /**
     * The difficulty corresponding to the reading skill.
     */
    readingDifficulty: number;

    /**
     * The number of clickable objects weighted by difficulty.
     *
     * Related to speed/tap difficulty.
     */
    speedNoteCount: number;

    /**
     * Describes how much of aim difficulty is contributed to by hitcircles or sliders.
     *
     * A value closer to 1 indicates most of aim difficulty is contributed by hitcircles.
     *
     * A value closer to 0 indicates most of aim difficulty is contributed by sliders.
     */
    sliderFactor: number;

    /**
     * The overall clock rate that was applied to the beatmap.
     */
    clockRate: number;

    /**
     * The perceived overall difficulty inclusive of rate-adjusting mods (DT/HT/etc), based on osu!standard judgement.
     *
     * Rate-adjusting mods don't directly affect the overall difficulty value, but have a perceived effect as a result of adjusting audio timing.
     */
    overallDifficulty: number;

    /**
     * The number of hitcircles in the beatmap.
     */
    hitCircleCount: number;

    /**
     * The number of sliders in the beatmap.
     */
    sliderCount: number;

    /**
     * The number of spinners in the beatmap.
     */
    spinnerCount: number;

    /**
     * The number of sliders weighted by difficulty.
     */
    aimDifficultSliderCount: number;

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
}
