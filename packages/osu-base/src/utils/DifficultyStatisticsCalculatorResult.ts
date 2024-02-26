/**
 * Results output by the difficulty statistics calculator.
 */
export interface DifficultyStatisticsCalculatorResult<
    TCircleSize extends number | undefined,
    TApproachRate extends number | undefined,
    TOverallDifficulty extends number | undefined,
    THealthDrain extends number | undefined,
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
     * The overall speed multiplier, cumulated from the custom speed multiplier and the speed-changing mods.
     */
    readonly overallSpeedMultiplier: number;
}
