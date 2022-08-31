import { ControlPoint } from "./ControlPoint";

/**
 * Represents a control point that changes speed multiplier.
 */
export class DifficultyControlPoint extends ControlPoint {
    /**
     * The slider speed multiplier of the control point.
     */
    readonly speedMultiplier: number;

    /**
     * Whether or not slider ticks should be generated at this control point.
     *
     * This exists for backwards compatibility with maps that abuse NaN slider velocity behavior on osu!stable (e.g. /b/2628991).
     */
    readonly generateTicks: boolean;

    // Generate ticks can be made required in 3.0.
    constructor(values: {
        time: number;
        speedMultiplier: number;
        generateTicks?: boolean;
    }) {
        super(values);
        this.speedMultiplier = values.speedMultiplier;
        this.generateTicks = values.generateTicks ?? true;
    }

    override isRedundant(existing: DifficultyControlPoint): boolean {
        return (
            this.speedMultiplier === existing.speedMultiplier &&
            this.generateTicks === existing.generateTicks
        );
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
