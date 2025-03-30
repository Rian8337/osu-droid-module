/**
 * An interface for `Mod`s that make adjustments to the track's playback rate.
 */
export interface IModApplicableToTrackRate {
    /**
     * Returns the playback rate at `time` after this `Mod` is applied.
     *
     * @param time The time at which the playback rate is queried, in milliseconds.
     * @param rate The playback rate before applying this [Mod].
     * @return The playback rate after applying this [Mod].
     */
    applyToRate(time: number, rate: number): number;
}
