import { DifficultyCalculationOptions } from "./DifficultyCalculationOptions";

/**
 * Represents options for osu!droid difficulty calculation.
 */
export interface DroidDifficultyCalculationOptions
    extends DifficultyCalculationOptions {
    /**
     * Whether to calculate for old statistics (1.6.7 and older). Defaults to `false`.
     */
    readonly oldStatistics?: boolean;
}
