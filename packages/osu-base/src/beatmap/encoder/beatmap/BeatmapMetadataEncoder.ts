import { BeatmapBaseEncoder } from "./BeatmapBaseEncoder";

/**
 * An encoder for encoding a beatmap's metadata section.
 */
export class BeatmapMetadataEncoder extends BeatmapBaseEncoder {
    protected override encodeInternal(): void {
        if (this.encodeSections) {
            this.writeLine("[Metadata]");
        }

        const { metadata } = this.map;

        this.writeLine(`Title: ${metadata.title}`);

        if (metadata.titleUnicode) {
            this.writeLine(`TitleUnicode: ${metadata.titleUnicode}`);
        }

        this.writeLine(`Artist: ${metadata.artist}`);

        if (metadata.artistUnicode) {
            this.writeLine(`ArtistUnicode: ${metadata.artistUnicode}`);
        }

        this.writeLine(`Creator: ${metadata.creator}`);
        this.writeLine(`Version: ${metadata.version}`);

        if (metadata.source) {
            this.writeLine(`Source: ${metadata.source}`);
        }

        if (metadata.tags.length > 0) {
            this.writeLine(`Tags: ${metadata.tags.join(" ")}`);
        }

        if ((metadata.beatmapId ?? -1) > 0) {
            this.writeLine(`BeatmapID: ${metadata.beatmapId}`);
        }

        if ((metadata.beatmapSetId ?? -1) > 0) {
            this.writeLine(`BeatmapSetID: ${metadata.beatmapSetId}`);
        }
    }
}
