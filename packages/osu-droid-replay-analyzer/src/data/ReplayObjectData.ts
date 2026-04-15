import { HitResult } from "../constants/HitResult";

/**
 * Represents a hitobject in an osu!droid replay.
 *
 * Stores information about hitobjects in an osu!droid replay such as hit offset, tickset, and hit result.
 *
 * This is used when analyzing replays using replay analyzer.
 */
export interface ReplayObjectData {
    /**
     * For circles, this is the offset at which the circle was hit in milliseconds. If this is 10000, the circle was never tapped and therefore the player missed
     * ([game source code](https://github.com/osudroid/osu-droid/blob/ca0e4a2c06b9db18d094a15a4abf3f7ffcb05d7a/src/ru/nsu/ccfit/zuev/osu/game/GameplayHitCircle.java#L305)).
     *
     * For sliders, this is the offset at which the slider head was hit in milliseconds. For sliderbreaks, there are two scenarios:
     * - a value that is more than the slider's span duration strictly for replay version 6 and 7 ([game source code](https://github.com/osudroid/osu-droid/blob/ca0e4a2c06b9db18d094a15a4abf3f7ffcb05d7a/src/ru/nsu/ccfit/zuev/osu/game/GameplaySlider.java#L701)), or
     * - a value equal to `Math.floor(<hit window 50>ms) + 13ms` ([game source code](https://github.com/osudroid/osu-droid/blob/8e74a486fc6231a21a5f81e413c32b2f1ed55982/src/ru/nsu/ccfit/zuev/osu/game/GameplaySlider.java#L732)).
     *
     * `tickset` and `result` can be used in conjunction with this value to derive whether the player sliderbroke in the slider.
     * If `result` is a 300, the player did not sliderbreak. Otherwise, if all slider ticks, repeats, and ends were hit, the
     * player sliderbroke. In other cases, it is almost impossible to derive this result.
     *
     * For spinners, this is the total amount at which the spinner was spun:
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
     * This is used to determine whether or not a slider event (tick, repeat, and end) is hit based on the order they appear.
     */
    tickset: boolean[];

    /**
     * The bitwise hit result of the hitobject.
     */
    result: HitResult;
}
