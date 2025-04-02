/**
 * An interface denoting that a `Mod` can be applied to osu!standard.
 */
export interface IModApplicableToOsu {
    /**
     * Whether this `Mod` is ranked in osu!standard.
     */
    readonly osuRanked: boolean;

    /**
     * Whether this `Mod` results in a meaningful effect to gameplay when applied in osu!standard.
     */
    get isOsuRelevant(): boolean;

    /**
     * The score multiplier of this `Mod` in osu!standard.
     */
    get osuScoreMultiplier(): number;
}
