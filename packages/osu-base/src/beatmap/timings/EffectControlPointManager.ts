import { ControlPointManager } from "./ControlPointManager";
import { EffectControlPoint } from "./EffectControlPoint";

/**
 * A manager for effect control points.
 */
export class EffectControlPointManager extends ControlPointManager<EffectControlPoint> {
    override readonly defaultControlPoint: EffectControlPoint =
        new EffectControlPoint({
            time: 0,
            isKiai: false,
            omitFirstBarLine: false,
        });

    override controlPointAt(time: number): EffectControlPoint {
        return this.binarySearchWithFallback(time);
    }
}
