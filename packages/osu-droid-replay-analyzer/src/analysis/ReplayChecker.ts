import {
    DroidPlayableBeatmap,
    ModHardRock,
    Playfield,
    Vector2,
} from "@rian8337/osu-base";
import { CursorOccurrence } from "../data/CursorOccurrence";
import { ReplayData } from "../data/ReplayData";

/**
 * Base class for replay checkers.
 */
export abstract class ReplayChecker {
    constructor(
        /**
         * The beatmap that is being analyzed.
         */
        protected readonly beatmap: DroidPlayableBeatmap,

        /**
         * The data of the replay.
         */
        protected readonly data: ReplayData,
    ) {}

    /**
     * Obtains the position of the cursor taking Hard Rock into account.
     *
     * @param cursor The cursor occurrence.
     * @returns The position of the cursor.
     */
    protected getCursorPosition(cursor: CursorOccurrence): Vector2 {
        if (this.beatmap.mods.has(ModHardRock)) {
            return new Vector2(
                cursor.position.x,
                Playfield.baseSize.y - cursor.position.y,
            );
        }

        return cursor.position;
    }
}
