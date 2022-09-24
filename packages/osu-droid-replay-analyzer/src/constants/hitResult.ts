/**
 * The result of a hit in an osu!droid replay.
 */
export enum HitResult {
    /**
     * Miss (0).
     */
    miss = 1,

    /**
     * Meh (50).
     */
    meh = 2,

    /**
     * Good (100).
     */
    good = 3,

    /**
     * Great (300).
     */
    great = 4,
}
