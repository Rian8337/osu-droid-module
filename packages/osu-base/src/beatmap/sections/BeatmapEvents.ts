import { BeatmapBackground } from "../events/BeatmapBackground";
import { BeatmapVideo } from "../events/BeatmapVideo";
import { BreakPoint } from "../timings/BreakPoint";

/**
 * Contains beatmap events.
 */
export class BeatmapEvents {
    /**
     * The beatmap's background.
     */
    background?: BeatmapBackground;

    /**
     * The beatmap's video.
     */
    video?: BeatmapVideo;

    /**
     * The breaks this beatmap has.
     */
    readonly breaks: BreakPoint[] = [];
}
