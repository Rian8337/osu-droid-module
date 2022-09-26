import { Slider } from "./hitobjects/Slider";
import { MapStats } from "../utils/MapStats";
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
     * The most common beat length of the beatmap.
     */
    get mostCommonBeatLength(): number {
        // The last playable time in the beatmap - the last timing point extends to this time.
        // Note: This is more accurate and may present different results because osu-stable didn't have the ability to calculate slider durations in this context.
        const lastTime: number =
            this.hitObjects.objects[this.hitObjects.objects.length - 1]
                ?.endTime ??
            this.controlPoints.timing.points[
                this.controlPoints.timing.points.length - 1
            ]?.time ??
            0;

        const mostCommon: { beatLength: number; duration: number } =
            // Construct a set of {beatLength, duration} objects for each individual timing point.
            this.controlPoints.timing.points
                .map((t, i, a) => {
                    if (t.time > lastTime) {
                        return { beatLength: t.msPerBeat, duration: 0 };
                    }

                    // osu-stable forced the first control point to start at 0.
                    const currentTime: number = i === 0 ? 0 : t.time;
                    const nextTime: number =
                        i === a.length - 1 ? lastTime : a[i + 1].time;

                    return {
                        beatLength: t.msPerBeat,
                        duration: nextTime - currentTime,
                    };
                })
                // Get the most common one, or 0 as a suitable default.
                .sort((a, b) => b.duration - a.duration)[0];

        return mostCommon?.beatLength ?? 0;
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

        for (const mod of stats.mods) {
            if (mod.isApplicableToDroid()) {
                scoreMultiplier *= mod.droidScoreMultiplier;
            }
        }

        const { speedMultiplier } = stats;

        if (speedMultiplier >= 1) {
            scoreMultiplier *= 1 + (speedMultiplier - 1) * 0.24;
        } else {
            scoreMultiplier *= Math.pow(0.3, (1 - speedMultiplier) * 4);
        }

        const difficultyMultiplier: number =
            1 +
            this.difficulty.od / 10 +
            this.difficulty.hp / 10 +
            (this.difficulty.cs - 3) / 4;

        let combo: number = 0;
        let score: number = 0;

        for (const object of this.hitObjects.objects) {
            if (!(object instanceof Slider)) {
                score += Math.floor(
                    300 + (300 * combo * difficultyMultiplier) / 25
                );
                ++combo;
                continue;
            }

            const { ticks } = object;

            // Apply slider head.
            score += 30;
            ++combo;

            // Apply slider repeats.
            score += 30 * object.repeats;
            combo += object.repeats;

            // Apply slider ticks.
            score += 10 * ticks;
            combo += ticks;

            // Apply slider end.
            score += Math.floor(
                300 + (300 * combo * difficultyMultiplier) / 25
            );
            ++combo;
        }

        return Math.floor(score * scoreMultiplier);
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
        let scoreMultiplier: number = 1;

        for (const mod of mods) {
            if (mod.isApplicableToOsu()) {
                scoreMultiplier *= mod.pcScoreMultiplier;
            }
        }

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

            const { ticks } = object;

            // Apply slider head.
            score += 30;
            ++combo;

            // Apply slider repeats.
            score += 30 * object.repeats;
            combo += object.repeats;

            // Apply slider ticks.
            score += 10 * ticks;
            combo += ticks;

            // Apply slider end.
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
