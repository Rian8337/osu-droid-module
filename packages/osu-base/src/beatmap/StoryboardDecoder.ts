import { BeatmapSection } from "../constants/BeatmapSection";
import { Decoder } from "./Decoder";
import { SectionDecoder } from "./decoder/SectionDecoder";
import { StoryboardEventsDecoder } from "./decoder/storyboard/StoryboardEventsDecoder";
import { StoryboardGeneralDecoder } from "./decoder/storyboard/StoryboardGeneralDecoder";
import { StoryboardVariablesDecoder } from "./decoder/storyboard/StoryboardVariablesDecoder";
import { Storyboard } from "./Storyboard";

/**
 * A storyboard decoder.
 */
export class StoryboardDecoder extends Decoder<
    Storyboard,
    SectionDecoder<Storyboard>
> {
    protected override finalResult: Storyboard = new Storyboard();
    protected override decoders: Partial<
        Record<BeatmapSection, SectionDecoder<Storyboard>>
    > = {};

    constructor(formatVersion: number = Decoder.latestVersion) {
        super();

        this.formatVersion = formatVersion;
    }

    protected override reset(): void {
        super.reset();

        this.finalResult = new Storyboard();

        this.decoders = {
            General: new StoryboardGeneralDecoder(
                this.finalResult,
                this.formatVersion
            ),
            Events: new StoryboardEventsDecoder(
                this.finalResult,
                this.formatVersion
            ),
            Variables: new StoryboardVariablesDecoder(
                this.finalResult,
                this.formatVersion
            ),
        };
    }
}
