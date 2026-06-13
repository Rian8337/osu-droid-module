/**
 * An interface for `Skill`s that have peak difficulties.
 */
export interface IHasPeakDifficulty {
    /**
     * The peak difficulties calculated by this `Skill`.
     */
    get peaks(): readonly number[];
}
