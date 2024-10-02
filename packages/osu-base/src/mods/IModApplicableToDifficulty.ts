import { BeatmapDifficulty } from "../beatmap/sections/BeatmapDifficulty";
import { Modes } from "../constants/Modes";

/**
 * An interface for `Mod`s that make general adjustments to difficulty.
 */
export interface IModApplicableToDifficulty {
    /**
     * Applies this `IModApplicableToDifficulty` to a `BeatmapDifficulty`.
     *
     * This is typically called post beatmap conversion.
     *
     * @param mode The game mode to apply for.
     * @param difficulty The `BeatmapDifficulty` to mutate.
     */
    applyToDifficulty(mode: Modes, difficulty: BeatmapDifficulty): void;
}
