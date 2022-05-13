import { RGBColor } from "../../utils/RGBColor";

/**
 * Contains information about combo and skin colors of a beatmap.
 */
export class BeatmapColor {
    /**
     * The combo colors of the beatmap.
     */
    readonly combo: RGBColor[] = [];

    /**
     * Additive slider track color.
     */
    sliderTrackOverride?: RGBColor;

    /**
     * The color of slider borders.
     */
    sliderBorder?: RGBColor;
}
