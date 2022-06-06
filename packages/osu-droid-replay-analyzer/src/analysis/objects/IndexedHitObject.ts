import { DifficultyHitObject } from "@rian8337/osu-difficulty-calculator";
import { DifficultyHitObject as RebalanceDifficultyHitObject } from "@rian8337/osu-rebalance-difficulty-calculator";

/**
 * Contains information about which cursor index hits a hitobject.
 */
export class IndexedHitObject {
    /**
     * The accepted index of the cursor that hits the hitobject.
     */
    acceptedCursorIndex: number;

    /**
     * The actual index of the cursor that hits the hitobject.
     */
    actualCursorIndex: number;

    /**
     * The occurrence index of the cursor that hits the hitobject.
     */
    occurrenceIndex: number;

    /**
     * If this is a slider, whether the slider was cheesed.
     */
    sliderCheesed: boolean = false;

    /**
     * The underlying difficulty hitobject.
     */
    readonly object: DifficultyHitObject | RebalanceDifficultyHitObject;

    /**
     * @param object The underlying difficulty hitobject.
     * @param acceptedCursorIndex The accepted index of the cursor that hits the hitobject.
     * @param actualCursorIndex The actual index of the cursor that hits the hitobject.
     * @param occurrenceIndex The occurrence index of the cursor that hits the hitobject.
     */
    constructor(
        object: DifficultyHitObject | RebalanceDifficultyHitObject,
        acceptedCursorIndex: number,
        actualCursorIndex: number,
        occurrenceIndex: number
    ) {
        this.object = object;
        this.acceptedCursorIndex = acceptedCursorIndex;
        this.actualCursorIndex = actualCursorIndex;
        this.occurrenceIndex = occurrenceIndex;
    }
}
