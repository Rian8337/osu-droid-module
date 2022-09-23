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

    private _points: T[] = [];

    /**
     * The control points in this manager.
     */
    get points(): readonly T[] {
        return this._points;
    }

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
     * Additionally, any control point that exists in the same time will be removed.
     *
     * @param controlPoint The control point to add.
     * @returns Whether the control point was added.
     */
    add(controlPoint: T): boolean {
        let existing: T = this.controlPointAt(controlPoint.time);

        // Timing points are a special case and need to be added regardless of fallback availability.
        if (
            !(existing instanceof TimingControlPoint) &&
            controlPoint.isRedundant(existing)
        ) {
            return false;
        }

        // Remove the existing control point if the new control point overrides it at the same time.
        while (controlPoint.time === existing.time) {
            if (!this.remove(existing)) {
                break;
            }

            existing = this.controlPointAt(controlPoint.time);
        }

        this._points.splice(
            this.findInsertionIndex(controlPoint.time),
            0,
            controlPoint
        );

        return true;
    }

    /**
     * Removes a control point.
     *
     * This method will remove the earliest control point in the array that is equal to the given control point.
     *
     * @param controlPoint The control point to remove.
     * @returns Whether the control point was removed.
     */
    remove(controlPoint: T): boolean {
        for (let i = 0; i < this._points.length; ++i) {
            if (this._points[i].time > controlPoint.time) {
                break;
            }

            // isRedundant doesn't check for time equality, so we need to specify it separately.
            if (
                this._points[i].time === controlPoint.time &&
                this._points[i].isRedundant(controlPoint)
            ) {
                this._points.splice(i, 1);

                return true;
            }
        }

        return false;
    }

    /**
     * Removes a control point at an index.
     *
     * @param index The index of the control point to remove.
     * @returns The control point that was removed.
     */
    removeAt(index: number): T {
        return this._points.splice(index, 1)[0];
    }

    /**
     * Clears all control points of this type.
     */
    clear(): void {
        this._points.length = 0;
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
        if (this._points.length === 0 || time < this._points[0].time) {
            return null;
        }

        if (time >= this._points.at(-1)!.time) {
            return this._points.at(-1)!;
        }

        let l: number = 0;
        let r: number = this._points.length - 2;

        while (l <= r) {
            const pivot: number = l + ((r - l) >> 1);

            if (this._points[pivot].time < time) {
                l = pivot + 1;
            } else if (this._points[pivot].time > time) {
                r = pivot - 1;
            } else {
                return this._points[pivot];
            }
        }

        // l will be the first control point with time > this._points[l].time, but we want the one before it
        return this._points[l - 1];
    }

    /**
     * Finds the insertion index of a control point in a given time.
     *
     * @param time The start time of the control point.
     */
    private findInsertionIndex(time: number): number {
        if (this._points.length === 0 || time < this._points[0].time) {
            return 0;
        }

        if (time >= this._points.at(-1)!.time) {
            return this._points.length;
        }

        let l: number = 0;
        let r: number = this._points.length - 2;

        while (l <= r) {
            const pivot: number = l + ((r - l) >> 1);

            if (this._points[pivot].time < time) {
                l = pivot + 1;
            } else if (this._points[pivot].time > time) {
                r = pivot - 1;
            } else {
                return pivot;
            }
        }

        return l;
    }
}
