import { ControlPoint } from "./ControlPoint";

/**
 * Represents a control point that applies an effect to a beatmap.
 */
export class EffectControlPoint extends ControlPoint {
    /**
     * Whether or not kiai time is enabled at this control point.
     */
    readonly isKiai: boolean;

    /**
     * Whether the first bar line of this control point is ignored.
     */
    readonly omitFirstBarLine: boolean;

    constructor(values: {
        time: number;
        isKiai: boolean;
        omitFirstBarLine: boolean;
    }) {
        super(values);

        this.isKiai = values.isKiai;
        this.omitFirstBarLine = values.omitFirstBarLine;
    }

    override isRedundant(existing: EffectControlPoint): boolean {
        return this.isKiai === existing.isKiai;
    }

    override toString(): string {
        return "{ time: " + this.time + ", " + "kiai: " + this.isKiai + " }";
    }
}
