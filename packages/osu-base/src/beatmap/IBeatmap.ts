import { BeatmapColor } from "./sections/BeatmapColor";
import { BeatmapControlPoints } from "./sections/BeatmapControlPoints";
import { BeatmapDifficulty } from "./sections/BeatmapDifficulty";
import { BeatmapEditor } from "./sections/BeatmapEditor";
import { BeatmapEvents } from "./sections/BeatmapEvents";
import { BeatmapGeneral } from "./sections/BeatmapGeneral";
import { BeatmapHitObjects } from "./sections/BeatmapHitObjects";
import { BeatmapMetadata } from "./sections/BeatmapMetadata";

/**
 * Represents a beatmap.
 */
export interface IBeatmap {
    /**
     * The format version of the beatmap.
     */
    formatVersion: number;

    /**
     * General information about the beatmap.
     */
    readonly general: BeatmapGeneral;

    /**
     * Saved settings for the beatmap editor.
     */
    readonly editor: BeatmapEditor;

    /**
     * Information used to identify the beatmap.
     */
    readonly metadata: BeatmapMetadata;

    /**
     * Difficulty settings of the beatmap.
     */
    difficulty: BeatmapDifficulty;

    /**
     * Events of the beatmap.
     */
    readonly events: BeatmapEvents;

    /**
     * Timing and control points of the beatmap.
     */
    readonly controlPoints: BeatmapControlPoints;

    /**
     * Combo and skin colors of the beatmap.
     */
    readonly colors: BeatmapColor;

    /**
     * The objects of the beatmap.
     */
    hitObjects: BeatmapHitObjects;

    /**
     * The maximum combo of the beatmap.
     */
    get maxCombo(): number;

    /**
     * Returns a time combined with beatmap-wide time offset.
     *
     * BeatmapVersion 4 and lower had an incorrect offset. Stable has this set as 24ms off.
     *
     * @param time The time.
     */
    getOffsetTime(time: number): number;
}
