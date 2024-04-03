import { Mod } from "../mods/Mod";

/**
 * Options for the difficulty statistics calculator.
 */
export interface DifficultyStatisticsCalculatorOptions<
    TCircleSize extends number | undefined = number | undefined,
    TApproachRate extends number | undefined = number | undefined,
    TOverallDifficulty extends number | undefined = number | undefined,
    THealthDrain extends number | undefined = number | undefined,
    TMods extends Mod[] | undefined = Mod[] | undefined,
    TCustomSpeedMultiplier extends number | undefined = number | undefined,
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
