import { PlaceableHitObject } from "@rian8337/osu-base";
import { DifficultyHitObject } from "./DifficultyHitObject";

/**
 * Represents an osu!standard hit object with difficulty calculation values.
 */
export class OsuDifficultyHitObject extends DifficultyHitObject {
    /**
     * The speed strain generated by the hitobject.
     */
    speedStrain: number = 0;

    /**
     * The flashlight strain generated by this hitobject.
     */
    flashlightStrain: number = 0;

    /**
     * @param object The underlying hitobject.
     * @param hitObjects All difficulty hitobjects in the processed beatmap.
     */
    constructor(
        object: PlaceableHitObject,
        hitObjects: OsuDifficultyHitObject[],
    ) {
        super(object, hitObjects);
    }
}