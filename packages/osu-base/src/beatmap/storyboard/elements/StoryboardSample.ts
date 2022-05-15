import { StoryboardElement } from "./StoryboardElement";

/**
 * Represents a storyboard sample.
 */
export class StoryboardSample extends StoryboardElement {
    #startTime: number;

    get startTime(): number {
        return this.#startTime;
    }

    /**
     * The volume at which the sample is played.
     */
    readonly volume: number;

    constructor(path: string, time: number, volume: number) {
        super(path);

        this.#startTime = time;
        this.volume = volume;
    }
}
