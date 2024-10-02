/**
 * An interface denoting that a `Mod` can be applied to osu!droid.
 */
export interface IModApplicableToDroid {
    /**
     * Whether this `Mod` is ranked in osu!droid.
     */
    readonly droidRanked: boolean;

    /**
     * The osu!droid score multiplier of this `Mod`.
     */
    readonly droidScoreMultiplier: number;

    /**
     * The osu!droid enum of the `Mod`.
     */
    readonly droidString: string;

    /**
     * Whether this `Mod` is a legacy `Mod` in osu!droid.
     *
     * A legacy `Mod` was removed from the game, but may still exist in scores or replays.
     */
    readonly isDroidLegacyMod: boolean;
}
