import { ControlPointManager } from "./ControlPointManager";
import { TimingControlPoint } from "./TimingControlPoint";

/**
 * A manager for timing control points.
 */
export class TimingControlPointManager extends ControlPointManager<TimingControlPoint> {
    override readonly defaultControlPoint: TimingControlPoint =
        new TimingControlPoint({
            time: 0,
            msPerBeat: 1000,
            timeSignature: 4,
        });

    override controlPointAt(time: number): TimingControlPoint {
        return this.binarySearchWithFallback(
            time,
            this.points[0] ?? this.defaultControlPoint
        );
    }
}
