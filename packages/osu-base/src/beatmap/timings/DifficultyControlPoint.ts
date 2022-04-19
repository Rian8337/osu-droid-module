import { ControlPoint } from "./ControlPoint";

/**
 * Represents a control point that changes speed multiplier.
 */
export class DifficultyControlPoint extends ControlPoint {
    /**
     * The slider speed multiplier of the control point.
     */
    readonly speedMultiplier: number;

    constructor(values: { time: number; speedMultiplier: number }) {
        super(values);
        this.speedMultiplier = values.speedMultiplier;
    }

    override isRedundant(existing: DifficultyControlPoint): boolean {
        return this.speedMultiplier === existing.speedMultiplier;
    }

    override toString(): string {
        return (
            "{ time: " +
            this.time +
            ", " +
            "speed multiplier: " +
            this.speedMultiplier.toFixed(2) +
            " }"
        );
    }
}
