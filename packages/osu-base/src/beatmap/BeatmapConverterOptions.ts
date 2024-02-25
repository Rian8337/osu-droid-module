import { Modes } from "../constants/Modes";
import { Mod } from "../mods/Mod";

/**
 * Options to use for beatmap conversion.
 */
export interface BeatmapConverterOptions {
    /**
     * The game mode to convert to.
     */
    readonly mode?: Modes;

    /**
     * The mods to apply.
     */
    readonly mods?: Mod[];

    /**
     * The custom speed multiplier to apply.
     *
     * This will not directly affect the values of beatmap and hitobject properties,
     * but rather the application of mods to the beatmap.
     */
    readonly customSpeedMultiplier?: number;
}
