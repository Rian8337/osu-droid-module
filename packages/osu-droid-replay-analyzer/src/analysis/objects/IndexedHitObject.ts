import { DifficultyHitObject } from "@rian8337/osu-difficulty-calculator";
import { DifficultyHitObject as RebalanceDifficultyHitObject } from "@rian8337/osu-rebalance-difficulty-calculator";

/**
 * Contains information about which cursor index hits a hitobject.
 */
export class IndexedHitObject {
    /**
     * The cursor index that hits the hitobject.
     *
     * If -1, the detection was unable to find any cursor that attempted to hit
     * the hitobject or it did not meet the criteria for detection.
     */
    cursorIndex: number;

    /**
     * The angle of the movement of the cursor towards the next hitobject.
     */
    angle: number | null;

    /**
     * If this is a slider, whether the slider was cheesed.
     */
    sliderCheesed: boolean = false;

    /**
     * The underlying difficulty hitobject.
     */
    readonly object: DifficultyHitObject | RebalanceDifficultyHitObject;

    /**
     * Whether the hitobject was most likely two-handed.
     */
    get is2Handed(): boolean {
        return this.angle !== null && this.angle >= Math.PI / 6;
    }

    /**
     * @param object The underlying difficulty hitobject.
     * @param cursorIndex The cursor index that moves towards the hitobject.
     * @param angle The angle of the movement of the cursor that moves towards the hitobject.
     */
    constructor(
        object: DifficultyHitObject | RebalanceDifficultyHitObject,
        cursorIndex: number,
        angle: number | null
    ) {
        this.object = object;
        this.cursorIndex = cursorIndex;
        this.angle = angle;
    }
}
