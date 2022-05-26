import { Vector2 } from "@rian8337/osu-base";
import { movementType } from "../constants/movementType";

/**
 * Represents a cursor's occurrence.
 */
export class CursorOccurrence {
    /**
     * The time of this occurrence.
     */
    readonly time: number;

    /**
     * The position of the occurrence.
     */
    readonly position: Vector2;

    /**
     * The movement ID of the occurrence.
     */
    readonly id: movementType;

    constructor(time: number, x: number, y: number, id: movementType) {
        this.time = time;
        this.position = new Vector2(x, y);
        this.id = id;
    }
}
