import { Beatmap } from "../beatmap/Beatmap";
import { Interpolation } from "../math/Interpolation";
import { MathUtils } from "../math/MathUtils";
import { IModApplicableToBeatmap } from "./IModApplicableToBeatmap";
import { IModApplicableToTrackRate } from "./IModApplicableToTrackRate";
import { Mod } from "./Mod";
import { SerializedMod } from "./SerializedMod";
import { DecimalModSetting } from "./settings/DecimalModSetting";

/**
 * Represents a mod that gradually adjusts the track's playback rate over time.
 */
export abstract class ModTimeRamp
    extends Mod
    implements IModApplicableToBeatmap, IModApplicableToTrackRate
{
    /**
     * The point in the beatmap at which the final rate should be reached.
     */
    static readonly finalRateProgress = 0.75;

    /**
     * The starting speed of the track.
     */
    abstract readonly initialRate: DecimalModSetting;

    /**
     * The final speed to ramp to.
     */
    abstract readonly finalRate: DecimalModSetting;

    private initialRateTime = 0;
    private finalRateTime = 0;

    constructor() {
        super();

        this.incompatibleMods.add(ModTimeRamp);
    }

    override copySettings(mod: SerializedMod): void {
        super.copySettings(mod);

        const { settings } = mod;

        this.initialRate.value =
            (settings?.initialRate as number | undefined) ??
            this.initialRate.value;

        this.finalRate.value =
            (settings?.finalRate as number | undefined) ?? this.finalRate.value;
    }

    applyToBeatmap(beatmap: Beatmap): void {
        this.initialRateTime = beatmap.hitObjects.objects.at(0)?.startTime ?? 0;

        this.finalRateTime = Interpolation.lerp(
            this.initialRateTime,
            beatmap.hitObjects.objects.at(-1)?.endTime ?? 0,
            ModTimeRamp.finalRateProgress,
        );
    }

    applyToRate(time: number, rate: number): number {
        const amount =
            (time - this.initialRateTime) /
            (this.finalRateTime - this.initialRateTime);

        return (
            rate *
            Interpolation.lerp(
                this.initialRate.value,
                this.finalRate.value,
                MathUtils.clamp(amount, 0, 1),
            )
        );
    }

    protected override serializeSettings(): Record<string, unknown> | null {
        return {
            initialRate: this.initialRate.value,
            finalRate: this.finalRate.value,
        };
    }

    override equals(other: Mod): other is this {
        return (
            super.equals(other) &&
            other instanceof ModTimeRamp &&
            other.initialRate.value === this.initialRate.value &&
            other.finalRate.value === this.finalRate.value
        );
    }

    override toString(): string {
        return `${super.toString()} (${this.initialRate.toDisplayString()}x - ${this.finalRate.toDisplayString()}x)`;
    }
}
