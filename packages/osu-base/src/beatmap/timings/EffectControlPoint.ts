import { ControlPoint } from "./ControlPoint";

/**
 * Represents a control point that applies an effect to a beatmap.
 */
export class EffectControlPoint extends ControlPoint {
    /**
     * Whether or not kiai time is enabled at this control point.
     */
    readonly isKiai: boolean;

    constructor(values: { time: number; effectBitFlags: number }) {
        super(values);

        this.isKiai = !!(values.effectBitFlags & (1 << 0));
    }

    override isRedundant(existing: EffectControlPoint): boolean {
        return this.isKiai === existing.isKiai;
    }

    override toString(): string {
        return "{ time: " + this.time + ", " + "kiai: " + this.isKiai + " }";
    }
}
