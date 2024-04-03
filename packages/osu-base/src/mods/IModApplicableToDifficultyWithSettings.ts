import { BeatmapDifficulty } from "../beatmap/sections/BeatmapDifficulty";
import { Modes } from "../constants/Modes";
import { Mod } from "./Mod";

/**
 * An interface for mods that make adjustments to difficulty based on other applied mods and settings.
 *
 * This should not be used together with `IModApplicableToDifficulty`.
 */
export interface IModApplicableToDifficultyWithSettings {
    /**
     * Applies this mod to a beatmap difficulty with settings.
     *
     * This is typically called post beatmap conversion.
     *
     * @param mode The game mode to apply the mod for.
     * @param difficulty The beatmap difficulty apply the mod to.
     * @param mods The mods that are applied to the beatmap.
     * @param customSpeedMultiplier The custom speed multiplier that is applied to the beatmap.
     */
    applyToDifficultyWithSettings(
        mode: Modes,
        difficulty: BeatmapDifficulty,
        mods: Mod[],
        customSpeedMultiplier: number,
    ): void;
}
