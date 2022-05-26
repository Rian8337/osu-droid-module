import { movementType } from "../constants/movementType";
import { CursorOccurrence } from "./CursorOccurrence";

/**
 * Contains information about a cursor instance.
 */
export interface CursorInformation {
    /**
     * The movement size of the cursor instance.
     */
    size: number;

    /**
     * The time during which this cursor instance is active in milliseconds.
     */
    time: number[];

    /**
     * The x coordinates of this cursor instance in osu!pixels.
     */
    x: number[];

    /**
     * The y coordinates of this cursor instance in osu!pixels.
     */
    y: number[];

    /**
     * The hit results of this cursor instance.
     */
    id: movementType[];
}

/**
 * Represents a cursor instance in an osu!droid replay.
 *
 * Stores cursor movement data such as x and y coordinates, movement size, etc.
 *
 * This is used when analyzing replays using replay analyzer.
 */
export class CursorData {
    /**
     * The occurrences of this cursor instance.
     */
    get occurrences(): readonly CursorOccurrence[] {
        return this._occurrences;
    }

    set occurrences(value: readonly CursorOccurrence[]) {
        this._occurrences = <CursorOccurrence[]>value;
    }

    private _occurrences: CursorOccurrence[] = [];

    constructor(values: CursorInformation) {
        for (let i = 0; i < values.size; ++i) {
            this._occurrences.push(
                new CursorOccurrence(
                    values.time[i],
                    values.x[i],
                    values.y[i],
                    values.id[i]
                )
            );
        }
    }

    /**
     * Adds cursor occurrences.
     *
     * The sorting order of cursor occurrences will be maintained.
     *
     * @param occurrences The cursor occurrences to add.
     */
    addOccurrences(...occurrences: CursorOccurrence[]): void {
        for (const occurrence of occurrences) {
            this._occurrences.splice(
                this.findInsertionIndex(occurrence),
                0,
                occurrence
            );
        }
    }

    /**
     * Clears all cursor occurrences.
     */
    clearOccurrences(): void {
        this._occurrences.length = 0;
    }

    /**
     * Finds the insertion index of a cursor occurrence.
     *
     * @param occurrence The cursor occurrence.
     */
    private findInsertionIndex(occurrence: CursorOccurrence): number {
        for (let i = 0; i < this._occurrences.length; ++i) {
            if (this._occurrences[i].time > occurrence.time) {
                return i - 1;
            }
        }

        return this._occurrences.length;
    }
}
