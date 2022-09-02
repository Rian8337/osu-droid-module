/**
 * An interface denoting that a mod can be applied to osu!droid.
 */
export interface IModApplicableToOsu {
    /**
     * Whether the mod is ranked in osu!standard.
     */
    readonly pcRanked: boolean;

    /**
     * The PC score multiplier of this mod.
     */
    readonly pcScoreMultiplier: number;

    /**
     * The bitwise enum of the mod.
     *
     * This is NaN if the bitwise doesn't exist.
     *
     * In 3.0, this will be nullable.
     */
    readonly bitwise: number;
}
