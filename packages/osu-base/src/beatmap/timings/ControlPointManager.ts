import { ControlPoint } from "./ControlPoint";
import { TimingControlPoint } from "./TimingControlPoint";

/**
 * A manager for a control point.
 */
export abstract class ControlPointManager<T extends ControlPoint> {
    /**
     * The default control point for this type.
     */
    abstract readonly defaultControlPoint: T;

    /**
     * The control points in this manager.
     */
    readonly points: T[] = [];

    /**
     * Finds the control point that is active at a given time.
     *
     * @param time The time.
     * @returns The active control point at the given time.
     */
    abstract controlPointAt(time: number): T;

    /**
     * Adds a new control point.
     *
     * Note that the provided control point may not be added if the correct state is already present at the control point's time.
     *
     * Additionally, it is advised to use this instead of manually adding as array sorting will be ensured.
     *
     * @param controlPoint The control point to add.
     * @returns Whether the control point was added.
     */
    add(controlPoint: T): boolean {
        const existing: T = this.controlPointAt(controlPoint.time);

        // Timing points are a special case and need to be added regardless of fallback availability.
        if (
            !(existing instanceof TimingControlPoint) &&
            controlPoint.isRedundant(existing)
        ) {
            return false;
        }

        // Get the index at which to add the control point.
        for (let i = 0; i < this.points.length; ++i) {
            if (this.points[i].time >= controlPoint.time) {
                this.points.splice(i - 1, 0, controlPoint);

                return true;
            }
        }

        // Append the control point if it hasn't been added yet.
        this.points.push(controlPoint);

        return true;
    }

    /**
     * Binary searches one of the control point lists to find the active control point at the given time.
     *
     * Includes logic for returning the default control point when no matching point is found.
     *
     * @param time The time to find the control point at.
     * @param fallback The control point to use when the given time is before any control points. Defaults to the default control point.
     * @returns The active control point at the given time, or the default control point if none found.
     */
    protected binarySearchWithFallback(
        time: number,
        fallback: T = this.defaultControlPoint
    ): T {
        return this.binarySearch(time) ?? fallback;
    }

    /**
     * Binary searches one of the control point lists to find the active control point at the given time.
     *
     * @param time The time to find the control point at.
     * @returns The active control point at the given time, `null` if none found.
     */
    protected binarySearch(time: number): T | null {
        if (this.points.length === 0 || time < this.points[0].time) {
            return null;
        }

        if (time >= this.points.at(-1)!.time) {
            return this.points.at(-1)!;
        }

        let l: number = 0;
        let r: number = this.points.length - 2;

        while (l <= r) {
            const pivot: number = l + ((r - l) >> 1);

            if (this.points[pivot].time < time) {
                l = pivot + 1;
            } else if (this.points[pivot].time > time) {
                r = pivot - 1;
            } else {
                return this.points[pivot];
            }
        }

        // l will be the first control point with time > this.controlPoints[l].time, but we want the one before it
        return this.points[l - 1];
    }
}
