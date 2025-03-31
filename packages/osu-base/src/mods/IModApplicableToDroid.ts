import { BeatmapDifficulty } from "../beatmap/sections/BeatmapDifficulty";

/**
 * An interface denoting that a `Mod` can be applied to osu!droid.
 */
export interface IModApplicableToDroid {
    /**
     * Whether this `Mod` is ranked in osu!droid.
     */
    readonly droidRanked: boolean;

    /**
     * Calculates the score multiplier of this `Mod` in osu!droid with the given `BeatmapDifficulty`.
     *
     * @param difficulty The `BeatmapDifficulty` to calculate the score multiplier for.
     * @returns The score multiplier of this `Mod` in osu!droid with the given `BeatmapDifficulty`.
     */
    calculateDroidScoreMultiplier(difficulty: BeatmapDifficulty): number;

    /**
     * The osu!droid enum of the `Mod`.
     */
    readonly droidString: string;
}
