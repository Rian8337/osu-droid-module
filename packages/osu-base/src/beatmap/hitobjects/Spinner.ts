import { Vector2 } from "../../mathutil/Vector2";
import { HitObject } from "./HitObject";

/**
 * Represents a spinner in a beatmap.
 *
 * All we need from spinners is their duration. The
 * position of a spinner is always at 256x192.
 */
export class Spinner extends HitObject {
    constructor(values: { startTime: number; type: number; endTime: number }) {
        super({
            ...values,
            position: new Vector2(256, 192),
        });
    }

    override toString(): string {
        return `Position: [${this.position.x}, ${this.position.y}], duration: ${this.duration}`;
    }
}
