import { IDifficultyAttributes } from "./IDifficultyAttributes";

/**
 * Holds data that can be used to calculate osu!droid performance points.
 */
export interface IDroidDifficultyAttributes extends IDifficultyAttributes {
    /**
     * The difficulty corresponding to the tap skill.
     */
    tapDifficulty: number;

    /**
     * The difficulty corresponding to the rhythm skill.
     */
    rhythmDifficulty: number;

    /**
     * The amount of strains that are considered difficult with respect to the tap skill.
     */
    tapDifficultStrainCount: number;

    /**
     * Describes how much of {@link tapDifficultStrainCount} is contributed to by circles or sliders.
     *
     * A value closer to 0 indicates most of {@link tapDifficultStrainCount} is contributed by circles.
     *
     * A value closer to infinity indicates most of {@link tapDifficultStrainCount} is contributed by sliders.
     */
    tapTopWeightedSliderFactor: number;

    /**
     * The average delta time of speed objects.
     */
    averageSpeedDeltaTime: number;

    /**
     * Describes how much of tap difficulty is contributed by notes that are "vibroable".
     *
     * A value closer to 1 indicates most of tap difficulty is contributed by notes that are not "vibroable".
     *
     * A value closer to 0 indicates most of tap difficulty is contributed by notes that are "vibroable".
     */
    vibroFactor: number;

    /**
     * The maximum score obtainable on the beatmap.
     */
    maximumScore: number;

    /**
     * The first coefficient used in the aim miss penalty calculation formula.
     */
    aimMissPenaltyCoefficientA: number;

    /**
     * The second coefficient used in the aim miss penalty calculation formula.
     */
    aimMissPenaltyCoefficientB: number;

    /**
     * The third coefficient used in the aim miss penalty calculation formula.
     */
    aimMissPenaltyCoefficientC: number;
}
