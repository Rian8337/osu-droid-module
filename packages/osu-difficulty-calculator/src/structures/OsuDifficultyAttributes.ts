import { DifficultyAttributes } from "./DifficultyAttributes";

/**
 * Holds data that can be used to calculate osu!standard performance points.
 */
export interface OsuDifficultyAttributes extends DifficultyAttributes {
    /**
     * The perceived approach rate inclusive of rate-adjusting mods (DT/HT/etc).
     *
     * Rate-adjusting mods don't directly affect the approach rate difficulty value, but have a perceived effect as a result of adjusting audio timing.
     */
    approachRate: number;

    /**
     * The difficulty corresponding to the speed skill.
     */
    speedDifficulty: number;

    /**
     * The amount of strains that are considered difficult with respect to the speed skill.
     */
    speedDifficultStrainCount: number;
}
