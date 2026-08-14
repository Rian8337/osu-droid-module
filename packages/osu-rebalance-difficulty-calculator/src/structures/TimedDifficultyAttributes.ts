import { DifficultyAttributes } from "./DifficultyAttributes";

/**
 * Wraps a `DifficultyAttributes` object and adds a time value for which the attribute is valid.
 *
 * Output by `DifficultyCalculator.calculateTimed` methods.
 */
export interface TimedDifficultyAttributes<TAttributes extends DifficultyAttributes> {
    /**
     * The non-clock-adjusted time value at which the attributes take effect.
     */
    readonly time: number;

    /**
     * The attributes.
     */
    readonly attributes: TAttributes;

    /**
     * The number of sliders in the beatmap up to this point.
     */
    readonly sliderCount: number;

    /**
     * The number of slider ticks in the beatmap up to this point.
     */
    readonly sliderTickCount: number;

    /**
     * The number of slider repeats in the beatmap up to this point.
     */
    readonly sliderRepeatCount: number;
}