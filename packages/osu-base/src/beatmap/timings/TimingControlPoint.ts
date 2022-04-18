import { ControlPoint } from "./ControlPoint";

/**
 * Represents a control point that changes the beatmap's BPM.
 */
export class TimingControlPoint extends ControlPoint {
    /**
     * The amount of milliseconds passed for each beat.
     */
    readonly msPerBeat: number;

    /**
     * The amount of beats in a measure.
     */
    readonly timeSignature: number;

    constructor(values: {
        time: number;
        msPerBeat: number;
        timeSignature: number;
    }) {
        super(values);

        this.msPerBeat = values.msPerBeat;
        this.timeSignature = values.timeSignature;
    }

    override toString(): string {
        return (
            "{ time: " +
            this.time +
            ", " +
            "ms_per_beat: " +
            this.msPerBeat.toFixed(2) +
            ", " +
            "timeSignature: " +
            this.timeSignature +
            " }"
        );
    }
}
