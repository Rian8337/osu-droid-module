import { MapStats } from "@rian8337/osu-base";

/**
 * The base of calculation options.
 */
export interface CalculationOptions {
    /**
     * Custom map statistics to apply custom speed multiplier as well as old statistics.
     */
    stats?: MapStats;
}
