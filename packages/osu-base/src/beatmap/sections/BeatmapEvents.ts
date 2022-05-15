import { StoryboardLayerType } from "../storyboard/enums/StoryboardLayerType";
import { BeatmapBackground } from "../events/BeatmapBackground";
import { BeatmapVideo } from "../events/BeatmapVideo";
import { Storyboard } from "../Storyboard";
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
     * The beatmap's storyboard.
     */
    storyboard?: Storyboard;

    /**
     * The breaks this beatmap has.
     */
    readonly breaks: BreakPoint[] = [];

    /**
     * Whether the beatmap's background should be hidden while its storyboard is being displayed.
     */
    get storyboardReplacesBackground(): boolean {
        return (
            this.storyboard
                ?.getLayer(StoryboardLayerType.background)
                .elements.some(
                    (e) => e.path.toLowerCase() === this.background?.filename
                ) ?? false
        );
    }
}
