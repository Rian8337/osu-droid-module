import { StoryboardLayerType } from "./storyboard/enums/StoryboardLayerType";
import { StoryboardLayer } from "./storyboard/elements/StoryboardLayer";

/**
 * Represents a storyboard.
 */
export class Storyboard {
    /**
     * The layers in the storyboard.
     */
    readonly layers: Partial<Record<StoryboardLayerType, StoryboardLayer>> = {
        Background: new StoryboardLayer(StoryboardLayerType.background, 3),
        Fail: new StoryboardLayer(StoryboardLayerType.fail, 2, false),
        Pass: new StoryboardLayer(StoryboardLayerType.pass, 1, true, false),
        Foreground: new StoryboardLayer(StoryboardLayerType.foreground, 0),
        Overlay: new StoryboardLayer(
            StoryboardLayerType.overlay,
            Number.MIN_SAFE_INTEGER
        ),
    };

    /**
     * Whether the storyboard can fall back to skin sprites in case no matching storyboard sprites are found.
     */
    useSkinSprites: boolean = false;

    /**
     * The variables of the storyboard.
     */
    variables: Record<string, string> = {};

    /**
     * The depth of the currently front-most storyboard layer, excluding the overlay layer.
     */
    private minimumLayerDepth: number = 0;

    /**
     * Across all layers, find the earliest point in time that a storyboard element exists at.
     * Will return `null` if there are no elements.
     *
     * This iterates all elements and as such should be used sparingly or stored locally.
     */
    get earliestEventTime(): number | null {
        return (
            Object.values(this.layers)
                .map((v) => v.elements)
                .flat()
                .sort((a, b) => a.startTime - b.startTime)[0]?.startTime ?? null
        );
    }

    /**
     * Across all layers, find the latest point in time that a storyboard element exists at.
     * Will return `null` if there are no elements.
     *
     * This iterates all elements and as such should be used sparingly or stored locally.
     * Samples return start time as their end time.
     */
    get latestEventTime(): number | null {
        return (
            Object.values(this.layers)
                .map((v) => v.elements)
                .flat()
                .sort((a, b) => b.endTime - a.endTime)[0]?.endTime ?? null
        );
    }

    /**
     * Gets a layer of the storyboard.
     *
     * @param type The layer type.
     * @returns The storyboard layer.
     */
    getLayer(type: StoryboardLayerType): StoryboardLayer {
        let layer: StoryboardLayer | undefined = this.layers[type];

        if (!layer) {
            layer = new StoryboardLayer(type, --this.minimumLayerDepth);

            this.layers[type] = layer;
        }

        return layer;
    }
}
