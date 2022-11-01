import { HitResult } from "../constants/HitResult";

/**
 * Represents a hitobject in an osu!droid replay.
 *
 * Stores information about hitobjects in an osu!droid replay such as hit offset, tickset, and hit result.
 *
 * This is used when analyzing replays using replay analyzer.
 */
export class ReplayObjectData {
    /**
     * The offset of which the hitobject was hit in milliseconds.
     * 
     * For circles, this is the offset at which the circle was hit.
     * 
     * For sliders, this is the offset at which the slider head was hit. For
     * sliderbreaks, the accuracy would be `(hit window 50)ms + 13ms` ([game source code](https://github.com/osudroid/osu-droid/blob/6306c68e3ffaf671eac794bf45cc95c0f3313a82/src/ru/nsu/ccfit/zuev/osu/game/Slider.java#L821)).
     * 
     * For spinners, this is the total amount at which the spinner was spinned:
     * ```js
     * const rotations = Math.floor(data.accuracy / 4);
     * ```
     * The remainder of the division denotes the hit result of the spinner:
     * - `HitResult.great`: 3
     * - `HitResult.good`: 2
     * - `HitResult.meh`: 1
     * - `HitResult.miss`: 0
     */
    accuracy: number;

    /**
     * The tickset of the hitobject.
     *
     * This is used to determine whether or not a slider event (tick/repeat/end) is hit based on the order they appear.
     */
    tickset: boolean[];

    /**
     * The bitwise hit result of the hitobject.
     */
    result: HitResult;

    constructor(values: {
        /**
         * The offset of which the hitobject was hit in milliseconds.
         */
        accuracy: number;

        /**
         * The tickset of the hitobject.
         *
         * This is used to determine whether or not a slider event (tick/repeat/end) is hit based on the order they appear.
         */
        tickset: boolean[];

        /**
         * The bitwise hit result of the hitobject.
         */
        result: HitResult;
    }) {
        this.accuracy = values.accuracy;
        this.tickset = values.tickset;
        this.result = values.result;
    }
}
