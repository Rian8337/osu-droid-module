import { IModApplicableToTrackRate } from "./IModApplicableToTrackRate";
import { Mod } from "./Mod";
import { ModRateAdjustHelper } from "./ModRateAdjustHelper";
import { DecimalModSetting } from "./settings/DecimalModSetting";

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
    readonly trackRateMultiplier: DecimalModSetting;

    /**
     * The generic osu!droid score multiplier of this `Mod`.
     */
    protected get droidScoreMultiplier(): number {
        return new ModRateAdjustHelper(this.trackRateMultiplier.value)
            .droidScoreMultiplier;
    }

    /**
     * Generic getter to determine if this `ModRateAdjust` is relevant.
     */
    protected get isRelevant(): boolean {
        return this.trackRateMultiplier.value !== 1;
    }

    constructor(trackRateMultiplier = 1) {
        super();

        this.trackRateMultiplier = new DecimalModSetting(
            "Track rate multiplier",
            "The multiplier for the track's playback rate after applying this mod.",
            trackRateMultiplier,
            0.5,
            2,
            0.05,
            2,
        );
    }

    applyToRate(_: number, rate: number): number {
        return rate * this.trackRateMultiplier.value;
    }
}
