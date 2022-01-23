import { DifficultyHitObject } from "@rian8337/osu-difficulty-calculator";
import { DifficultyHitObject as RebalanceDifficultyHitObject } from "@rian8337/osu-rebalance-difficulty-calculator";

/**
 * Contains information about which cursor index hits a hitobject.
 */
export class IndexedHitObject {
    /**
     * The index of the cursor that hits the hitobject.
     */
    cursorIndex: number;

    /**
     * The underlying difficulty hitobject.
     */
    readonly object: DifficultyHitObject | RebalanceDifficultyHitObject;

    /**
     * @param object The underlying difficulty hitobject.
     * @param cursorIndex The index of the cursor that hits the hitobject.
     */
    constructor(object: DifficultyHitObject | RebalanceDifficultyHitObject, cursorIndex: number) {
        this.object = object;
        this.cursorIndex = cursorIndex;
    }
}
