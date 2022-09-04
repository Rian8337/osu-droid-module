import { ControlPointManager } from "./ControlPointManager";
import { DifficultyControlPoint } from "./DifficultyControlPoint";

/**
 * A manager for difficulty control points.
 */
export class DifficultyControlPointManager extends ControlPointManager<DifficultyControlPoint> {
    override readonly defaultControlPoint: DifficultyControlPoint =
        new DifficultyControlPoint({
            time: 0,
            speedMultiplier: 1,
            generateTicks: true,
        });

    override controlPointAt(time: number): DifficultyControlPoint {
        return this.binarySearchWithFallback(time);
    }
}
