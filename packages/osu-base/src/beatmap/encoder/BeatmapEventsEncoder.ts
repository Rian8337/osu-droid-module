import { BeatmapEvents } from "../sections/BeatmapEvents";
import { BeatmapBaseEncoder } from "./BeatmapBaseEncoder";

/**
 * An encoder for encoding a beatmap's events section.
 */
export class BeatmapEventsEncoder extends BeatmapBaseEncoder {
    protected override encodeInternal(): void {
        this.writeLine("[Events]");
        this.writeLine("//Background and Video Events");

        const events: BeatmapEvents = this.map.events;

        if (events.background) {
            this.writeLine(
                `0,0,"${events.background.filename}",${events.background.offset.x},${events.background.offset.y}`
            );
        }

        if (events.video) {
            this.writeLine(
                `Video,${events.video.startTime},"${events.video.filename}",${events.video.offset.x},${events.video.offset.y}`
            );
        }

        this.writeLine("//Break Periods");

        for (const b of events.breaks) {
            this.writeLine(`2,${b.startTime},${b.endTime}`);
        }
    }
}
