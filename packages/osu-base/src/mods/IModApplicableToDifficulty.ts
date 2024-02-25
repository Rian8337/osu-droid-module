import { BeatmapDifficulty } from "../beatmap/sections/BeatmapDifficulty";
import { Modes } from "../constants/Modes";

/**
 * An interface for mods that make general adjustments to difficulty.
 */
export interface IModApplicableToDifficulty {
    /**
     * Applies this mod to a beatmap difficulty.
     *
     * This is typically called post beatmap conversion.
     *
     * @param mode The game mode to apply the mod for.
     * @param difficulty The beatmap difficulty to apply the mod to.
     */
    applyToDifficulty(mode: Modes, difficulty: BeatmapDifficulty): void;
}
