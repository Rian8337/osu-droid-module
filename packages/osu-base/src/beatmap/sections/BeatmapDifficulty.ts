/**
 * Contains difficulty settings of a beatmap.
 */
export class BeatmapDifficulty {
    /**
     * The approach rate of the beatmap.
     */
    private _ar?: number;

    /**
     * The approach rate of the beatmap.
     */
    get ar(): number {
        return this._ar ?? this.od;
    }

    /**
     * The approach rate of the beatmap.
     */
    set ar(value: number) {
        this._ar = value;
    }

    /**
     * The circle size of the beatmap.
     */
    cs = 5;

    /**
     * The overall difficulty of the beatmap.
     */
    od = 5;

    /**
     * The health drain rate of the beatmap.
     */
    hp = 5;

    /**
     * The base slider velocity in hundreds of osu! pixels per beat.
     */
    sliderMultiplier = 1;

    /**
     * The amount of slider ticks per beat.
     */
    sliderTickRate = 1;

    /**
     * Maps a difficulty value [0, 10] to a two-piece linear range of values.
     *
     * @param difficulty The difficulty value to be mapped.
     * @param min Minimum of the resulting range which will be achieved by a difficulty value of 0.
     * @param mid Midpoint of the resulting range which will be achieved by a difficulty value of 5.
     * @param max Maximum of the resulting range which will be achieved by a difficulty value of 10.
     * @returns The value to which the difficulty value maps in the specified range.
     */
    static difficultyRange(
        difficulty: number,
        min: number,
        mid: number,
        max: number,
    ): number {
        switch (true) {
            case difficulty > 5:
                return mid + ((max - mid) * (difficulty - 5)) / 5;

            case difficulty < 5:
                return mid + ((mid - min) * (difficulty - 5)) / 5;

            default:
                return mid;
        }
    }

    /**
     * Maps a difficulty value [0, 10] to a two-piece linear range of values. Floors the value to an integer,
     * usually to match osu!stable specifications.
     *
     * @param difficulty The difficulty value to be mapped.
     * @param min Minimum of the resulting range which will be achieved by a difficulty value of 0.
     * @param mid Midpoint of the resulting range which will be achieved by a difficulty value of 5.
     * @param max Maximum of the resulting range which will be achieved by a difficulty value of 10.
     * @returns The value to which the difficulty value maps in the specified range.
     */
    static difficultyRangeInt(
        difficulty: number,
        min: number,
        mid: number,
        max: number,
    ): number {
        return Math.trunc(
            BeatmapDifficulty.difficultyRange(difficulty, min, mid, max),
        );
    }

    /**
     * Inverse function to `difficultyRange`. Maps a value returned by the function back to the
     * difficulty that produced it.
     *
     * @param difficultyValue The difficulty-dependent value to be unmapped.
     * @param diff0 Minimum of the resulting range which will be achieved by a difficulty value of 0.
     * @param diff5 Midpoint of the resulting range which will be achieved by a difficulty value of 5.
     * @param diff10 Maximum of the resulting range which will be achieved by a difficulty value of 10.
     * @return The value to which the difficulty value maps in the specified range.
     */
    static inverseDifficultyRange(
        difficultyValue: number,
        diff0: number,
        diff5: number,
        diff10: number,
    ): number {
        if (Math.sign(difficultyValue - diff5) == Math.sign(diff10 - diff0)) {
            return ((difficultyValue - diff5) / (diff10 - diff5)) * 5 + 5;
        } else {
            return ((difficultyValue - diff5) / (diff5 - diff0)) * 5 + 5;
        }
    }

    constructor(shallowCopy?: BeatmapDifficulty) {
        if (!shallowCopy) {
            return;
        }

        this._ar = shallowCopy._ar;
        this.cs = shallowCopy.cs;
        this.od = shallowCopy.od;
        this.hp = shallowCopy.hp;
        this.sliderMultiplier = shallowCopy.sliderMultiplier;
        this.sliderTickRate = shallowCopy.sliderTickRate;
    }
}
