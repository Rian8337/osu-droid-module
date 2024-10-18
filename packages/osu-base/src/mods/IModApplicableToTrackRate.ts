/**
 * An interface for `Mod`s that make adjustments to the track's playback rate.
 */
export interface IModApplicableToTrackRate {
    /**
     * Returns the playback rate with this `Mod` applied.
     *
     * @param rate The playback rate before applying this `Mod`.
     * @param oldStatistics Whether to enforce old statistics. Some `Mod`s behave differently with this flag.
     * For example, `ModNightCore` would apply a 1.39 rate multiplier instead of 1.5 with this flag.
     */
    applyToRate(rate: number, oldStatistics?: boolean): number;
}
