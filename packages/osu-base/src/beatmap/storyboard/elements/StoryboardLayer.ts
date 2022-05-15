import { StoryboardLayerType } from "../enums/StoryboardLayerType";
import { StoryboardElement } from "./StoryboardElement";

/**
 * Represents a storyboard's layer.
 */
export class StoryboardLayer {
    /**
     * The name of the layer.
     */
    readonly name: StoryboardLayerType;

    /**
     * The depth of the layer.
     */
    readonly depth: number;

    /**
     * Whether this storyboard layer is visible in pass state.
     */
    visibleWhenPassing: boolean;

    /**
     * Whether this storyboard layer is visible in fail state.
     */
    visibleWhenFailing: boolean;

    /**
     * The storyboard elements in this layer.
     */
    elements: StoryboardElement[] = [];

    constructor(
        name: StoryboardLayerType,
        depth: number,
        visibleWhenPassing: boolean = true,
        visibleWhenFailing: boolean = true
    ) {
        this.name = name;
        this.depth = depth;
        this.visibleWhenPassing = visibleWhenPassing;
        this.visibleWhenFailing = visibleWhenFailing;
    }
}
