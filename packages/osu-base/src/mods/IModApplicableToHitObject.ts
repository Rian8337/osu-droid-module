import { HitObject } from "../beatmap/hitobjects/HitObject";
import { Modes } from "../constants/Modes";

/**
 * An interface for `Mod`s that can be applied to `HitObject`s.
 */
export interface IModApplicableToHitObject {
    /**
     * Applies this `IModApplicableToHitObject` to a `HitObject`.
     *
     * @param mode The game mode to apply for.
     * @param hitObject The `HitObject` to apply to.
     */
    applyToHitObject(mode: Modes, hitObject: HitObject): void;
}
