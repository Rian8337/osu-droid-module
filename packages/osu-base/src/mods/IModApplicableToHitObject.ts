import { HitObject } from "../beatmap/hitobjects/HitObject";
import { Modes } from "../constants/Modes";
import { ModMap } from "./ModMap";

/**
 * An interface for `Mod`s that can be applied to `HitObject`s.
 */
export interface IModApplicableToHitObject {
    /**
     * Applies this `IModApplicableToHitObject` to a `HitObject`.
     *
     * @param mode The game mode to apply for.
     * @param hitObject The `HitObject` to apply to.
     * @param adjustmentMods A `ModMap` containing `IModFacilitatesAdjustment` `Mod`s.
     */
    applyToHitObject(
        mode: Modes,
        hitObject: HitObject,
        adjustmentMods: ModMap,
    ): void;
}
