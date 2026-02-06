import { BeatmapBaseEncoder } from "./BeatmapBaseEncoder";

/**
 * An encoder for encoding a beatmap's general section.
 */
export class BeatmapGeneralEncoder extends BeatmapBaseEncoder {
    protected override encodeInternal(): void {
        if (this.encodeSections) {
            this.writeLine("[General]");
        }

        const { general } = this.map;

        if (general.audioFilename) {
            this.writeLine(`AudioFilename: ${general.audioFilename}`);
        }

        this.writeLine(`AudioLeadIn: ${general.audioLeadIn.toString()}`);
        this.writeLine(`PreviewTime: ${general.previewTime.toString()}`);
        this.writeLine(`Countdown: ${general.countdown.toString()}`);
        this.writeLine(
            `SampleSet: ${this.sampleBankToString(general.sampleBank)}`,
        );
        this.writeLine(`StackLeniency: ${general.stackLeniency.toString()}`);
        this.writeLine(`Mode: ${general.mode.toString()}`);
        this.writeLine(
            `LetterboxInBreaks: ${general.letterBoxInBreaks ? "1" : "0"}`,
        );

        if (general.epilepsyWarning) {
            this.writeLine("EpilepsyWarning: 1");
        }

        if (general.countdownOffset > 0) {
            this.writeLine(
                `CountdownOffset: ${general.countdownOffset.toString()}`,
            );
        }

        this.writeLine(
            `WidescreenStoryboard: ${general.widescreenStoryboard ? "1" : "0"}`,
        );

        if (general.samplesMatchPlaybackRate) {
            this.writeLine("SamplesMatchPlaybackRate: 1");
        }
    }
}
