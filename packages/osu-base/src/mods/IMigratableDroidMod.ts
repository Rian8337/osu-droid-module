import { BeatmapDifficulty } from "../beatmap/sections/BeatmapDifficulty";
import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { Mod } from "./Mod";

/**
 * An interface for osu!droid `Mod`s that can be migrated to a new `Mod`.
 */
export interface IMigratableDroidMod {
    /**
     * Migrates this `Mod` to a new `Mod` in osu!droid.
     *
     * @param difficulty The `BeatmapDifficulty` to migrate this `Mod` against.
     * @returns The new `Mod`.
     */
    migrateDroidMod(difficulty: BeatmapDifficulty): Mod & IModApplicableToDroid;
}
