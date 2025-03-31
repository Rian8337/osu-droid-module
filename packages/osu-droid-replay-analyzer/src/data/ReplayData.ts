import { Accuracy, ScoreRank } from "@rian8337/osu-base";
import { CursorData } from "./CursorData";
import { ReplayObjectData } from "./ReplayObjectData";
import { ReplayInformation } from "./ReplayInformation";
import type { ReplayV3Data } from "./ReplayV3Data";

/**
 * Represents a replay data in an osu!droid replay version 1 and 2.
 *
 * Stores generic information about an osu!droid replay.
 *
 * This is used when analyzing replays using replay analyzer.
 */
export class ReplayData {
    /**
     * The version of the replay.
     */
    readonly replayVersion: number;

    /**
     * The folder name containing the beatmap played.
     */
    readonly folderName: string;

    /**
     * The file name of the beatmap played.
     */
    readonly fileName: string;

    /**
     * The MD5 hash of the beatmap played.
     */
    readonly hash: string;

    /**
     * The accuracy achieved in the play.
     */
    readonly accuracy: Accuracy;

    /**
     * The achieved rank in the play.
     */
    readonly rank: ScoreRank;

    /**
     * The amount of geki and 300 katu achieved in the play. See {@link https://osu.ppy.sh/help/wiki/Score this}
     * osu! wiki page for more information.
     *
     * Only available in replay v3 or later, but if `map` was defined in when analyzing the replay,
     * this will be analyzed using beatmap hitobject information and replay hitobject data for replay v1
     * and v2. Otherwise, this will be 0.
     */
    readonly hit300k: number;

    /**
     * The amount of 100 katu achieved in the play. See {@link https://osu.ppy.sh/help/wiki/Score this}
     * osu! wiki page for more information.
     *
     * Only available in replay v3 or later, but if `map` was defined in when analyzing the replay,
     * this will be analyzed using beatmap hitobject information and replay hitobject data for replay v1
     * and v2. Otherwise, this will be 0.
     */
    readonly hit100k: number;

    /**
     * The cursor movement data of the replay.
     */
    readonly cursorMovement: CursorData[];

    /**
     * The hit object data of the replay.
     */
    readonly hitObjectData: ReplayObjectData[];

    constructor(values: ReplayInformation) {
        this.replayVersion = values.replayVersion;
        this.folderName = values.folderName;
        this.fileName = values.fileName;
        this.hash = values.hash;
        this.accuracy = values.accuracy;
        this.rank = values.rank;
        this.hit300k = values.hit300k;
        this.hit100k = values.hit100k;
        this.cursorMovement = values.cursorMovement;
        this.hitObjectData = values.hitObjectData;
    }

    /**
     * Whether the replay's version is 3 or later.
     */
    isReplayV3(): this is ReplayV3Data {
        return this.replayVersion >= 3;
    }
}
