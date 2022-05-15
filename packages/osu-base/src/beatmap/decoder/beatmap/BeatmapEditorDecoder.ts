import { EditorGridSize } from "../../../constants/EditorGridSize";
import { Beatmap } from "../../Beatmap";
import { SectionDecoder } from "../SectionDecoder";

/**
 * A decoder for decoding a beatmap's editor section.
 */
export class BeatmapEditorDecoder extends SectionDecoder<Beatmap> {
    protected override decodeInternal(line: string): void {
        const p: string[] = this.property(line);

        switch (p[0]) {
            case "Bookmarks":
                this.target.editor.bookmarks = p[1]
                    .split(",")
                    .map((v) => this.tryParseInt(v));
                break;
            case "DistanceSpacing":
                this.target.editor.distanceSnap = this.tryParseFloat(p[1]);
                break;
            case "BeatDivisor":
                this.target.editor.beatDivisor = this.tryParseFloat(p[1]);
                break;
            case "GridSize":
                this.target.editor.gridSize = <EditorGridSize>(
                    this.tryParseInt(p[1])
                );
                break;
            case "TimelineZoom":
                this.target.editor.timelineZoom = this.tryParseFloat(p[1]);
                break;
        }
    }
}
