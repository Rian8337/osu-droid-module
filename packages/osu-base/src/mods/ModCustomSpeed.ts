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

    readonly droidRanked = true;
    readonly osuRanked = false;

    override copySettings(mod: SerializedMod): void {
        super.copySettings(mod);

        this.trackRateMultiplier.value =
            (mod.settings?.rateMultiplier as number | undefined) ??
            this.trackRateMultiplier.value;
    }

    get isDroidRelevant(): boolean {
        return this.isRelevant;
    }

    override get droidScoreMultiplier(): number {
        return super.droidScoreMultiplier;
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

    protected override serializeSettings(): Record<string, unknown> | null {
        return { rateMultiplier: this.trackRateMultiplier.value };
    }

    override toString(): string {
        return `${super.toString()} (${this.trackRateMultiplier.toDisplayString()}x)`;
    }
}
