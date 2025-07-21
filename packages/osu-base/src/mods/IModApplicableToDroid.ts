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
     * The score multiplier of this `Mod` in osu!droid.
     */
    get droidScoreMultiplier(): number;
}
