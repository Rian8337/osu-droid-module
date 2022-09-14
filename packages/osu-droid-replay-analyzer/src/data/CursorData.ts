import { movementType } from "../constants/movementType";
import { CursorOccurrence } from "./CursorOccurrence";
import { CursorOccurrenceGroup } from "./CursorOccurrenceGroup";

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
 * Stores cursor movement data in the form of `CursorOccurrenceGroup`s.
 *
 * This is used when analyzing replays using replay analyzer.
 */
export class CursorData {
    /**
     * The occurrence groups of this cursor instance.
     */
    occurrenceGroups: CursorOccurrenceGroup[] = [];

    /**
     * The time at which the first occurrence of this cursor instance occurs.
     *
     * Will return `null` if there are no occurrences.
     */
    get earliestOccurrenceTime(): number | null {
        return this.occurrenceGroups.at(0)?.startTime ?? null;
    }

    /**
     * The time at which the latest occurrence of this cursor instance occurs.
     *
     * Will return `null` if there are no occurrences.
     */
    get latestOccurrenceTime(): number | null {
        return this.occurrenceGroups.at(-1)?.endTime ?? null;
    }

    /**
     * The amount of cursor occurrences of this cursor instance.
     */
    get totalOccurrences(): number {
        return this.occurrenceGroups.reduce((a, v) => {
            // Down cursor.
            ++a;

            // Move cursors.
            a += v.moves.length;

            if (v.up) {
                // Up cursor.
                ++a;
            }

            return a;
        }, 0);
    }

    /**
     * All cursor occurrences of this cursor instnace.
     *
     * This iterates all occurrence groups and as such should be used sparingly or stored locally.
     */
    get allOccurrences(): CursorOccurrence[] {
        return this.occurrenceGroups.flatMap((v) => v.allOccurrences);
    }

    constructor(values: CursorInformation) {
        let downOccurrence: CursorOccurrence | null = null;
        let moveOccurrences: CursorOccurrence[] = [];

        for (let i = 0; i < values.size; ++i) {
            const occurrence: CursorOccurrence = new CursorOccurrence(
                values.time[i],
                values.x[i],
                values.y[i],
                values.id[i]
            );

            switch (occurrence.id) {
                case movementType.DOWN:
                    downOccurrence = occurrence;
                    break;
                case movementType.MOVE:
                    moveOccurrences.push(occurrence);
                    break;
                case movementType.UP:
                    this.occurrenceGroups.push(
                        new CursorOccurrenceGroup(
                            // Guaranteed to be non-null.
                            downOccurrence!,
                            moveOccurrences,
                            occurrence
                        )
                    );
                    downOccurrence = null;
                    moveOccurrences = [];
            }
        }

        // Add the final cursor occurrence group as the loop may not catch it for special cases.
        if (downOccurrence !== null && moveOccurrences.length > 0) {
            this.occurrenceGroups.push(
                new CursorOccurrenceGroup(downOccurrence, moveOccurrences)
            );
        }
    }
}
