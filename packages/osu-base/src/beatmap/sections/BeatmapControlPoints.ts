import { DifficultyControlPoint } from "../timings/DifficultyControlPoint";
import { EffectControlPoint } from "../timings/EffectControlPoint";
import { SampleControlPoint } from "../timings/SampleControlPoint";
import { TimingControlPoint } from "../timings/TimingControlPoint";
import { ControlPointManager } from "../timings/ControlPointManager";

/**
 * Contains information about timing and control points of a beatmap.
 */
export class BeatmapControlPoints {
    /**
     * The manager for timing control points of the beatmap.
     */
    readonly timing: ControlPointManager<TimingControlPoint> =
        new ControlPointManager();

    /**
     * The manager for difficulty control points of the beatmap.
     */
    readonly difficulty: ControlPointManager<DifficultyControlPoint> =
        new ControlPointManager();

    /**
     * The manager for effect control points of the beatmap.
     */
    readonly effect: ControlPointManager<EffectControlPoint> =
        new ControlPointManager();

    /**
     * The manager for sample control points of the beatmap.
     */
    readonly sample: ControlPointManager<SampleControlPoint> =
        new ControlPointManager();
}
