/**
 * Movement types of a cursor in an osu!droid replay.
 *
 * The cursor movement is represented as a player's action on the screen.
 */
export enum MovementType {
    /**
     * The player places their finger on the screen.
     */
    Down,

    /**
     * The player drags their finger on the screen.
     */
    Move,

    /**
     * The player releases their finger from the screen.
     */
    Up,
}
