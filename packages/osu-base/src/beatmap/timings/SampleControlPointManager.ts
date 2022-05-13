import { SampleBank } from "../../constants/SampleBank";
import { ControlPointManager } from "./ControlPointManager";
import { SampleControlPoint } from "./SampleControlPoint";

/**
 * A manager for sample control points.
 */
export class SampleControlPointManager extends ControlPointManager<SampleControlPoint> {
    override readonly defaultControlPoint: SampleControlPoint =
        new SampleControlPoint({
            time: 0,
            sampleBank: SampleBank.normal,
            sampleVolume: 100,
            customSampleBank: 0,
        });

    override controlPointAt(time: number): SampleControlPoint {
        return this.binarySearchWithFallback(time);
    }
}
