import { HitObject } from "./HitObject";

/**
 * Represents a circle in a beatmap.
 *
 * All we need from circles is their position. All positions
 * stored in the objects are in playfield coordinates (512*384
 * rectangle).
 */
export class Circle extends HitObject {
    override toString(): string {
        return `Position: [${this.position.x.toString()}, ${this.position.y.toString()}]`;
    }
}
