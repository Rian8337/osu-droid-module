import { PlaceableHitObject } from "@rian8337/osu-base";
import { DifficultyHitObject } from "./DifficultyHitObject";

/**
 * Represents an osu!droid hit object with difficulty calculation values.
 */
export class DroidDifficultyHitObject extends DifficultyHitObject {
    /**
     * The snap aim strain generated by the hitobject.
     */
    snapAimStrain: number = 0;

    /**
     * The flow aim strain generated by the hitobject.
     */
    flowAimStrain: number = 0;

    /**
     * The tap strain generated by the hitobject.
     */
    tapStrain: number = 0;

    /**
     * The tap strain generated by the hitobject if `strainTime` isn't modified by
     * OD. This is used in three-finger detection.
     */
    originalTapStrain: number = 0;

    /**
     * The rhythm strain generated by the hitobject.
     */
    rhythmStrain: number = 0;

    /**
     * The flashlight strain generated by the hitobject if sliders are considered.
     */
    flashlightStrainWithSliders: number = 0;

    /**
     * The flashlight strain generated by the hitobject if sliders are not considered.
     */
    flashlightStrainWithoutSliders: number = 0;

    /**
     * The visual strain generated by the hitobject if sliders are considered.
     */
    visualStrainWithSliders: number = 0;

    /**
     * The visual strain generated by the hitobject if sliders are not considered.
     */
    visualStrainWithoutSliders: number = 0;

    /**
     * The note density of the hitobject.
     */
    noteDensity: number = 1;

    /**
     * The overlapping factor of the hitobject.
     *
     * This is used to scale visual skill.
     */
    overlappingFactor: number = 0;

    /**
     * @param object The underlying hitobject.
     * @param hitObjects All difficulty hitobjects in the processed beatmap.
     */
    constructor(
        object: PlaceableHitObject,
        hitObjects: DroidDifficultyHitObject[],
    ) {
        super(object, hitObjects);
    }
}
