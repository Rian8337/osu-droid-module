import { Beatmap } from "../beatmap/Beatmap";
import { Interpolation } from "../math/Interpolation";
import { MathUtils } from "../math/MathUtils";
import { IModApplicableToBeatmap } from "./IModApplicableToBeatmap";
import { IModApplicableToTrackRate } from "./IModApplicableToTrackRate";
import { Mod } from "./Mod";
import { SerializedMod } from "./SerializedMod";

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
    abstract initialRate: number;

    /**
     * The final speed to ramp to.
     */
    abstract finalRate: number;

    private initialRateTime = 0;
    private finalRateTime = 0;

    constructor() {
        super();

        this.incompatibleMods.add(ModTimeRamp);
    }

    override copySettings(mod: SerializedMod): void {
        super.copySettings(mod);

        const { settings } = mod;

        this.initialRate = (settings?.initialRate as number | undefined) ?? 1;
        this.finalRate = (settings?.finalRate as number | undefined) ?? 1;
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
                this.initialRate,
                this.finalRate,
                MathUtils.clamp(amount, 0, 1),
            )
        );
    }

    protected override serializeSettings(): Record<string, unknown> | null {
        return { initialRate: this.initialRate, finalRate: this.finalRate };
    }

    override equals(other: Mod): other is this {
        return (
            super.equals(other) &&
            other instanceof ModTimeRamp &&
            other.initialRate === this.initialRate &&
            other.finalRate === this.finalRate
        );
    }

    override toString(): string {
        return `${super.toString()} (${this.initialRate.toFixed(2)}x - ${this.finalRate.toFixed(2)}x)`;
    }
}
