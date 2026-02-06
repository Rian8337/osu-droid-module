import { Beatmap } from "./Beatmap";
import { Encoder } from "./Encoder";
import { BeatmapBaseEncoder } from "./encoder/beatmap/BeatmapBaseEncoder";
import { BeatmapColorEncoder } from "./encoder/beatmap/BeatmapColorEncoder";
import { BeatmapControlPointsEncoder } from "./encoder/beatmap/BeatmapControlPointsEncoder";
import { BeatmapDifficultyEncoder } from "./encoder/beatmap/BeatmapDifficultyEncoder";
import { BeatmapEditorEncoder } from "./encoder/beatmap/BeatmapEditorEncoder";
import { BeatmapEventsEncoder } from "./encoder/beatmap/BeatmapEventsEncoder";
import { BeatmapGeneralEncoder } from "./encoder/beatmap/BeatmapGeneralEncoder";
import { BeatmapHitObjectsEncoder } from "./encoder/beatmap/BeatmapHitObjectsEncoder";
import { BeatmapMetadataEncoder } from "./encoder/beatmap/BeatmapMetadataEncoder";

/**
 * A beatmap encoder.
 *
 * Note that this beatmap encoder does not encode storyboards, and as such equality with the
 * original beatmap file is not guaranteed (and usually will not be equal).
 */
export class BeatmapEncoder extends Encoder<Beatmap, BeatmapBaseEncoder> {
    protected override encoders: BeatmapBaseEncoder[] = [];

    private readonly latestVersion = 14;

    protected override encodeInternal(): void {
        this.writeLine(`osu file format v${this.latestVersion.toString()}`);

        this.writeLine();

        super.encodeInternal();
    }

    /**
     * Resets this encoder's instance.
     */
    protected override reset(): void {
        this.finalResult = "";

        this.encoders = [
            new BeatmapGeneralEncoder(this.target),
            new BeatmapEditorEncoder(this.target),
            new BeatmapMetadataEncoder(this.target),
            new BeatmapDifficultyEncoder(this.target),
            new BeatmapEventsEncoder(this.target),
            new BeatmapControlPointsEncoder(this.target),
            new BeatmapColorEncoder(this.target),
            new BeatmapHitObjectsEncoder(this.target),
        ];
    }
}
