/**
 * Represents the draw order of hit circle overlays compared to hit numbers.
 *
 * - `NoChange` = use skin setting
 * - `Below` = draw overlays under numbers
 * - `Above` = draw overlays on top of numbers
 */
export enum BeatmapOverlayPosition {
    NoChange = "NoChange",
    Below = "Below",
    Above = "Above",
}
