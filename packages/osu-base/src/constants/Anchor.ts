/**
 * General enum to specify an "anchor" or "origin" point from the standard 9 points on a rectangle.
 */
export enum Anchor {
    topLeft,
    centre,
    centreLeft,
    topRight,
    bottomCentre,
    topCentre,
    /**
     * The user is manually updating the outcome, so we shouldn't.
     */
    custom,
    centreRight,
    bottomLeft,
    bottomRight,
}
