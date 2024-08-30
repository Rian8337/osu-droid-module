import { Modes } from "../constants/Modes";
import { Mod } from "../mods/Mod";

/**
 * Options to use for creating a playable beatmap.
 */
export interface PlayableBeatmapOptions {
    /**
     * The game mode to convert to. Defaults to osu!standard.
     */
    readonly mode?: Modes;

    /**
     * The mods to apply. Defaults to No Mod.
     */
    readonly mods?: Mod[];

    /**
     * The custom speed multiplier to apply. Defaults to 1.
     *
     * This will not directly affect the values of beatmap and hitobject properties,
     * but rather the application of mods to the beatmap.
     */
    readonly customSpeedMultiplier?: number;
}
