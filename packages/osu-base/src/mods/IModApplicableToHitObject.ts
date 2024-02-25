import { HitObject } from "../beatmap/hitobjects/HitObject";

/**
 * An interface for mods that can be applied to hitobjects.
 */
export interface IModApplicableToHitObject {
    /**
     * Applies this mod to a hitobject.
     *
     * @param hitObject The hitobject to apply the mod to.
     */
    applyToHitObject(hitObject: HitObject): void;
}
