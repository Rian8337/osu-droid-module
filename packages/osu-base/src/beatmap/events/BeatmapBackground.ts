import { Vector2 } from "../../mathutil/Vector2";

/**
 * Represents a beatmap's background.
 */
export class BeatmapBackground {
    /**
     * The location of the background image relative to the beatmap directory.
     */
    filename: string;

    /**
     * Offset in osu! pixels from the centre of the screen.
     *
     * For example, an offset of `50,100` would have the background shown 50 osu!
     * pixels to the right and 100 osu! pixels down from the centre of the screen.
     */
    offset: Vector2;

    constructor(filename: string, offset: Vector2) {
        this.filename = filename;
        this.offset = offset;
    }
}
