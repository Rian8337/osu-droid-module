import { ModMap } from "../mods/ModMap";
import { ModUtil } from "../utils/ModUtil";
import { HitWindow } from "./HitWindow";
import { IBeatmap } from "./IBeatmap";
import { BeatmapColor } from "./sections/BeatmapColor";
import { BeatmapControlPoints } from "./sections/BeatmapControlPoints";
import { BeatmapDifficulty } from "./sections/BeatmapDifficulty";
import { BeatmapEditor } from "./sections/BeatmapEditor";
import { BeatmapEvents } from "./sections/BeatmapEvents";
import { BeatmapGeneral } from "./sections/BeatmapGeneral";
import { BeatmapHitObjects } from "./sections/BeatmapHitObjects";
import { BeatmapMetadata } from "./sections/BeatmapMetadata";

/**
 * Represents a beatmap that is in a playable state for a specific game mode.
 */
export abstract class PlayableBeatmap implements IBeatmap {
    readonly formatVersion: number;
    readonly general: BeatmapGeneral;
    readonly editor: BeatmapEditor;
    readonly metadata: BeatmapMetadata;
    readonly difficulty: BeatmapDifficulty;
    readonly events: BeatmapEvents;
    readonly controlPoints: BeatmapControlPoints;
    readonly colors: BeatmapColor;
    readonly hitObjects: BeatmapHitObjects;
    readonly maxCombo: number;

    /**
     * The `Mod`s that were applied to this `PlayableBeatmap`.
     */
    readonly mods: ModMap;

    /**
     * The speed multiplier that was applied to this [PlayableBeatmap].
     */
    readonly speedMultiplier: number;

    private readonly _hitWindow: HitWindow | null = null;

    /**
     * The `HitWindow` of this `PlayableBeatmap`.
     */
    get hitWindow(): HitWindow {
        if (this._hitWindow === null) {
            return this.createHitWindow();
        }

        return this._hitWindow;
    }

    /**
     * @param baseBeatmap The base `IBeatmap` that was used to create this `PlayableBeatmap`.
     * @param mods The `Mod`s that were applied to this `PlayableBeatmap`.
     */
    constructor(baseBeatmap: IBeatmap, mods: ModMap) {
        this.formatVersion = baseBeatmap.formatVersion;
        this.general = baseBeatmap.general;
        this.editor = baseBeatmap.editor;
        this.metadata = baseBeatmap.metadata;
        this.difficulty = baseBeatmap.difficulty;
        this.events = baseBeatmap.events;
        this.controlPoints = baseBeatmap.controlPoints;
        this.colors = baseBeatmap.colors;
        this.hitObjects = baseBeatmap.hitObjects;
        this.maxCombo = baseBeatmap.maxCombo;

        this.mods = mods;
        this.speedMultiplier = ModUtil.calculateRateWithMods(
            this.mods.values(),
            Number.POSITIVE_INFINITY,
        );
    }

    getOffsetTime(time: number): number {
        return time + (this.formatVersion < 5 ? 24 : 0);
    }

    /**
     * Creates the `HitWindow` of this `PlayableBeatmap`.
     */
    protected abstract createHitWindow(): HitWindow;
}
