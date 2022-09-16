/**
 * Represents root bounds.
 *
 * Used in the Brent root-finding algorithm.
 */
export interface RootBounds {
    /**
     * The low value of the range where the root is supposed to be. Can be expanded if needed.
     */
    lowerBound: number;

    /**
     * The high value of the range where the root is supposed to be. Can be expanded if needed.
     */
    upperBound: number;
}
