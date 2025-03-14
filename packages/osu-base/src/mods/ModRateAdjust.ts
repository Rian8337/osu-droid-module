import { IModApplicableToTrackRate } from "./IModApplicableToTrackRate";
import { Mod } from "./Mod";

/**
 * Represents a `Mod` that adjusts the playback rate of a track.
 */
export abstract class ModRateAdjust
    extends Mod
    implements IModApplicableToTrackRate
{
    constructor() {
        super();

        this.incompatibleMods.add(ModRateAdjust);
    }

    abstract applyToRate(rate: number, oldStatistics?: boolean): number;
}
