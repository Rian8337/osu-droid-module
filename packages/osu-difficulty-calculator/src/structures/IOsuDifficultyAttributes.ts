import { IDifficultyAttributes } from "./IDifficultyAttributes";

/**
 * Holds data that can be used to calculate osu!standard performance points.
 */
export interface IOsuDifficultyAttributes extends IDifficultyAttributes {
    /**
     * The perceived approach rate inclusive of rate-adjusting mods (DT/HT/etc).
     *
     * Rate-adjusting mods don't directly affect the approach rate difficulty value, but have a perceived effect as a result of adjusting audio timing.
     */
    approachRate: number;

    /**
     * The health drain rate of the beatmap.
     */
    drainRate: number;

    /**
     * The difficulty corresponding to the speed skill.
     */
    speedDifficulty: number;

    /**
     * The amount of strains that are considered difficult with respect to the speed skill.
     */
    speedDifficultStrainCount: number;

    /**
     * Describes how much of {@link aimDifficultStrainCount} is contributed to by circles or sliders.
     *
     * A value closer to 0 indicates most of {@link aimDifficultStrainCount} is contributed by circles.
     *
     * A value closer to infinity indicates most of {@link aimDifficultStrainCount} is contributed by sliders.
     */
    aimTopWeightedSliderFactor: number;

    /**
     * Describes how much of {@link speedDifficultStrainCount} is contributed to by circles or sliders.
     *
     * A value closer to 0 indicates most of {@link speedDifficultStrainCount} is contributed by circles.
     *
     * A value closer to infinity indicates most of {@link speedDifficultStrainCount} is contributed by sliders.
     */
    speedTopWeightedSliderFactor: number;
}
