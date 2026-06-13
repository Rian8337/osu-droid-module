/**
 * The result of a hit.
 *
 * Underlying numbers mirror values in an osu!droid replay.
 */
export enum HitResult {
    /**
     * Miss (0).
     */
    Miss = 1,

    /**
     * Meh (50).
     */
    Meh,

    /**
     * Good (100).
     */
    Good,

    /**
     * Great (300).
     */
    Great,
}
