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
