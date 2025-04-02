/**
 * Represents a hit window.
 */
export abstract class HitWindow {
    /**
     * A fixed miss hit window regardless of difficulty settings.
     */
    static readonly missWindow = 400;

    /**
     * The overall difficulty of this `HitWindow`.
     */
    overallDifficulty: number;

    /**
     * @param overallDifficulty The overall difficulty of this `HitWindow`. Defaults to 5.
     */
    constructor(overallDifficulty = 5) {
        this.overallDifficulty = overallDifficulty;
    }

    /**
     * The great (300) window of this `HitWindow`.
     */
    abstract get greatWindow(): number;

    /**
     * The ok (100) window of this `HitWindow`.
     */
    abstract get okWindow(): number;

    /**
     * The meh (50) window of this `HitWindow`.
     */
    abstract get mehWindow(): number;
}
