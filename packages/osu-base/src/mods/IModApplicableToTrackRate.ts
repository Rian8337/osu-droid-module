/**
 * An interface for `Mod`s that make adjustments to the track's playback rate.
 */
export interface IModApplicableToTrackRate {
    /**
     * The multiplier to apply to the track's playback rate.
     */
    readonly trackRateMultiplier: number;
}
