import { Vector2 } from "@rian8337/osu-base";
import { MovementType } from "../constants/MovementType";

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
    readonly id: MovementType;

    constructor(time: number, x: number, y: number, id: MovementType) {
        this.time = time;
        this.position = new Vector2(x, y);
        this.id = id;
    }
}
