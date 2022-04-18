/**
 * Contains difficulty settings of a beatmap.
 */
export class BeatmapDifficulty {
    /**
     * The approach rate of the beatmap.
     */
    ar?: number;

    /**
     * The circle size of the beatmap.
     */
    cs: number = 5;

    /**
     * The overall difficulty of the beatmap.
     */
    od: number = 5;

    /**
     * The health drain rate of the beatmap.
     */
    hp: number = 5;

    /**
     * The base slider velocity in hundreds of osu! pixels per beat.
     */
    sliderMultiplier: number = 1;

    /**
     * The amount of slider ticks per beat.
     */
    sliderTickRate: number = 1;
}
