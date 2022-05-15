import { BeatmapCountdown } from "../../../constants/BeatmapCountdown";
import { BeatmapOverlayPosition } from "../../../constants/BeatmapOverlayPosition";
import { GameMode } from "../../../constants/GameMode";
import { SampleBank } from "../../../constants/SampleBank";
import { Beatmap } from "../../Beatmap";
import { SectionDecoder } from "../SectionDecoder";

/**
 * A decoder for decoding a beatmap's general section.
 */
export class BeatmapGeneralDecoder extends SectionDecoder<Beatmap> {
    protected override decodeInternal(line: string): void {
        const p: string[] = this.property(line);

        switch (p[0]) {
            case "AudioFilename":
                this.target.general.audioFilename = p[1];
                break;
            case "AudioLeadIn":
                this.target.general.audioLeadIn = this.tryParseInt(p[1]);
                break;
            case "PreviewTime":
                this.target.general.previewTime = this.tryParseInt(p[1]);
                break;
            case "Countdown":
                this.target.general.countdown = <BeatmapCountdown>(
                    this.tryParseInt(p[1])
                );
                break;
            case "SampleSet":
                switch (p[1]) {
                    case "Normal":
                        this.target.general.sampleBank = SampleBank.normal;
                        break;
                    case "Soft":
                        this.target.general.sampleBank = SampleBank.soft;
                        break;
                    case "Drum":
                        this.target.general.sampleBank = SampleBank.drum;
                        break;
                }
                break;
            case "SampleVolume":
                this.target.general.sampleVolume = this.tryParseInt(p[1]);
                break;
            case "StackLeniency":
                this.target.general.stackLeniency = this.tryParseFloat(p[1]);
                break;
            case "Mode":
                this.target.general.mode = <GameMode>this.tryParseInt(p[1]);
                break;
            case "LetterboxInBreaks":
                this.target.general.letterBoxInBreaks = !!this.tryParseInt(
                    p[1]
                );
                break;
            case "UseSkinSprites":
                this.target.general.useSkinSprites = !!this.tryParseInt(p[1]);
                break;
            case "OverlayPosition":
                this.target.general.overlayPosition = <BeatmapOverlayPosition>(
                    p[1]
                );
                break;
            case "SkinPreference":
                this.target.general.skinPreference = p[1] ?? "";
                break;
            case "EpilepsyWarning":
                this.target.general.epilepsyWarning = !!this.tryParseInt(p[1]);
                break;
            case "CountdownOffset":
                this.target.general.countdownOffset = this.tryParseInt(
                    p[1] || "0"
                );
                break;
            case "WidescreenStoryboard":
                this.target.general.widescreenStoryboard = !!this.tryParseInt(
                    p[1]
                );
                break;
            case "SamplesMatchPlaybackRate":
                this.target.general.samplesMatchPlaybackRate =
                    !!this.tryParseInt(p[1]);
                break;
            case "EditorBookmarks":
                // This somehow makes it in v5 (https://osu.ppy.sh/beatmapsets/2459#osu/19753)
                this.target.editor.bookmarks = p[1]
                    .split(",")
                    .map((v) => this.tryParseInt(v));
        }
    }
}
