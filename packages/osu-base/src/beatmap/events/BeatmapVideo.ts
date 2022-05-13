import { Vector2 } from "../../mathutil/Vector2";

/**
 * Represents a beatmap's video.
 */
export class BeatmapVideo {
    /**
     * The location of the video relative to the beatmap directory.
     */
    filename: string;

    /**
     * The start time of the video, in milliseconds from the beginning of the beatmap's audio.
     */
    startTime: number;

    /**
     * Offset in osu! pixels from the centre of the screen.
     *
     * For example, an offset of `50,100` would have the video shown 50 osu! pixels
     * to the right and 100 osu! pixels down from the centre of the screen.
     */
    offset: Vector2;

    constructor(startTime: number, filename: string, offset: Vector2) {
        this.startTime = startTime;
        this.filename = filename;
        this.offset = offset;
    }
}
