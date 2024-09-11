import { PlaceableHitObject } from "@rian8337/osu-base";

/**
 * An extended object structure containing three-finger data.
 */
export interface RebalanceThreeFingerObject {
    /**
     * The object.
     */
    readonly object: PlaceableHitObject;

    /**
     * The cursor instance index that aimed the object at the nearest time.
     *
     * If the object was missed, or if the object is a spinner, this is -1.
     */
    readonly aimingCursorInstanceIndex: number;

    /**
     * The cursor instance index that pressed the object at the nearest time.
     *
     * If the object was missed, or if the object is a spinner, this is -1.
     */
    readonly pressingCursorInstanceIndex: number;
}
