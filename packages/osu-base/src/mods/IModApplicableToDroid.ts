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

    /**
     * The score multiplier used when reverse-engineering raw scores from stored total score with
     * multiplier during database migration for osu!droid. Defaults to {@link droidScoreMultiplier}.
     *
     * **If {@link droidScoreMultiplier} is changed in the future, this must be changed in the affected `Mod`
     * subclass to return the old formula, so scores that need to be migrated on-fly are divided by the correct
     * historical multiplier**.
     */
    get migrationDroidScoreMultiplier(): number;
}
