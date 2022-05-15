/**
 * Represents a storyboard element.
 */
export abstract class StoryboardElement {
    /**
     * The file path to the content of the element.
     */
    readonly path: string;

    /**
     * The time at which the element starts.
     */
    abstract get startTime(): number;

    /**
     * The time at which the element ends.
     */
    get endTime(): number {
        return this.startTime;
    }

    /**
     * The duration of the storyboard element.
     */
    get duration(): number {
        return this.endTime - this.startTime;
    }

    constructor(path: string) {
        this.path = path;
    }
}
