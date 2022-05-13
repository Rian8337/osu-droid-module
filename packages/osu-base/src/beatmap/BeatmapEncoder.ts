import { Beatmap } from "./Beatmap";
import { BeatmapBaseEncoder } from "./encoder/BeatmapBaseEncoder";
import { BeatmapColorEncoder } from "./encoder/BeatmapColorEncoder";
import { BeatmapControlPointsEncoder } from "./encoder/BeatmapControlPointsEncoder";
import { BeatmapDifficultyEncoder } from "./encoder/BeatmapDifficultyEncoder";
import { BeatmapEditorEncoder } from "./encoder/BeatmapEditorEncoder";
import { BeatmapEventsEncoder } from "./encoder/BeatmapEventsEncoder";
import { BeatmapGeneralEncoder } from "./encoder/BeatmapGeneralEncoder";
import { BeatmapHitObjectsEncoder } from "./encoder/BeatmapHitObjectsEncoder";
import { BeatmapMetadataEncoder } from "./encoder/BeatmapMetadataEncoder";

/**
 * A beatmap encoder.
 *
 * Note that this beatmap encoder does not encode storyboards, and as such equality with the
 * original beatmap file is not guaranteed (and usually will not be equal).
 */
export class BeatmapEncoder {
    /**
     * The beatmap to encode.
     */
    map: Beatmap;

    /**
     * Available per-section encoders.
     */
    private encoders: BeatmapBaseEncoder[] = [];

    private readonly latestVersion: number = 14;

    private encodedText: string = "";

    constructor(map: Beatmap) {
        this.map = map;

        this.reset();
    }

    /**
     * Encodes the beatmap.
     *
     * Keep in mind that this will not produce the exact same file as the original beatmap.
     */
    encode(): string {
        this.reset();

        this.writeLine(`osu file format v${this.latestVersion}`);

        this.writeLine();

        for (const encoder of this.encoders) {
            this.writeLine(encoder.encode());
        }

        return this.encodedText;
    }

    /**
     * Writes a line to encoded text.
     *
     * @param line The line to write.
     */
    private writeLine(line: string = ""): void {
        this.encodedText += line + "\n";
    }

    /**
     * Resets this encoder's instance.
     */
    private reset(): void {
        this.encodedText = "";

        this.encoders = [
            new BeatmapGeneralEncoder(this.map),
            new BeatmapEditorEncoder(this.map),
            new BeatmapMetadataEncoder(this.map),
            new BeatmapDifficultyEncoder(this.map),
            new BeatmapEventsEncoder(this.map),
            new BeatmapControlPointsEncoder(this.map),
            new BeatmapColorEncoder(this.map),
            new BeatmapHitObjectsEncoder(this.map),
        ];
    }
}
