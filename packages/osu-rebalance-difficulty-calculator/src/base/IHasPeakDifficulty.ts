import { TimedStrainPeak } from "../structures/TimedStrainPeak";

/**
 * An interface for `Skill`s that have peak difficulties.
 */
export interface IHasPeakDifficulty {
    /**
     * The peak difficulties calculated by this `Skill`, in chronological order.
     */
    get peaks(): readonly TimedStrainPeak[];
}
