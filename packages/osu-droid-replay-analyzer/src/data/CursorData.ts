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
 * Stores cursor movement data in the form of `CursorOccurrence`s.
 *
 * This is used when analyzing replays using replay analyzer.
 */
export class CursorData {
    /**
     * The occurrences of this cursor instance.
     */
    occurrences: CursorOccurrence[] = [];

    constructor(values: CursorInformation) {
        for (let i = 0; i < values.size; ++i) {
            this.occurrences.push(
                new CursorOccurrence(
                    values.time[i],
                    values.x[i],
                    values.y[i],
                    values.id[i]
                )
            );
        }
    }
}
