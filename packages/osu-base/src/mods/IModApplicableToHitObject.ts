import { HitObject } from "../beatmap/hitobjects/HitObject";
import { Modes } from "../constants/Modes";

/**
 * An interface for mods that can be applied to hitobjects.
 */
export interface IModApplicableToHitObject {
    /**
     * Applies this mod to a hitobject.
     *
     * @param mode The mode to apply the mod for.
     * @param hitObject The hitobject to apply the mod to.
     */
    applyToHitObject(mode: Modes, hitObject: HitObject): void;
}
