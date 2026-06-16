/**
 * Represents a strain peak at a specific point in time.
 */
export interface TimedStrainPeak {
    /**
     * The time at which this peak occurs, in milliseconds.
     */
    readonly time: number;

    /**
     * The strain value of this peak.
     */
    readonly value: number;
}
