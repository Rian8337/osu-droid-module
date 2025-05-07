/**
 * An interface for `Mod`s that aids in adjustments to a `HitObject` or `BeatmapDifficulty`.
 *
 * `Mod`s marked by this interface will be passed into `IModApplicableToDifficulty`s
 * and `IModApplicableToHitObject`s.
 */
export interface IModFacilitatesAdjustment {
    /**
     * Whether this `Mod` facilitates adjustment to a `HitObject` or `BeatmapDifficulty`.
     *
     * This is always `true`.
     */
    readonly facilitateAdjustment: true;
}
