import { Vector2 } from "./Vector2";

/**
 * Holds interpolation methods for numbers and vectors.
 */
export abstract class Interpolation {
    /**
     * Performs a linear interpolation of numbers.
     *
     * @param start The starting point of the interpolation.
     * @param final The final point of the interpolation.
     * @param amount The interpolation multiplier.
     * @returns The interpolated value.
     */
    static lerp(start: number, final: number, amount: number): number;

    /**
     * Performs a linear interpolation of vectors.
     *
     * @param start The starting point of the interpolation.
     * @param final The final point of the interpolation.
     * @param amount The interpolation multiplier.
     * @returns The interpolated vector.
     */
    static lerp(start: Vector2, final: Vector2, amount: number): Vector2;

    static lerp(
        start: number | Vector2,
        final: number | Vector2,
        amount: number,
    ): number | Vector2 {
        if (start instanceof Vector2 && final instanceof Vector2) {
            return new Vector2(
                this.lerp(start.x, final.x, amount),
                this.lerp(start.y, final.y, amount),
            );
        } else {
            return (
                (start as number) +
                ((final as number) - (start as number)) * amount
            );
        }
    }
}
