import { Beatmap } from "../../Beatmap";
import { SectionDecoder } from "../SectionDecoder";

/**
 * A decoder for decoding a beatmap's metadata section.
 */
export class BeatmapMetadataDecoder extends SectionDecoder<Beatmap> {
    protected override decodeInternal(line: string): void {
        const p: string[] = this.property(line);

        switch (p[0]) {
            case "Title":
                this.target.metadata.title = p[1];
                break;
            case "TitleUnicode":
                this.target.metadata.titleUnicode = p[1];
                break;
            case "Artist":
                this.target.metadata.artist = p[1];
                break;
            case "ArtistUnicode":
                this.target.metadata.artistUnicode = p[1];
                break;
            case "Creator":
                this.target.metadata.creator = p[1];
                break;
            case "Version":
                this.target.metadata.version = p[1];
                break;
            case "Source":
                this.target.metadata.source = p[1];
                break;
            case "Tags":
                this.target.metadata.tags = p[1].split(" ");
                break;
            case "BeatmapID":
                this.target.metadata.beatmapId = parseInt(p[1]);
                break;
            case "BeatmapSetID":
                this.target.metadata.beatmapSetId = parseInt(p[1]);
                break;
        }
    }
}
