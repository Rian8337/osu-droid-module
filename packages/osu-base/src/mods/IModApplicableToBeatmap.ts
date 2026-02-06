import { IBeatmap } from "../beatmap/IBeatmap";

/**
 * An interface for `Mod`s that applies changes to an `IBeatmap` after conversion and post-processing has completed.
 */
export interface IModApplicableToBeatmap {
    /**
     * Applies this `IModApplicableToBeatmap` to an `IBeatmap`.
     *
     * @param beatmap The `IBeatmap` to apply to.
     */
    applyToBeatmap(beatmap: IBeatmap): void;
}
