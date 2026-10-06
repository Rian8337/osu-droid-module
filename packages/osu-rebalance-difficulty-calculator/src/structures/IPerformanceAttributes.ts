/**
 * Represents the calculated performance of a score.
 */
export interface IPerformanceAttributes {
    /**
     * Calculated score performance points.
     */
    total: number;

    /**
     * The amount of misses, including slider breaks.
     */
    effectiveMissCount: number;
}
