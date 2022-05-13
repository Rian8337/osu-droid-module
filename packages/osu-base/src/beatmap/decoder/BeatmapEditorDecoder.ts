import { EditorGridSize } from "../../constants/EditorGridSize";
import { BeatmapBaseDecoder } from "./BeatmapBaseDecoder";

/**
 * A decoder for decoding a beatmap's editor section.
 */
export class BeatmapEditorDecoder extends BeatmapBaseDecoder {
    override decode(line: string): void {
        const p: string[] = this.property(line);

        switch (p[0]) {
            case "Bookmarks":
                this.map.editor.bookmarks = p[1]
                    .split(",")
                    .map((v) => this.tryParseInt(v));
                break;
            case "DistanceSpacing":
                this.map.editor.distanceSnap = this.tryParseFloat(p[1]);
                break;
            case "BeatDivisor":
                this.map.editor.beatDivisor = this.tryParseFloat(p[1]);
                break;
            case "GridSize":
                this.map.editor.gridSize = <EditorGridSize>(
                    this.tryParseInt(p[1])
                );
                break;
            case "TimelineZoom":
                this.map.editor.timelineZoom = this.tryParseFloat(p[1]);
                break;
        }
    }
}
