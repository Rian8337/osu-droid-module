import { BeatmapDifficulty } from "../beatmap/sections/BeatmapDifficulty";

/**
 * An interface denoting that a `Mod` can be applied to osu!droid.
 */
export interface IModApplicableToDroid {
    /**
     * Whether this `Mod` is ranked in osu!droid.
     */
    get droidRanked(): boolean;

    /**
     * Whether this `Mod` results in a meaningful effect to gameplay when applied in osu!droid.
     */
    get isDroidRelevant(): boolean;

    /**
     * Calculates the score multiplier of this `Mod` in osu!droid with the given `BeatmapDifficulty`.
     *
     * @param difficulty The `BeatmapDifficulty` to calculate the score multiplier for.
     * @returns The score multiplier of this `Mod` in osu!droid with the given `BeatmapDifficulty`.
     */
    calculateDroidScoreMultiplier(difficulty: BeatmapDifficulty): number;
}
