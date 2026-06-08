import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { ModRateAdjust } from "./ModRateAdjust";
import { DecimalModSetting } from "./settings/DecimalModSetting";

/**
 * Represents the Custom Speed mod.
 *
 * This is a replacement `Mod` for speed modify in osu!droid and custom rates in osu!lazer.
 */
export class ModCustomSpeed
    extends ModRateAdjust
    implements IModApplicableToDroid, IModApplicableToOsu
{
    override readonly acronym = "CS";
    override readonly name = "Custom Speed";

    override get rate(): number {
        return this.trackRateMultiplier.value;
    }

    /**
     * The setting to change the multiplier for the track's playback rate after applying this `ModCustomSpeed`.
     */
    readonly trackRateMultiplier = new DecimalModSetting(
        "Track rate multiplier",
        "rateMultiplier",
        "The multiplier for the track's playback rate after applying this mod.",
        1,
        0.5,
        2,
        0.05,
        2,
    );

    readonly droidRanked = true;
    readonly osuRanked = false;

    get isDroidRelevant(): boolean {
        return this.isRelevant;
    }

    override get droidScoreMultiplier(): number {
        return super.droidScoreMultiplier;
    }

    override get migrationDroidScoreMultiplier(): number {
        return super.migrationDroidScoreMultiplier;
    }

    get isOsuRelevant(): boolean {
        return this.isRelevant;
    }

    get osuScoreMultiplier(): number {
        // Round to the nearest multiple of 0.1.
        let value = Math.trunc(this.trackRateMultiplier.value * 10) / 10;

        // Offset back to 0.
        --value;

        return this.trackRateMultiplier.value >= 1
            ? 1 + value / 5
            : 0.6 + value;
    }

    constructor(trackRateMultiplier = 1) {
        super();

        this.trackRateMultiplier.value = trackRateMultiplier;
    }

    override toString(): string {
        return `${super.toString()} (${this.trackRateMultiplier.toDisplayString()}x)`;
    }
}
