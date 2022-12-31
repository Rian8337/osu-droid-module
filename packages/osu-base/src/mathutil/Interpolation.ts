/**
 * Holds interpolation methods for numbers.
 */
export abstract class Interpolation {
    /**
     * Performs a linear interpolation.
     *
     * @param start The starting point of the interpolation.
     * @param final The final point of the interpolation.
     * @param amount The interpolation multiplier.
     * @returns The interpolated value.
     */
    static lerp(start: number, final: number, amount: number): number {
        return start + (final - start) * amount;
    }
}
