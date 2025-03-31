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
}
