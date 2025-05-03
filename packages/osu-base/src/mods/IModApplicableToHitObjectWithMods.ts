import { HitObject } from "../beatmap/hitobjects/HitObject";
import { Modes } from "../constants/Modes";
import { ModMap } from "./ModMap";

/**
 * An interface for `Mod`s that can be applied to `HitObject`s.
 *
 * This is used in place of `IModApplicableToHitObject` to make adjustments that
 * correlates directly to other applied `Mod`s.
 *
 * `Mod`s marked by this interface will have their adjustments applied after
 * `IModApplicableToHitObject` `Mod`s have been applied.
 */
export interface IModApplicableToHitObjectWithMods {
    /**
     * Applies this `IModApplicableToHitObjectWithSettings` to a `HitObject`.
     *
     * This is typically called post beatmap conversion.
     *
     * @param mode The game mode to apply for.
     * @param hitObject The `HitObject` to mutate.
     * @param mods The `Mod`s that are applied to the beatmap.
     */
    applyToHitObjectWithMods(
        mode: Modes,
        hitObject: HitObject,
        mods: ModMap,
    ): void;
}
