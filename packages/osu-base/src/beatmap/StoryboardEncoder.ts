import { Encoder } from "./Encoder";
import { StoryboardBaseEncoder } from "./encoder/storyboard/StoryboardBaseEncoder";
import { StoryboardEventsEncoder } from "./encoder/storyboard/StoryboardEventsEncoder";
import { StoryboardVariablesEncoder } from "./encoder/storyboard/StoryboardVariablesEncoder";
import { Storyboard } from "./Storyboard";

export class StoryboardEncoder extends Encoder<
    Storyboard,
    StoryboardBaseEncoder
> {
    protected override finalResult: string = "";
    protected override encoders: StoryboardBaseEncoder[] = [];

    private readonly encodeSections: boolean;

    constructor(target: Storyboard, encodeSections: boolean = true) {
        super(target);

        this.encodeSections = encodeSections;
    }

    protected override reset(): void {
        this.finalResult = "";

        this.encoders = [
            // The variable decoder is put first as variable need to be on top of a .osb file.
            new StoryboardVariablesEncoder(this.target, this.encodeSections),
            new StoryboardEventsEncoder(this.target, this.encodeSections),
        ];
    }
}
