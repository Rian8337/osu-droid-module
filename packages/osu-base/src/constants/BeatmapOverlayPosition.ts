/**
 * Represents the draw order of hit circle overlays compared to hit numbers.
 *
 * - `noChange` = use skin setting
 * - `below` = draw overlays under numbers
 * - `above` = draw overlays on top of numbers
 */
export enum BeatmapOverlayPosition {
    noChange = "NoChange",
    below = "Below",
    above = "Above",
}
