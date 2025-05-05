import { HitObject } from "../beatmap/hitobjects/HitObject";

/**
 * Contains infromation about the position of a {@link HitObject}.
 */
export class HitObjectPositionInfo {
    /**
     * The {@link HitObject} associated with this {@link HitObjectPositionInfo}.
     */
    readonly hitObject: HitObject;

    /**
     * The jump angle from the previous {@link HitObject} to this one, relative to the previous
     * {@link HitObject}'s jump angle.
     *
     * The `relativeAngle` of the first {@link HitObject} in a beatmap represents the absolute angle from the
     * center of the playfield to the {@link HitObject}.
     *
     * If `relativeAngle` is 0, the player's cursor does not need to change its direction of movement when
     * passing from the previous {@link HitObject} to this one.
     */
    relativeAngle = 0;

    /**
     * The jump distance from the previous {@link HitObject} to this one.
     *
     * The `distanceFromPrevious` of the first {@link HitObject} in a beatmap is relative to the center of
     * the playfield.
     */
    distanceFromPrevious = 0;

    /**
     * The rotation of this {@link HitObject} relative to its jump angle.
     *
     * For `Slider`s, this is defined as the angle from the `Slider`'s start position to the end of its path
     * relative to its jump angle. For `HitCircle`s and `Spinner`s, this property is ignored.
     */
    rotation = 0;

    constructor(hitObject: HitObject) {
        this.hitObject = hitObject;
    }
}
