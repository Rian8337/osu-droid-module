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

    constructor(values: {
        time: number;
        sampleBank: SampleBank;
        sampleVolume: number;
    }) {
        super(values);

        this.sampleBank = values.sampleBank;
        this.sampleVolume = values.sampleVolume;
    }

    override isRedundant(existing: SampleControlPoint): boolean {
        return (
            this.sampleBank === existing.sampleBank &&
            this.sampleVolume === existing.sampleVolume
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
