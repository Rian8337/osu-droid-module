import { PlaceableHitObject, Vector2 } from "@rian8337/osu-base";

/**
 * Contains information about which cursor index hits a hitobject.
 */
export class IndexedHitObject {
    /**
     * The position of the cursor at the end of this hitobject.
     *
     * Will be altered during detection.
     */
    endCursorPosition: Vector2;

    constructor(
        /**
         * The underlying hitobject.
         */
        readonly object: PlaceableHitObject,

        /**
         * The cursor index that moves towards the hitobject.
         */
        readonly cursorIndex: number,

        /**
         * The group index of the cursor within the cursor index that hits the hitobject.
         */
        readonly groupIndex: number,

        /**
         * The occurrence index within the group of the cursor within the cursor index that hits the hitobject.
         */
        readonly occurrenceIndex: number,

        /**
         * The angle of the movement of the cursor that moves towards the hitobject.
         */
        readonly angle: number | null,

        /**
         * Whether the hitobject is likely two-handed.
         */
        readonly is2Handed: boolean,
    ) {
        this.object = object;
        this.cursorIndex = cursorIndex;
        this.groupIndex = groupIndex;
        this.occurrenceIndex = occurrenceIndex;
        this.angle = angle;
        this.is2Handed = is2Handed;
        this.endCursorPosition = this.object.stackedEndPosition;
    }
}
