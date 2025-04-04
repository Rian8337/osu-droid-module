import { DifficultSlider } from "./DifficultSlider";
import { IDroidDifficultyAttributes } from "./IDroidDifficultyAttributes";
import { HighStrainSection } from "./HighStrainSection";

/**
 * Holds data that can be used to calculate osu!droid performance points as well
 * as doing some analysis using the replay of a score.
 */
export interface IExtendedDroidDifficultyAttributes
    extends IDroidDifficultyAttributes {
    /**
     * The mode of the difficulty calculation.
     */
    mode: "rebalance";

    /**
     * Possible sections at which the player can use three fingers on.
     */
    possibleThreeFingeredSections: HighStrainSection[];

    /**
     * Sliders that are considered difficult.
     */
    difficultSliders: DifficultSlider[];

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
    flashlightSliderFactor: number;

    /**
     * Describes how much of visual difficulty is contributed to by hitcircles or sliders.
     *
     * A value closer to 1 indicates most of visual difficulty is contributed by hitcircles.
     *
     * A value closer to 0 indicates most of visual difficulty is contributed by sliders.
     */
    visualSliderFactor: number;
}
