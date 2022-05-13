import { BeatmapGeneral } from "../sections/BeatmapGeneral";
import { BeatmapBaseEncoder } from "./BeatmapBaseEncoder";

/**
 * An encoder for encoding a beatmap's general section.
 */
export class BeatmapGeneralEncoder extends BeatmapBaseEncoder {
    protected override encodeInternal(): void {
        this.writeLine("[General]");

        const general: BeatmapGeneral = this.map.general;

        if (general.audioFilename) {
            this.writeLine(`AudioFilename: ${general.audioFilename}`);
        }

        this.writeLine(`AudioLeadIn: ${general.audioLeadIn}`);
        this.writeLine(`PreviewTime: ${general.previewTime}`);
        this.writeLine(`Countdown: ${general.countdown}`);
        this.writeLine(
            `SampleSet: ${this.sampleBankToString(general.sampleBank)}`
        );
        this.writeLine(`StackLeniency: ${general.stackLeniency}`);
        this.writeLine(`Mode: ${general.mode}`);
        this.writeLine(
            `LetterboxInBreaks: ${general.letterBoxInBreaks ? 1 : 0}`
        );

        if (general.epilepsyWarning) {
            this.writeLine("EpilepsyWarning: 1");
        }

        if (general.countdownOffset > 0) {
            this.writeLine(`CountdownOffset: ${general.countdownOffset}`);
        }

        this.writeLine(
            `WidescreenStoryboard: ${general.widescreenStoryboard ? 1 : 0}`
        );

        if (general.samplesMatchPlaybackRate) {
            this.writeLine("SamplesMatchPlaybackRate: 1");
        }
    }
}
