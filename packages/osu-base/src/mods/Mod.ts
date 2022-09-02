// TODO: separate droid/PC mod implementations
/**
 * Represents a mod.
 */
export abstract class Mod {
    /**
     * The score multiplier of this mod.
     *
     * @deprecated Score multipliers in droid and PC differ. Use `droidScoreMultiplier`
     * for droid score multiplier and `pcScoreMultiplier` for PC multiplier instead.
     */
    abstract readonly scoreMultiplier: number;

    /**
     * The acronym of the mod.
     */
    abstract readonly acronym: string;

    /**
     * The name of the mod.
     */
    abstract readonly name: string;

    /**
     * Whether the mod is ranked in osu!droid.
     */
    abstract readonly droidRanked: boolean;

    /**
     * Whether the mod is ranked in osu!standard.
     */
    abstract readonly pcRanked: boolean;

    /**
     * The droid score multiplier of this mod.
     */
    abstract readonly droidScoreMultiplier: number;

    /**
     * The PC score multiplier of this mod.
     */
    abstract readonly pcScoreMultiplier: number;

    /**
     * The bitwise enum of the mod.
     *
     * This is NaN if the bitwise doesn't exist.
     *
     * In 3.0, this will be nullable.
     */
    abstract readonly bitwise: number;

    /**
     * The droid enum of the mod.
     */
    abstract readonly droidString: string;

    /**
     * Whether this mod only exists for osu!droid gamemode.
     */
    abstract readonly droidOnly: boolean;
}
