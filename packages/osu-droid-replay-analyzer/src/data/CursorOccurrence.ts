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

    /**
     * Returns a string representation of this `CursorOccurrence`.
     */
    toString(): string {
        let str = `${this.time.toString()}ms `;

        switch (this.id) {
            case MovementType.Down:
                str += "Down";
                break;

            case MovementType.Up:
                str += "Up";
                break;

            case MovementType.Move:
                str += "Move";
                break;
        }

        if (this.id !== MovementType.Up) {
            str += ` (${this.position.x.toFixed(2)}, ${this.position.y.toFixed(2)})`;
        }

        return str;
    }
}
