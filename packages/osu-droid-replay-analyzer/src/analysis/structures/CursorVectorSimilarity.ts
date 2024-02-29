import { Vector2 } from "@rian8337/osu-base";

/**
 * Used to store cursor informations that are placed in a relatively same position.
 */
export interface CursorVectorSimilarity {
    lastPosition: Vector2;
    count: number;
    lastTime: number;
}
