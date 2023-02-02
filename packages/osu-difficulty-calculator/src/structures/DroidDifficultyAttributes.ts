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
     * The number of clickable objects weighted by difficulty.
     *
     * Related to aim difficulty.
     */
    aimNoteCount: number;
}
