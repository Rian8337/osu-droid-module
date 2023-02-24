/**
 * Represents a slider that is considered difficult.
 *
 * This structure is a part of difficulty attributes and can be cached.
 */
export interface DifficultSlider {
    /**
     * The index of the slider in the beatmap.
     */
    readonly index: number;

    /**
     * The difficulty rating of this slider compared to other sliders, based on the velocity of the slider.
     *
     * A value closer to 1 indicates that this slider is more difficult compared to most sliders.
     *
     * A value closer to 0 indicates that this slider is easier compared to most sliders.
     */
    readonly difficultyRating: number;
}
