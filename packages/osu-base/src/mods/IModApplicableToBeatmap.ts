import { Beatmap } from "../beatmap/Beatmap";

/**
 * An interface for mods that applies changes to a baetmap after conversion and post-processing has completed.
 */
export interface IModApplicableToBeatmap {
    /**
     * Applies this mod to a beatmap.
     *
     * @param beatmap The beatmap to apply the mod to.
     */
    applyToBeatmap(beatmap: Beatmap): void;
}
