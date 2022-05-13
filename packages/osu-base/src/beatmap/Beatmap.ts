import { Slider } from "./hitobjects/Slider";
import { MapStats } from "../utils/MapStats";
import { SliderTick } from "./hitobjects/sliderObjects/SliderTick";
import { Mod } from "../mods/Mod";
import { BeatmapGeneral } from "./sections/BeatmapGeneral";
import { BeatmapEditor } from "./sections/BeatmapEditor";
import { BeatmapMetadata } from "./sections/BeatmapMetadata";
import { BeatmapDifficulty } from "./sections/BeatmapDifficulty";
import { BeatmapEvents } from "./sections/BeatmapEvents";
import { BeatmapControlPoints } from "./sections/BeatmapControlPoints";
import { BeatmapColor } from "./sections/BeatmapColor";
import { BeatmapHitObjects } from "./sections/BeatmapHitObjects";
import { MathUtils } from "../mathutil/MathUtils";

/**
 * Represents a beatmap with advanced information.
 */
export class Beatmap {
    /**
     * The format version of the beatmap.
     */
    formatVersion: number = 1;

    /**
     * General information about the beatmap.
     */
    readonly general: BeatmapGeneral = new BeatmapGeneral();

    /**
     * Saved settings for the beatmap editor.
     */
    readonly editor: BeatmapEditor = new BeatmapEditor();

    /**
     * Information used to identify the beatmap.
     */
    readonly metadata: BeatmapMetadata = new BeatmapMetadata();

    /**
     * Difficulty settings of the beatmap.
     */
    readonly difficulty: BeatmapDifficulty = new BeatmapDifficulty();

    /**
     * Events of the beatmap.
     */
    readonly events: BeatmapEvents = new BeatmapEvents();

    /**
     * Timing and control points of the beatmap.
     */
    readonly controlPoints: BeatmapControlPoints = new BeatmapControlPoints();

    /**
     * Combo and skin colors of the beatmap.
     */
    readonly colors: BeatmapColor = new BeatmapColor();

    /**
     * The objects of the beatmap.
     */
    readonly hitObjects: BeatmapHitObjects = new BeatmapHitObjects();

    /**
     * The maximum combo of the beatmap.
     */
    get maxCombo(): number {
        return (
            this.hitObjects.circles +
            this.hitObjects.sliders +
            this.hitObjects.sliderTicks +
            this.hitObjects.sliderRepeatPoints +
            this.hitObjects.sliderEnds +
            this.hitObjects.spinners
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
            1 +
            this.difficulty.od / 10 +
            this.difficulty.hp / 10 +
            (this.difficulty.cs - 3) / 4,
            scoreMultiplier
        );
    }

    /**
     * Calculates the osu!standard maximum score of the beatmap without taking spinner bonus into account.
     *
     * @param mods The modifications to calculate for. Defaults to No Mod.
     */
    maxOsuScore(mods: Mod[] = []): number {
        const accumulatedDiffPoints: number =
            this.difficulty.cs + this.difficulty.hp + this.difficulty.od;

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

        for (const object of this.hitObjects.objects) {
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
     * Returns a string representative of the class.
     */
    toString(): string {
        let res = this.metadata.artist + " - " + this.metadata.title + " [";
        if (this.metadata.titleUnicode || this.metadata.artistUnicode) {
            res +=
                "(" +
                this.metadata.artistUnicode +
                " - " +
                this.metadata.titleUnicode +
                ")";
        }
        res +=
            this.metadata.version +
            "] mapped by " +
            this.metadata.creator +
            "\n" +
            "\n" +
            "AR" +
            MathUtils.round(this.difficulty.ar!, 2) +
            " " +
            "OD" +
            MathUtils.round(this.difficulty.od, 2) +
            " " +
            "CS" +
            MathUtils.round(this.difficulty.cs, 2) +
            " " +
            "HP" +
            MathUtils.round(this.difficulty.hp, 2) +
            "\n" +
            this.hitObjects.circles +
            " circles, " +
            this.hitObjects.sliders +
            " sliders, " +
            this.hitObjects.spinners +
            " spinners" +
            "\n" +
            this.maxCombo +
            " max combo";
        return res;
    }
}
