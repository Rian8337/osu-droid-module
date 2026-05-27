/**
 * Helper class for `Mod`s related to track rate adjustments.
 */
export class ModRateAdjustHelper {
    /**
     * The multiplier for the track's playback rate.
     */
    readonly trackRateMultiplier: number;

    /**
     * The osu!droid score multiplier of this `Mod`.
     */
    get droidScoreMultiplier(): number {
        return this.trackRateMultiplier >= 1
            ? 1 + (this.trackRateMultiplier - 1) * 0.24
            : Math.pow(0.3, (1 - this.trackRateMultiplier) * 4);
    }

    /**
     * The score multiplier used when reverse-engineering raw scores from stored total score with
     * multiplier during database migration for osu!droid. Defaults to {@link droidScoreMultiplier}.
     *
     * **If {@link droidScoreMultiplier} is changed in the future, this must be changed in the affected `Mod`
     * subclass to return the old formula, so scores that need to be migrated on-fly are divided by the correct
     * historical multiplier**.
     */
    get migrationDroidScoreMultiplier(): number {
        return this.droidScoreMultiplier;
    }

    constructor(trackRateMultiplier: number) {
        this.trackRateMultiplier = trackRateMultiplier;
    }
}
