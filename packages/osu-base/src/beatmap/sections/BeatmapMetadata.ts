/**
 * Contains information used to identify a beatmap.
 */
export class BeatmapMetadata {
    /**
     * The romanized song title of the beatmap.
     */
    title: string = "";

    /**
     * The song title of the beatmap.
     */
    titleUnicode: string = "";

    /**
     * The romanized artist of the song of the beatmap.
     */
    artist: string = "";

    /**
     * The song artist of the beatmap.
     */
    artistUnicode: string = "";

    /**
     * The creator of the beatmap.
     */
    creator: string = "";

    /**
     * The difficulty name of the beatmap.
     */
    version: string = "";

    /**
     * The original media the song was produced for.
     */
    source: string = "";

    /**
     * The search terms of the beatmap.
     */
    tags: string[] = [];

    /**
     * The ID of the beatmap.
     */
    beatmapId?: number;

    /**
     * The ID of the beatmapset containing this beatmap.
     */
    beatmapSetId?: number;

    /**
     * The full title of the beatmap, which is `Artist - Title (Creator) [Difficulty Name]`.
     */
    get fullTitle(): string {
        return `${this.artist} - ${this.title} (${this.creator}) [${this.version}]`;
    }

    /**
     * The full unicode title of the beatmap, which is `Artist - Title (Creator) [Difficulty Name]`.
     *
     * Will fallback to original artist and title if needed.
     */
    get fullUnicodeTitle(): string {
        return `${this.artistUnicode || this.artist} - ${
            this.titleUnicode || this.title
        } (${this.creator}) [${this.version}]`;
    }
}
