/**
 * An interface denoting that a mod can be applied to osu!droid.
 */
export interface IModApplicableToDroid {
    /**
     * Whether the mod is ranked in osu!droid.
     */
    readonly droidRanked: boolean;

    /**
     * The droid score multiplier of this mod.
     */
    readonly droidScoreMultiplier: number;

    /**
     * The droid enum of the mod.
     */
    readonly droidString: string;
}
