/**
 * An interface denoting that a mod can be applied to osu!standard.
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
     */
    readonly bitwise: number;
}
