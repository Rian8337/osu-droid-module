import { SampleBank } from "../../constants/SampleBank";
import { BankHitSampleInfo } from "../hitobjects/BankHitSampleInfo";
import { FileHitSampleInfo } from "../hitobjects/FileHitSampleInfo";
import { HitSampleInfo } from "../hitobjects/HitSampleInfo";
import { ControlPoint } from "./ControlPoint";

/**
 * Represents a control point that handles sample sounds.
 */
export class SampleControlPoint extends ControlPoint {
    /**
     * The sample bank at this control point.
     */
    readonly sampleBank: SampleBank;

    /**
     * The sample volume at this control point.
     */
    readonly sampleVolume: number;

    /**
     * The index of the sample bank, if this sample bank uses custom samples.
     *
     * If this is 0, the beatmap's sample should be used instead.
     */
    readonly customSampleBank: number;

    constructor(values: {
        time: number;
        sampleBank: SampleBank;
        sampleVolume: number;
        customSampleBank: number;
    }) {
        super(values);

        this.sampleBank = values.sampleBank;
        this.sampleVolume = values.sampleVolume;
        this.customSampleBank = values.customSampleBank;
    }

    /**
     * Apples this control point's sample bank and volume to a `HitSampleInfo` if necessary, returning
     * the modified `HitSampleInfo`.
     *
     * @param hitSampleInfo The `HitSampleInfo`. This will not be modified.
     * @returns The modified `HitSampleInfo`. This does not share any references with the given `HitSampleInfo`.
     */
    applyTo(hitSampleInfo: HitSampleInfo): HitSampleInfo {
        const volume =
            hitSampleInfo.volume > 0 ? hitSampleInfo.volume : this.sampleVolume;

        if (hitSampleInfo instanceof BankHitSampleInfo) {
            return new BankHitSampleInfo(
                hitSampleInfo.name,
                hitSampleInfo.bank !== SampleBank.none
                    ? hitSampleInfo.bank
                    : this.sampleBank,
                hitSampleInfo.customSampleBank > 0
                    ? hitSampleInfo.customSampleBank
                    : this.customSampleBank,
                volume,
                hitSampleInfo.isLayered,
            );
        } else if (hitSampleInfo instanceof FileHitSampleInfo) {
            return new FileHitSampleInfo(hitSampleInfo.filename, volume);
        } else {
            throw new TypeError("Unknown type of hit sample info.");
        }
    }

    override isRedundant(existing: SampleControlPoint): boolean {
        return (
            this.sampleBank === existing.sampleBank &&
            this.sampleVolume === existing.sampleVolume &&
            this.customSampleBank === existing.customSampleBank
        );
    }

    override toString(): string {
        return (
            "{ time: " +
            this.time.toString() +
            ", " +
            "sample bank: " +
            this.sampleBank.toString() +
            ", " +
            "sample volume: " +
            this.sampleVolume.toString() +
            " }"
        );
    }
}
