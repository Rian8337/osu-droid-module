import { Encoder } from "./Encoder";
import { StoryboardBaseEncoder } from "./encoder/storyboard/StoryboardBaseEncoder";
import { StoryboardEventsEncoder } from "./encoder/storyboard/StoryboardEventsEncoder";
import { StoryboardVariablesEncoder } from "./encoder/storyboard/StoryboardVariablesEncoder";
import { Storyboard } from "./Storyboard";

/**
 * A storyboard encoder.
 *
 * Note that this storyboard encoder does not encode storyboards, and as such equality with the
 * original beatmap or storyboard file is not guaranteed (and usually will not be equal).
 */
export class StoryboardEncoder extends Encoder<
    Storyboard,
    StoryboardBaseEncoder
> {
    protected override finalResult = "";
    protected override encoders: StoryboardBaseEncoder[] = [];

    private readonly encodeSections: boolean;

    constructor(target: Storyboard, encodeSections = true) {
        super(target);

        this.encodeSections = encodeSections;
    }

    protected override reset(): void {
        this.finalResult = "";

        this.encoders = [
            // The variable decoder is put first as variables need to be on top of a .osb file.
            new StoryboardVariablesEncoder(this.target, this.encodeSections),
            new StoryboardEventsEncoder(this.target, this.encodeSections),
        ];
    }
}
