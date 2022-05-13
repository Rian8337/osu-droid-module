/**
 * Represents a control point in a beatmap.
 */
export abstract class ControlPoint {
    /**
     * The time at which the control point takes effect in milliseconds.
     */
    readonly time: number;

    constructor(values: {
        /**
         * The time at which the control point takes effect in milliseconds.
         */
        time: number;
    }) {
        this.time = values.time;
    }

    /**
     * Determines whether this control point results in a meaningful change when placed alongside another.
     *
     * @param existing An existing control point to compare with.
     */
    abstract isRedundant(existing: ControlPoint): boolean;

    /**
     * Returns a string representative of the class.
     */
    abstract toString(): string;
}
