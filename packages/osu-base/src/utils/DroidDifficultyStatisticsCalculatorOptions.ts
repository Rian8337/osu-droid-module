import { Mod } from "../mods/Mod";
import { DifficultyStatisticsCalculatorOptions } from "./DifficultyStatisticsCalculatorOptions";

/**
 * Options for the difficulty statistics calculator for osu!droid gamemode.
 */
export interface DroidDifficultyStatisticsCalculatorOptions<
    TCircleSize extends number | undefined = undefined,
    TApproachRate extends number | undefined = undefined,
    TOverallDifficulty extends number | undefined = undefined,
    THealthDrain extends number | undefined = undefined,
    TMods extends Mod[] | undefined = undefined,
    TCustomSpeedMultiplier extends number | undefined = undefined,
> extends DifficultyStatisticsCalculatorOptions<
        TCircleSize,
        TApproachRate,
        TOverallDifficulty,
        THealthDrain,
        TMods,
        TCustomSpeedMultiplier
    > {
    /**
     * Whether to calculate for old statistics (1.6.7 and older). Defaults to `false`.
     */
    readonly oldStatistics?: boolean;

    /**
     * Whether to convert osu!droid circle size to osu!standard circle size. Defaults to `true`.
     */
    readonly convertCircleSize?: boolean;

    /**
     * Whether to convert osu!droid overall difficulty to osu!standard overall difficulty. Defaults to `true`.
     */
    readonly convertOverallDifficulty?: boolean;
}
