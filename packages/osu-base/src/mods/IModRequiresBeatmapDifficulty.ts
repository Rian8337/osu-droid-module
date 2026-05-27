import { BeatmapDifficulty } from "../beatmap/sections/BeatmapDifficulty";

/**
 * An interface for `Mod`s that require the original instance of a `BeatmapDifficulty` to perform
 * conversion and processing.
 */
export interface IModRequiresBeatmapDifficulty {
    /**
     * Applies this `IModRequiresBeatmapDifficulty` from a `BeatmapDifficulty`.
     *
     * This is called before conversion and processing.
     *
     * @param difficulty The `BeatmapDifficulty` to apply from.
     */
    applyFromBeatmapDifficulty(difficulty: BeatmapDifficulty): void;
}
