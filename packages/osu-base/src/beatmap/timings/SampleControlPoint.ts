import { SampleBank } from "../../constants/SampleBank";
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
            this.time +
            ", " +
            "sample bank: " +
            this.sampleBank +
            ", " +
            "sample volume: " +
            this.sampleVolume +
            " }"
        );
    }
}
