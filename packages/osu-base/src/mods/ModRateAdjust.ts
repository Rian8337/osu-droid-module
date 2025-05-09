import { IModApplicableToTrackRate } from "./IModApplicableToTrackRate";
import { Mod } from "./Mod";
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
        return this.trackRateMultiplier.value >= 1
            ? 1 + (this.trackRateMultiplier.value - 1) * 0.24
            : Math.pow(0.3, (1 - this.trackRateMultiplier.value) * 4);
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

    override equals(other: Mod): other is this {
        return (
            super.equals(other) &&
            other instanceof ModRateAdjust &&
            this.trackRateMultiplier.value === other.trackRateMultiplier.value
        );
    }
}
