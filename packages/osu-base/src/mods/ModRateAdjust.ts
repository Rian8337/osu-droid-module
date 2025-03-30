import { IModApplicableToTrackRate } from "./IModApplicableToTrackRate";
import { Mod } from "./Mod";

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
    abstract readonly trackRateMultiplier: number;

    /**
     * The generic osu!droid score multiplier of this `Mod`.
     */
    protected get droidScoreMultiplier(): number {
        return this.trackRateMultiplier >= 1
            ? 1 + (this.trackRateMultiplier - 1) * 0.24
            : Math.pow(0.3, (1 - this.trackRateMultiplier) * 4);
    }

    constructor() {
        super();

        this.incompatibleMods.add(ModRateAdjust);
    }

    applyToRate(time: number, rate: number): number {
        return rate * this.trackRateMultiplier;
    }
}
