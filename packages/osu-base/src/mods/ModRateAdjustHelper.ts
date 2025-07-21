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

    constructor(trackRateMultiplier: number) {
        this.trackRateMultiplier = trackRateMultiplier;
    }
}
