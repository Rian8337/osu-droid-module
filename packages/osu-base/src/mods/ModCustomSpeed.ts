import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { ModRateAdjust } from "./ModRateAdjust";
import { SerializedMod } from "./SerializedMod";

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

    override trackRateMultiplier: number;

    readonly droidRanked = true;
    readonly droidString = "";

    readonly pcRanked = false;
    // TODO: temporary
    readonly pcScoreMultiplier = 1;

    constructor(trackRateMultiplier = 1) {
        super();

        this.trackRateMultiplier = trackRateMultiplier;
    }

    override copySettings(mod: SerializedMod): void {
        super.copySettings(mod);

        this.trackRateMultiplier =
            (mod.settings?.rateMultiplier as number | undefined) ??
            this.trackRateMultiplier;
    }

    calculateDroidScoreMultiplier(): number {
        return this.droidScoreMultiplier;
    }

    protected override serializeSettings(): Record<string, unknown> | null {
        return { rateMultiplier: this.trackRateMultiplier };
    }
}
