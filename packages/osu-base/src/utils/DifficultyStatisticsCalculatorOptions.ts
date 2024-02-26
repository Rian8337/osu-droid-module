import { Mod } from "../mods/Mod";

/**
 * Options for the difficulty statistics calculator.
 */
export interface DifficultyStatisticsCalculatorOptions<
    TCircleSize extends number | undefined = undefined,
    TApproachRate extends number | undefined = undefined,
    TOverallDifficulty extends number | undefined = undefined,
    THealthDrain extends number | undefined = undefined,
    TMods extends Mod[] | undefined = undefined,
    TCustomSpeedMultiplier extends number | undefined = undefined,
> {
    /**
     * The circle size of the beatmap.
     */
    readonly circleSize: TCircleSize;

    /**
     * The approach rate of the beatmap.
     */
    readonly approachRate: TApproachRate;

    /**
     * The overall difficulty of the beatmap.
     */
    readonly overallDifficulty: TOverallDifficulty;

    /**
     * The health drain of the beatmap.
     */
    readonly healthDrain: THealthDrain;

    /**
     * The mods applied to the beatmap.
     */
    readonly mods: TMods;

    /**
     * The custom speed multiplier of the beatmap. Defaults to 1.
     */
    readonly customSpeedMultiplier: TCustomSpeedMultiplier;
}
