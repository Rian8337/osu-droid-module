import { Storyboard } from "../../Storyboard";
import { BaseEncoder } from "../SectionEncoder";

/**
 * The base of per-section storyboard encoders.
 */
export abstract class StoryboardBaseEncoder extends BaseEncoder {
    /**
     * The storyboard that is being encoded.
     */
    readonly storyboard: Storyboard;

    constructor(storyboard: Storyboard, encodeSections: boolean = true) {
        super(encodeSections);

        this.storyboard = storyboard;
    }
}
