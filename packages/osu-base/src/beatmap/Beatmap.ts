import { Modes } from "../constants/Modes";
import { MathUtils } from "../math/MathUtils";
import { ModMap } from "../mods/ModMap";
import { ModScoreV2 } from "../mods/ModScoreV2";
import { BeatmapConverter } from "./BeatmapConverter";
import { BeatmapProcessor } from "./BeatmapProcessor";
import { DroidPlayableBeatmap } from "./DroidPlayableBeatmap";
import { IBeatmap } from "./IBeatmap";
import { OsuPlayableBeatmap } from "./OsuPlayableBeatmap";
import { Slider } from "./hitobjects/Slider";
import { BeatmapColor } from "./sections/BeatmapColor";
import { BeatmapControlPoints } from "./sections/BeatmapControlPoints";
import { BeatmapDifficulty } from "./sections/BeatmapDifficulty";
import { BeatmapEditor } from "./sections/BeatmapEditor";
import { BeatmapEvents } from "./sections/BeatmapEvents";
import { BeatmapGeneral } from "./sections/BeatmapGeneral";
import { BeatmapHitObjects } from "./sections/BeatmapHitObjects";
import { BeatmapMetadata } from "./sections/BeatmapMetadata";

/**
 * Represents a beatmap with advanced information.
 */
export class Beatmap implements IBeatmap {
    /**
     * The game mode this `Beatmap` was parsed as.
     */
    mode: Modes = Modes.osu;

    formatVersion: number;
    readonly general: BeatmapGeneral;
    readonly editor: BeatmapEditor;
    readonly metadata: BeatmapMetadata;
    difficulty: BeatmapDifficulty;
    readonly events: BeatmapEvents;
    readonly controlPoints: BeatmapControlPoints;
    readonly colors: BeatmapColor;
    hitObjects: BeatmapHitObjects;

    constructor(shallowCopy?: Beatmap) {
        if (shallowCopy) {
            this.mode = shallowCopy.mode;
            this.formatVersion = shallowCopy.formatVersion;
            this.general = shallowCopy.general;
            this.editor = shallowCopy.editor;
            this.metadata = shallowCopy.metadata;
            this.difficulty = shallowCopy.difficulty;
            this.events = shallowCopy.events;
            this.controlPoints = shallowCopy.controlPoints;
            this.colors = shallowCopy.colors;
            this.hitObjects = shallowCopy.hitObjects;

            return;
        }

        this.formatVersion = 1;
        this.general = new BeatmapGeneral();
        this.editor = new BeatmapEditor();
        this.metadata = new BeatmapMetadata();
        this.difficulty = new BeatmapDifficulty();
        this.events = new BeatmapEvents();
        this.controlPoints = new BeatmapControlPoints();
        this.colors = new BeatmapColor();
        this.hitObjects = new BeatmapHitObjects();
    }

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
        const lastTime =
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
                    const currentTime = i === 0 ? 0 : t.time;
                    const nextTime =
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
     * @param mods The modifications to calculate for. Defaults to No Mod.
     */
    maxDroidScore(mods?: ModMap): number {
        let scoreMultiplier = 1;

        if (mods) {
            for (const mod of mods.values()) {
                if (mod.isApplicableToDroid()) {
                    scoreMultiplier *= mod.calculateDroidScoreMultiplier(
                        this.difficulty,
                    );
                }
            }

            if (mods.has(ModScoreV2)) {
                return 1e6 * scoreMultiplier;
            }
        }

        const difficultyMultiplier =
            1 +
            this.difficulty.od / 10 +
            this.difficulty.hp / 10 +
            (this.difficulty.cs - 3) / 4;

        let combo = 0;
        let score = 0;

        for (const object of this.hitObjects.objects) {
            if (!(object instanceof Slider)) {
                score += Math.floor(
                    300 + (300 * combo * difficultyMultiplier) / 25,
                );
                ++combo;
                continue;
            }

            const { ticks } = object;

            // Apply slider head.
            score += 30;
            ++combo;

            // Apply slider repeats.
            score += 30 * object.repeatCount;
            combo += object.repeatCount;

            // Apply slider ticks.
            score += 10 * ticks;
            combo += ticks;

            // Apply slider end.
            score += Math.floor(
                300 + (300 * combo * difficultyMultiplier) / 25,
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
    maxOsuScore(mods?: ModMap): number {
        const accumulatedDiffPoints =
            this.difficulty.cs + this.difficulty.hp + this.difficulty.od;

        let difficultyMultiplier = 2;
        let scoreMultiplier = 1;

        if (mods) {
            for (const mod of mods.values()) {
                if (mod.isApplicableToOsu()) {
                    scoreMultiplier *= mod.osuScoreMultiplier;
                }
            }

            if (mods.has(ModScoreV2)) {
                return 1e6 * scoreMultiplier;
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

        let combo = 0;
        let score = 0;

        for (const object of this.hitObjects.objects) {
            if (!(object instanceof Slider)) {
                score += Math.floor(
                    300 +
                        (300 * combo * difficultyMultiplier * scoreMultiplier) /
                            25,
                );
                ++combo;
                continue;
            }

            const { ticks } = object;

            // Apply slider head.
            score += 30;
            ++combo;

            // Apply slider repeats.
            score += 30 * object.repeatCount;
            combo += object.repeatCount;

            // Apply slider ticks.
            score += 10 * ticks;
            combo += ticks;

            // Apply slider end.
            score += Math.floor(
                300 +
                    (300 * combo * difficultyMultiplier * scoreMultiplier) / 25,
            );
            ++combo;
        }

        return score;
    }

    /**
     * Constructs a `DroidPlayableBeatmap` from this `Beatmap`.
     *
     * The returned `DroidPlayableBeatmap` is in a playable state - all `HitObject` and `BeatmapDifficulty`
     * `Mod`s have been applied, and `HitObject`s have been fully constructed.
     *
     * @param mods The `Mod`s to apply to the `Beatmap`. Defaults to No Mod.
     * @return The constructed `DroidPlayableBeatmap`.
     */
    createDroidPlayableBeatmap(
        mods: ModMap = new ModMap(),
    ): DroidPlayableBeatmap {
        return new DroidPlayableBeatmap(
            this.createPlayableBeatmap(mods, Modes.droid),
            mods,
        );
    }

    /**
     * Constructs a `OsuPlayableBeatmap` from this `Beatmap`.
     *
     * The returned `OsuPlayableBeatmap` is in a playable state - all `HitObject` and `BeatmapDifficulty`
     * `Mod`s have been applied, and `HitObject`s have been fully constructed.
     *
     * @param mods The `Mod`s to apply to the `Beatmap`. Defaults to No Mod.
     * @return The constructed `OsuPlayableBeatmap`.
     */
    createOsuPlayableBeatmap(mods: ModMap = new ModMap()): OsuPlayableBeatmap {
        return new OsuPlayableBeatmap(
            this.createPlayableBeatmap(mods, Modes.osu),
            mods,
        );
    }

    private createPlayableBeatmap(mods: ModMap, mode: Modes): Beatmap {
        if (this.mode === mode && mods.size === 0) {
            // Beatmap is already in a playable state.
            return this;
        }

        // Convert
        const converted = new BeatmapConverter(this).convert();

        const adjustmentMods = new ModMap();

        for (const mod of mods.values()) {
            if (mod.facilitatesAdjustment()) {
                adjustmentMods.set(mod);
            }
        }

        // Apply difficulty mods
        mods.forEach((mod) => {
            if (mod.isApplicableToDifficulty()) {
                mod.applyToDifficulty(
                    mode,
                    converted.difficulty,
                    adjustmentMods,
                );
            }
        });

        mods.forEach((mod) => {
            if (mod.isApplicableToDifficultyWithMods()) {
                mod.applyToDifficultyWithMods(mode, converted.difficulty, mods);
            }
        });

        const processor = new BeatmapProcessor(converted);

        processor.preProcess();

        // Compute default values for hit objects, including creating nested hit objects in-case they're needed.
        converted.hitObjects.objects.forEach((hitObject) =>
            hitObject.applyDefaults(
                converted.controlPoints,
                converted.difficulty,
                mode,
            ),
        );

        mods.forEach((mod) => {
            if (mod.isApplicableToHitObject()) {
                for (const hitObject of converted.hitObjects.objects) {
                    mod.applyToHitObject(mode, hitObject, adjustmentMods);
                }
            }
        });

        mods.forEach((mod) => {
            if (mod.isApplicableToHitObjectWithMods()) {
                for (const hitObject of converted.hitObjects.objects) {
                    mod.applyToHitObjectWithMods(mode, hitObject, mods);
                }
            }
        });

        processor.postProcess(mode);

        mods.forEach((mod) => {
            if (mod.isApplicableToBeatmap()) {
                mod.applyToBeatmap(converted);
            }
        });

        return converted;
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
            MathUtils.round(this.difficulty.ar, 2) +
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
