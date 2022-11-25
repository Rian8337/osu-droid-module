import { DifficultyAttributes } from "./DifficultyAttributes";

/**
 * Holds data that can be used to calculate osu!standard performance points.
 */
export interface OsuDifficultyAttributes extends DifficultyAttributes {
    /**
     * The difficulty corresponding to the speed skill.
     */
    speedDifficulty: number;
}
