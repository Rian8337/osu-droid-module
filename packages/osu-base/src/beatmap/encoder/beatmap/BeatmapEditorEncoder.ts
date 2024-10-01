import { BeatmapBaseEncoder } from "./BeatmapBaseEncoder";

/**
 * An encoder for encoding a beatmap's general section.
 */
export class BeatmapEditorEncoder extends BeatmapBaseEncoder {
    protected override encodeInternal(): void {
        if (this.encodeSections) {
            this.writeLine("[Editor]");
        }

        const { editor } = this.map;

        if (editor.bookmarks.length > 0) {
            this.writeLine(editor.bookmarks.join());
        }

        this.writeLine(`DistanceSpacing: ${editor.distanceSnap}`);
        this.writeLine(`BeatDivisor: ${editor.beatDivisor}`);
        this.writeLine(`GridSize: ${editor.gridSize}`);
        this.writeLine(`TimelineZoom: ${editor.timelineZoom}`);
    }
}
