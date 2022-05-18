/**
 * General enum to specify an "anchor" or "origin" point from the standard 9 points on a rectangle.
 */
export enum Anchor {
    topLeft = "TopLeft",
    center = "Centre",
    centerLeft = "CentreLeft",
    topRight = "TopRight",
    bottomCenter = "BottomCentre",
    topCenter = "TopCentre",
    /**
     * The user is manually updating the outcome, so we shouldn't.
     */
    custom = "Custom",
    centerRight = "CentreRight",
    bottomLeft = "BottomLeft",
    bottomRight = "BottomRight",
}
