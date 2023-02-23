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

    /**
     * Describes how much of flashlight difficulty is contributed to by hitcircles or sliders.
     *
     * A value closer to 1 indicates most of flashlight difficulty is contributed by hitcircles.
     *
     * A value closer to 0 indicates most of flashlight difficulty is contributed by sliders.
     */
    flashlightSliderFactor?: number;

    /**
     * Describes how much of flashlight difficulty is contributed to by hitcircles or sliders.
     *
     * A value closer to 1 indicates most of flashlight difficulty is contributed by hitcircles.
     *
     * A value closer to 0 indicates most of flashlight difficulty is contributed by sliders.
     */
    visualSliderFactor?: number;
}
