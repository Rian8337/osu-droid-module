import { Vector2 } from "@rian8337/osu-base";

/**
 * An extended object structure containing three-finger data.
 */
export interface TwoHandObject {
    /**
     * The index of the object in the beatmap.
     */
    readonly objectIndex: number;

    /**
     * The nearest cursor instance index that pressed the object at its hit time.
     *
     * If the object was missed, or if the object is a spinner, this is -1.
     */
    readonly nearestPressCursorInstanceIndex: number;

    /**
     * The nearest cursor group index that pressed the object at its hit time.
     *
     * If the object was missed, or if the object is a spinner, this is -1.
     */
    readonly nearestPressCursorGroupIndex: number;

    /**
     * The nearest cursor index that pressed the object at its hit time.
     *
     * If the object was missed, or if the object is a spinner, this is -1.
     */
    readonly nearestPressCursorIndex: number;

    /**
     * The time when the object was pressed.
     *
     * If the object was missed, or if the object is a spinner, this is -1.
     */
    readonly pressTime: number;

    /**
     * The position of the cursor when this object was pressed, if the position was interpolated
     * or the object was pressed.
     *
     * If not defined even though the object was pressed, this is the same position as the
     * cursor that pressed the object.
     */
    readonly pressPosition?: Vector2;

    /**
     * The nearest cursor instance index that released the object at its relevant position.
     *
     * If the object was missed, or if the object is a spinner, this is -1.
     */
    readonly nearestReleaseCursorInstanceIndex: number;

    /**
     * The nearest cursor group index that released the object at its relevant position.
     *
     * If the object was missed, or if the object is a spinner, this is -1.
     */
    readonly nearestReleaseCursorGroupIndex: number;

    /**
     * The nearest cursor index that released the object at its relevant position.
     *
     * If the object was missed, or if the object is a spinner, this is -1.
     */
    readonly nearestReleaseCursorIndex: number;

    /**
     * The time when the object was released.
     *
     * If the object was missed, or if the object is a spinner, this is -1.
     */
    readonly releaseTime: number;

    /**
     * The position of the cursor when this object was released, if the position was interpolated
     * or the object was pressed.
     *
     * If not defined even though the object was pressed, this is the same position as the
     * cursor that pressed the object.
     */
    readonly releasePosition?: Vector2;
}
