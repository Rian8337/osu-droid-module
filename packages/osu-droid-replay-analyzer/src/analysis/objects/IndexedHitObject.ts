import { Modes, Vector2 } from "@rian8337/osu-base";
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
     * The group index of the cursor within the cursor index that hits the hitobject.
     *
     * If -1, the detection was unable to find any cursor that attempted to hit
     * the hitobject or it did not meet the criteria for detection.
     */
    groupIndex: number;

    /**
     * The occurrence index within the group of the cursor within the cursor index that hits the hitobject.
     *
     * If -1, the detection was unable to find any cursor that attempted to hit
     * the hitobject or it did not meet the criteria for detection.
     */
    occurrenceIndex: number;

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
     * The position of the cursor at the end of this hitobject.
     * 
     * Will be altered during detection.
     */
    endCursorPosition: Vector2;

    /**
     * Whether the hitobject is likely two-handed.
     */
    is2Handed: boolean;

    /**
     * @param object The underlying difficulty hitobject.
     * @param cursorIndex The cursor index that moves towards the hitobject.
     * @param groupIndex The group index of the cursor within the cursor index that hits the hitobject.
     * @param occurrenceIndex The occurrence index within the group of the cursor within the cursor index that hits the hitobject.
     * @param angle The angle of the movement of the cursor that moves towards the hitobject.
     */
    constructor(
        object: DifficultyHitObject | RebalanceDifficultyHitObject,
        cursorIndex: number,
        groupIndex: number,
        occurrenceIndex: number,
        angle: number | null,
        is2Handed: boolean
    ) {
        this.object = object;
        this.cursorIndex = cursorIndex;
        this.groupIndex = groupIndex;
        this.occurrenceIndex = occurrenceIndex;
        this.angle = angle;
        this.is2Handed = is2Handed;
        this.endCursorPosition = this.object.object.getStackedEndPosition(Modes.droid);
    }
}
