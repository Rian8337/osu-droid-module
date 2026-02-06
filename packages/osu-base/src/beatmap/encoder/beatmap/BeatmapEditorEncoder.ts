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

        this.writeLine(`DistanceSpacing: ${editor.distanceSnap.toString()}`);
        this.writeLine(`BeatDivisor: ${editor.beatDivisor.toString()}`);
        this.writeLine(`GridSize: ${editor.gridSize.toString()}`);
        this.writeLine(`TimelineZoom: ${editor.timelineZoom.toString()}`);
    }
}
