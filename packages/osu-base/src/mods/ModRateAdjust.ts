import { IModApplicableToTrackRate } from "./IModApplicableToTrackRate";
import { Mod } from "./Mod";
import { ModRateAdjustHelper } from "./ModRateAdjustHelper";

/**
 * Represents a `Mod` that adjusts the playback rate of a track.
 */
export abstract class ModRateAdjust
    extends Mod
    implements IModApplicableToTrackRate
{
    /**
     * The multiplier for the track's playback rate after applying this `Mod`.
     */
    abstract rate: number;

    /**
     * The generic osu!droid score multiplier of this `Mod`.
     */
    protected get droidScoreMultiplier(): number {
        return new ModRateAdjustHelper(this.rate).droidScoreMultiplier;
    }

    /**
     * The generic osu!droid migration score multiplier of this `Mod`.
     */
    protected get migrationDroidScoreMultiplier(): number {
        return this.droidScoreMultiplier;
    }

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
