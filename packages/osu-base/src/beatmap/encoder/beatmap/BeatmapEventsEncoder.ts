import { StoryboardEncoder } from "../../StoryboardEncoder";
import { BeatmapBaseEncoder } from "./BeatmapBaseEncoder";

/**
 * An encoder for encoding a beatmap's events section.
 */
export class BeatmapEventsEncoder extends BeatmapBaseEncoder {
    protected override encodeInternal(): void {
        if (this.encodeSections) {
            this.writeLine("[Events]");
        }

        this.writeLine("//Background and Video Events");

        const { events } = this.map;

        if (events.background) {
            this.writeLine(
                `0,0,"${events.background.filename}",${events.background.offset.x},${events.background.offset.y}`,
            );
        }

        if (events.video) {
            this.writeLine(
                `Video,${events.video.startTime},"${events.video.filename}",${events.video.offset.x},${events.video.offset.y}`,
            );
        }

        this.writeLine("//Break Periods");

        for (const b of events.breaks) {
            this.writeLine(`2,${b.startTime},${b.endTime}`);
        }

        if (this.map.events.storyboard) {
            this.writeLine(
                new StoryboardEncoder(
                    this.map.events.storyboard,
                    false,
                ).encode().result,
            );
        } else {
            this.writeLine("//Storyboard Layer 0 (Background)");
            this.writeLine("//Storyboard Layer 1 (Fail)");
            this.writeLine("//Storyboard Layer 2 (Pass)");
            this.writeLine("//Storyboard Layer 3 (Foreground)");
            this.writeLine("//Storyboard Layer 4 (Overlay)");
            this.writeLine("//Storyboard Sound Samples");
        }
    }
}
