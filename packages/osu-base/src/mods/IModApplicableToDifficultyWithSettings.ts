import { BeatmapDifficulty } from "../beatmap/sections/BeatmapDifficulty";
import { Modes } from "../constants/Modes";
import { Mod } from "./Mod";

/**
 * An interface for `Mod`s that make general adjustments to difficulty.
 *
 * This is used in place of `IModApplicableToDifficulty` to make adjustments that
 * correlates directly to other applied `Mod`s and settings.
 *
 * `Mod`s marked by this interface will have their adjustments applied after
 * `IModApplicableToDifficulty` `Mod`s have been applied.
 */
export interface IModApplicableToDifficultyWithSettings {
    /**
     * Applies this `IModApplicableToDifficultyWithSettings` to a `BeatmapDifficulty`.
     *
     * This is typically called post beatmap conversion.
     *
     * @param mode The game mode to apply the mod for.
     * @param difficulty The `BeatmapDifficulty` to mutate.
     * @param mods The `Mod`s that are applied to the beatmap.
     * @param customSpeedMultiplier The custom speed multiplier that is applied to the beatmap.
     */
    applyToDifficultyWithSettings(
        mode: Modes,
        difficulty: BeatmapDifficulty,
        mods: Mod[],
        customSpeedMultiplier: number,
    ): void;
}
