import { BeatmapCountdown } from "../../constants/BeatmapCountdown";
import { BeatmapOverlayPosition } from "../../constants/BeatmapOverlayPosition";
import { GameMode } from "../../constants/GameMode";
import { SampleBank } from "../../constants/SampleBank";
import { BeatmapBaseDecoder } from "./BeatmapBaseDecoder";

/**
 * A decoder for decoding a beatmap's general section.
 */
export class BeatmapGeneralDecoder extends BeatmapBaseDecoder {
    override decode(line: string): void {
        const p: string[] = this.property(line);

        switch (p[0]) {
            case "AudioFilename":
                this.map.general.audioFilename = p[1];
                break;
            case "AudioLeadIn":
                this.map.general.audioLeadIn = this.tryParseInt(p[1]);
                break;
            case "PreviewTime":
                this.map.general.previewTime = this.tryParseInt(p[1]);
                break;
            case "Countdown":
                this.map.general.countdown = <BeatmapCountdown>(
                    this.tryParseInt(p[1])
                );
                break;
            case "SampleSet":
                switch (p[1]) {
                    case "Normal":
                        this.map.general.sampleBank = SampleBank.normal;
                        break;
                    case "Soft":
                        this.map.general.sampleBank = SampleBank.soft;
                        break;
                    case "Drum":
                        this.map.general.sampleBank = SampleBank.drum;
                        break;
                }
                break;
            case "SampleVolume":
                this.map.general.sampleVolume = this.tryParseInt(p[1]);
                break;
            case "StackLeniency":
                this.map.general.stackLeniency = this.tryParseFloat(p[1]);
                break;
            case "Mode":
                this.map.general.mode = <GameMode>this.tryParseInt(p[1]);
                break;
            case "LetterboxInBreaks":
                this.map.general.letterBoxInBreaks = !!this.tryParseInt(p[1]);
                break;
            case "UseSkinSprites":
                this.map.general.useSkinSprites = !!this.tryParseInt(p[1]);
                break;
            case "OverlayPosition":
                this.map.general.overlayPosition = <BeatmapOverlayPosition>p[1];
                break;
            case "SkinPreference":
                this.map.general.skinPreference = p[1] ?? "";
                break;
            case "EpilepsyWarning":
                this.map.general.epilepsyWarning = !!this.tryParseInt(p[1]);
                break;
            case "CountdownOffset":
                this.map.general.countdownOffset = this.tryParseInt(
                    p[1] || "0"
                );
                break;
            case "WidescreenStoryboard":
                this.map.general.widescreenStoryboard = !!this.tryParseInt(
                    p[1]
                );
                break;
            case "SamplesMatchPlaybackRate":
                this.map.general.samplesMatchPlaybackRate = !!this.tryParseInt(
                    p[1]
                );
                break;
            case "EditorBookmarks":
                // This somehow makes it in v5 (https://osu.ppy.sh/beatmapsets/2459#osu/19753)
                this.map.editor.bookmarks = p[1]
                    .split(",")
                    .map((v) => this.tryParseInt(v));
        }
    }
}
