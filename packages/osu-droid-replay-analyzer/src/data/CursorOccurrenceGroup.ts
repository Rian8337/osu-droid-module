import { MovementType } from "../constants/MovementType";
import { CursorOccurrence } from "./CursorOccurrence";

/**
 * Represents a group of cursor occurrences representing a cursor instance's
 * movement when a player places their finger on the screen.
 */
export class CursorOccurrenceGroup {
    /**
     * The cursor occurrence of movement type `movementType.DOWN`.
     */
    get down(): CursorOccurrence {
        return this._down;
    }

    /**
     * The cursor occurrence of movement type `movementType.DOWN`.
     */
    set down(value: CursorOccurrence) {
        if (value.id !== MovementType.down) {
            throw new TypeError(
                "Attempting to set the down cursor occurrence to one with different movement type."
            );
        }

        this._down = value;
    }

    /**
     * The cursor occurrences of movement type `movementType.MOVE`.
     */
    get moves(): readonly CursorOccurrence[] {
        return this._moves;
    }

    /**
     * The cursor occurrence of movement type `movementType.UP`.
     *
     * May not exist, such as when the player holds their cursor until the end of a beatmap.
     */
    get up(): CursorOccurrence | undefined {
        return this._up;
    }

    /**
     * The cursor occurrence of movement type `movementType.UP`.
     *
     * May not exist, such as when the player holds their cursor until the end of a beatmap.
     */
    set up(value: CursorOccurrence | undefined) {
        if (value && value.id !== MovementType.up) {
            throw new TypeError(
                "Attempting to set the up cursor occurrence to one with different movement type."
            );
        }

        this._up = value;
    }

    /**
     * The time at which this cursor occurrence group starts.
     */
    get startTime(): number {
        return this._down.time;
    }

    /**
     * The time at which this cursor occurrence group ends.
     */
    get endTime(): number {
        return this._up?.time ?? this._moves.at(-1)?.time ?? this._down.time;
    }

    /**
     * The duration this cursor occurrence group is active for.
     */
    get duration(): number {
        return this.endTime - this.startTime;
    }

    /**
     * All cursor occurrences in this group.
     *
     * This iterates all occurrences and as such should be used sparingly or stored locally.
     */
    get allOccurrences(): CursorOccurrence[] {
        const cursors: CursorOccurrence[] = [this._down, ...this._moves];

        if (this._up) {
            cursors.push(this._up);
        }

        return cursors;
    }

    /**
     * The cursor occurrence of movement type `movementType.DOWN`.
     */
    private _down: CursorOccurrence;

    /**
     * The cursor occurrences of movement type `movementType.MOVE`.
     */
    private _moves: CursorOccurrence[];

    /**
     * The cursor occurrence of movement type `movementType.UP`.
     *
     * May not exist, such as when the player holds their cursor until the end of a beatmap.
     */
    private _up?: CursorOccurrence;

    constructor(
        down: CursorOccurrence,
        moves: CursorOccurrence[],
        up?: CursorOccurrence
    ) {
        this._down = down;
        this._moves = moves;

        // Re-set down cursor occurrence for checking.
        this.down = down;
        this.up = up;
    }

    /**
     * Determines whether this cursor occurrence group is active at the specified time.
     *
     * @param time The time.
     * @returns Whether this cursor occurrence group is active at the specified time.
     */
    isActiveAt(time: number): boolean {
        return time >= this.startTime && time <= this.endTime;
    }

    /**
     * Finds the cursor occurrence that is active at a given time.
     *
     * @param time The time.
     * @returns The cursor occurrence at the given time, `null` if not found.
     */
    cursorAt(time: number): CursorOccurrence | null {
        if (!this.isActiveAt(time)) {
            return null;
        }

        if (this._down.time === time) {
            return this._down;
        }

        if (this._up?.time === time) {
            return this._up;
        }

        let l: number = 0;
        let r: number = this._moves.length - 2;

        while (l <= r) {
            const pivot: number = l + ((r - l) >> 1);

            if (this._moves[pivot].time < time) {
                l = pivot + 1;
            } else if (this._moves[pivot].time > time) {
                r = pivot - 1;
            } else {
                return this._moves[pivot];
            }
        }

        // l will be the first cursor occurrence with time > this._moves[l].time, but we want the one before it
        return this._moves[l - 1];
    }
}
