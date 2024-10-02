import { Beatmap } from "../beatmap/Beatmap";

/**
 * An interface for `Mod`s that applies changes to a `Beatmap` after conversion and post-processing has completed.
 */
export interface IModApplicableToBeatmap {
    /**
     * Applies this `IModApplicableToBeatmap` to a `Beatmap`.
     *
     * @param beatmap The `Beatmap` to apply to.
     */
    applyToBeatmap(beatmap: Beatmap): void;
}
