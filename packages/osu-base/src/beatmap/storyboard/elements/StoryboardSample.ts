import { StoryboardElement } from "./StoryboardElement";

/**
 * Represents a storyboard sample.
 */
export class StoryboardSample extends StoryboardElement {
    private _startTime: number;

    get startTime(): number {
        return this._startTime;
    }

    /**
     * The volume at which the sample is played.
     */
    readonly volume: number;

    constructor(path: string, time: number, volume: number) {
        super(path);

        this._startTime = time;
        this.volume = volume;
    }
}
