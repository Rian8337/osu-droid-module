import { TimingControlPointManager } from "../timings/TimingControlPointManager";
import { DifficultyControlPointManager } from "../timings/DifficultyControlPointManager";
import { EffectControlPointManager } from "../timings/EffectControlPointManager";
import { SampleControlPointManager } from "../timings/SampleControlPointManager";

/**
 * Contains information about timing (control) points of a beatmap.
 */
export class BeatmapControlPoints {
    /**
     * The manager for timing control points of the beatmap.
     */
    readonly timing = new TimingControlPointManager();

    /**
     * The manager for difficulty control points of the beatmap.
     */
    readonly difficulty = new DifficultyControlPointManager();

    /**
     * The manager for effect control points of the beatmap.
     */
    readonly effect = new EffectControlPointManager();

    /**
     * The manager for sample control points of the beatmap.
     */
    readonly sample = new SampleControlPointManager();

    /**
     * Clears all control points in the beatmap.
     */
    clear(): void {
        this.timing.clear();
        this.difficulty.clear();
        this.effect.clear();
        this.sample.clear();
    }
}
