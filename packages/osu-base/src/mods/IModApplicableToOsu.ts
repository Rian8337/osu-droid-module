/**
 * An interface denoting that a `Mod` can be applied to osu!standard.
 */
export interface IModApplicableToOsu {
    /**
     * Whether this `Mod` is ranked in osu!standard.
     */
    readonly osuRanked: boolean;

    /**
     * The osu!standard score multiplier of this `Mod`.
     */
    readonly pcScoreMultiplier: number;
}
