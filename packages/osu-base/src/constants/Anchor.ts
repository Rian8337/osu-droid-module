/**
 * General enum to specify an "anchor" or "origin" point from the standard 9 points on a rectangle.
 */
export enum Anchor {
    TopLeft = "TopLeft",
    Center = "Centre",
    CenterLeft = "CentreLeft",
    TopRight = "TopRight",
    BottomCenter = "BottomCentre",
    TopCenter = "TopCentre",
    /**
     * The user is manually updating the outcome, so we shouldn't.
     */
    Custom = "Custom",
    CenterRight = "CentreRight",
    BottomLeft = "BottomLeft",
    BottomRight = "BottomRight",
}
