import { ControlPoint } from "./ControlPoint";

/**
 * A manager for a type of control point.
 */
export class ControlPointManager<T extends ControlPoint> {
    /**
     * The control points in this manager.
     */
    readonly points: T[] = [];

    /**
     * Gets the control point that applies at a given time.
     *
     * @param time The time.
     */
    controlPointAt(time: number): T {
        if (this.points.length === 0) {
            throw new Error("No timing points have been loaded");
        }

        if (time < this.points[0].time) {
            return this.points[0];
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
