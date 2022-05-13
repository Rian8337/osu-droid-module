import { BaseParser } from "./BaseParser";

/**
 * A parser for parsing a beatmap's metadata section.
 */
export class MetadataParser extends BaseParser {
    parse(line: string): void {
        const p: string[] = this.property(line);

        switch (p[0]) {
            case "Title":
                this.map.metadata.title = p[1];
                break;
            case "TitleUnicode":
                this.map.metadata.titleUnicode = p[1];
                break;
            case "Artist":
                this.map.metadata.artist = p[1];
                break;
            case "ArtistUnicode":
                this.map.metadata.artistUnicode = p[1];
                break;
            case "Creator":
                this.map.metadata.creator = p[1];
                break;
            case "Version":
                this.map.metadata.version = p[1];
                break;
            case "Source":
                this.map.metadata.source = p[1];
                break;
            case "Tags":
                this.map.metadata.tags = p[1].split(" ");
                break;
            case "BeatmapID":
                this.map.metadata.beatmapId = parseInt(p[1]);
                break;
            case "BeatmapSetID":
                this.map.metadata.beatmapSetId = parseInt(p[1]);
                break;
        }
    }
}
