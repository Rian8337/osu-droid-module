import { IModApplicableToTrackRate } from "./IModApplicableToTrackRate";
import { Mod } from "./Mod";

/**
 * Represents a `Mod` that adjusts the playback rate of a track.
 */
export abstract class ModRateAdjust
    extends Mod
    implements IModApplicableToTrackRate {
    /**
     * The multiplier for the track's playback rate after applying this `Mod`.
     */
    abstract rate: number;

    /**
     * Generic getter to determine if this `ModRateAdjust` is relevant.
     */
    protected get isRelevant(): boolean {
        return this.rate !== 1;
    }

    applyToRate(_: number, rate: number): number {
        return rate * this.rate;
    }
}
