/**
 * Determines how color blending should be done.
 */
export enum BlendingEquation {
    /**
     * Inherits from parent.
     */
    inherit,

    /**
     * Adds the source and destination colours.
     */
    add,

    /**
     * Chooses the minimum of each component of the source and destination colours.
     */
    min,

    /**
     * Chooses the maximum of each component of the source and destination colours.
     */
    max,

    /**
     * Subtracts the destination colour from the source colour.
     */
    subtract,

    /**
     * Subtracts the source colour from the destination colour.
     */
    reverseSubtract,
}
