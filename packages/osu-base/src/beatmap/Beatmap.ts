import { Slider } from "./hitobjects/Slider";
import { HitObject } from "./hitobjects/HitObject";
import { BreakPoint } from "./timings/BreakPoint";
import { TimingControlPoint } from "./timings/TimingControlPoint";
import { DifficultyControlPoint } from "./timings/DifficultyControlPoint";
import { TimingPoint } from "./timings/TimingPoint";
import { MapStats } from "../utils/MapStats";
import { SliderTick } from "./hitobjects/sliderObjects/SliderTick";
import { Mod } from "../mods/Mod";

/**
 * Represents a beatmap with advanced information.
 */
export class Beatmap {
    /**
     * The name of the audio file of the beatmap.
     */
    audioFileName: string = "";

    /**
     * The format version of the beatmap.
     */
    formatVersion: number = 1;

    /**
     * The title of the song of the beatmap.
     */
    title: string = "";

    /**
     * The unicode title of the song of the beatmap.
     */
    titleUnicode: string = "";

    /**
     * The artist of the song of the beatmap.
     */
    artist: string = "";

    /**
     * The unicode artist of the song of the beatmap.
     */
    artistUnicode: string = "";

    /**
     * The creator of the beatmap.
     */
    creator: string = "";

    /**
     * The difficulty name of the beatmap.
     */
    version: string = "";

    /**
     * The ID of the beatmap.
     */
    beatmapId?: number;

    /**
     * The ID of the beatmapset containing this beatmap.
     */
    beatmapSetId?: number;

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
     * The slider velocity of the beatmap.
     */
    sv: number = 1;

    /**
     * The slider tick rate of the beatmap.
     */
    tickRate: number = 1;

    /**
     * The amount of circles in the beatmap.
     */
    circles: number = 0;

    /**
     * The amount of sliders in the beatmap.
     */
    sliders: number = 0;

    /**
     * The amount of spinners in the beatmap.
     */
    spinners: number = 0;

    /**
     * The objects of the beatmap.
     */
    readonly objects: HitObject[] = [];

    /**
     * The timing points of the beatmap.
     */
    readonly timingPoints: TimingControlPoint[] = [];

    /**
     * The difficulty timing points of the beatmap.
     */
    readonly difficultyTimingPoints: DifficultyControlPoint[] = [];

    /**
     * The break points of the beatmap.
     */
    readonly breakPoints: BreakPoint[] = [];

    /**
     * The stack leniency of the beatmap.
     */
    stackLeniency: number = 0.7;

    /**
     * The amount of slider ticks in the beatmap.
     */
    get sliderTicks(): number {
        const sliders: Slider[] = <Slider[]>(
            this.objects.filter((v) => v instanceof Slider)
        );
        return sliders.reduce((acc, value) => acc + value.ticks, 0);
    }

    /**
     * The amount of sliderends in the beatmap.
     */
    get sliderEnds(): number {
        return this.sliders;
    }

    /**
     * The amount of slider repeat points in the beatmap.
     */
    get sliderRepeatPoints(): number {
        const sliders: Slider[] = <Slider[]>(
            this.objects.filter((v) => v instanceof Slider)
        );
        return sliders.reduce((acc, value) => acc + value.repeatPoints, 0);
    }

    /**
     * The maximum combo of the beatmap.
     */
    get maxCombo(): number {
        return (
            this.circles +
            this.sliders +
            this.sliderTicks +
            this.sliderRepeatPoints +
            this.sliderEnds +
            this.spinners
        );
    }

    /**
     * Returns a time combined with beatmap-wide time offset.
     *
     * BeatmapVersion 4 and lower had an incorrect offset. Stable has this set as 24ms off.
     *
     * @param time The time.
     */
    getOffsetTime(time: number): number {
        return time + (this.formatVersion < 5 ? 24 : 0);
    }

    /**
     * Gets the timing control point that applies at a given time.
     *
     * @param time The time.
     */
    timingControlPointAt(time: number): TimingControlPoint {
        return this.getTimingPoint(time, this.timingPoints);
    }

    /**
     * Gets the difficulty control point that applies at a given time.
     *
     * @param time The time.
     */
    difficultyControlPointAt(time: number): DifficultyControlPoint {
        return this.getTimingPoint(time, this.difficultyTimingPoints);
    }

    /**
     * Calculates the osu!droid maximum score of the beatmap without taking spinner bonus into account.
     *
     * @param stats The statistics used for calculation.
     */
    maxDroidScore(stats: MapStats): number {
        let scoreMultiplier: number = 1;

        if (stats.mods.every((m) => m.droidRanked)) {
            let scoreSpeedMultiplier: number = 1;
            const speedMultiplier: number = stats.speedMultiplier;
            if (speedMultiplier > 1) {
                scoreSpeedMultiplier += (speedMultiplier - 1) * 0.24;
            } else if (speedMultiplier < 1) {
                scoreSpeedMultiplier = Math.pow(0.3, (1 - speedMultiplier) * 4);
            }
            scoreMultiplier =
                stats.mods.reduce((a, v) => a * v.scoreMultiplier, 1) *
                scoreSpeedMultiplier;
        } else {
            scoreMultiplier = 0;
        }

        return this.maxScore(
            1 + this.od / 10 + this.hp / 10 + (this.cs - 3) / 4,
            scoreMultiplier
        );
    }

    /**
     * Calculates the osu!standard maximum score of the beatmap without taking spinner bonus into account.
     *
     * @param mods The modifications to calculate for. Defaults to No Mod.
     */
    maxOsuScore(mods: Mod[] = []): number {
        const accumulatedDiffPoints: number = this.cs + this.hp + this.od;

        let difficultyMultiplier: number = 2;

        switch (true) {
            case accumulatedDiffPoints <= 5:
                difficultyMultiplier = 2;
                break;
            case accumulatedDiffPoints <= 12:
                difficultyMultiplier = 3;
                break;
            case accumulatedDiffPoints <= 17:
                difficultyMultiplier = 4;
                break;
            case accumulatedDiffPoints <= 24:
                difficultyMultiplier = 5;
                break;
            case accumulatedDiffPoints >= 25:
                difficultyMultiplier = 6;
                break;
        }

        return this.maxScore(
            difficultyMultiplier,
            mods.reduce((a, v) => a * v.scoreMultiplier, 1)
        );
    }

    /**
     * Calculates the maximum score with a given difficulty and score multiplier.
     *
     * @param difficultyMultiplier The difficulty multiplier.
     * @param scoreMultiplier The score multiplier.
     */
    private maxScore(
        difficultyMultiplier: number,
        scoreMultiplier: number
    ): number {
        let combo: number = 0;
        let score: number = 0;

        for (const object of this.objects) {
            if (!(object instanceof Slider)) {
                score += Math.floor(
                    300 +
                        (300 * combo * difficultyMultiplier * scoreMultiplier) /
                            25
                );
                ++combo;
                continue;
            }

            const tickCount: number = object.nestedHitObjects.filter(
                (v) => v instanceof SliderTick
            ).length;

            // Apply sliderhead, slider repeats, and slider ticks
            score += 30 * (object.repeatPoints + 1) + 10 * tickCount;
            combo += tickCount + (object.repeatPoints + 1);

            // Apply sliderend
            score += Math.floor(
                300 +
                    (300 * combo * difficultyMultiplier * scoreMultiplier) / 25
            );
            ++combo;
        }

        return score;
    }

    /**
     * Gets the timing point that applies at a given time.
     *
     * @param time The time.
     * @param list The timing points to search in.
     */
    private getTimingPoint<T extends TimingPoint>(time: number, list: T[]): T {
        if (list.length === 0) {
            throw new Error("No timing points have been loaded");
        }

        if (time < list[0].time) {
            return list[0];
        }

        if (time >= list.at(-1)!.time) {
            return list.at(-1)!;
        }

        let l: number = 0;
        let r: number = list.length - 2;

        while (l <= r) {
            const pivot: number = l + ((r - l) >> 1);

            if (list[pivot].time < time) {
                l = pivot + 1;
            } else if (list[pivot].time > time) {
                r = pivot - 1;
            } else {
                return list[pivot];
            }
        }

        // l will be the first control point with time > list[l].time, but we want the one before it
        return list[l - 1];
    }

    /**
     * Returns a string representative of the class.
     */
    toString(): string {
        let res = this.artist + " - " + this.title + " [";
        if (this.titleUnicode || this.artistUnicode) {
            res += "(" + this.artistUnicode + " - " + this.titleUnicode + ")";
        }
        res +=
            this.version +
            "] mapped by " +
            this.creator +
            "\n" +
            "\n" +
            "AR" +
            parseFloat((this.ar as number).toFixed(2)) +
            " " +
            "OD" +
            parseFloat(this.od.toFixed(2)) +
            " " +
            "CS" +
            parseFloat(this.cs.toFixed(2)) +
            " " +
            "HP" +
            parseFloat(this.hp.toFixed(2)) +
            "\n" +
            this.circles +
            " circles, " +
            this.sliders +
            " sliders, " +
            this.spinners +
            " spinners" +
            "\n" +
            this.maxCombo +
            " max combo";
        return res;
    }
}
