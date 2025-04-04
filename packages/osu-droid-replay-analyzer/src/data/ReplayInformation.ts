import { Accuracy, ModMap, ScoreRank } from "@rian8337/osu-base";
import { CursorData } from "./CursorData";
import { ReplayObjectData } from "./ReplayObjectData";

/**
 * Contains information about a replay.
 */
export interface ReplayInformation {
    /**
     * The version of the replay.
     */
    replayVersion: number;

    /**
     * The folder name containing the beatmap played.
     */
    folderName: string;

    /**
     * The file name of the beatmap played.
     */
    fileName: string;

    /**
     * The MD5 hash of the beatmap played.
     */
    hash: string;

    /**
     * The date of which the play was set.
     *
     * Only available in replay v3 or later.
     */
    time: Date;

    /**
     * The amount of geki and 300 katu achieved in the play. See {@link https://osu.ppy.sh/help/wiki/Score this} osu! wiki page for more information.
     *
     * Only available in replay v3 or later.
     *
     * If `map` is defined in analyzer (either in `Beatmap` or `DroidDifficultyCalculator` instance), this will be analyzed using beatmap hitobject information and replay hitobject data for replay v1 and v2.
     */
    hit300k: number;

    /**
     * The amount of 100 katu achieved in the play. See {@link https://osu.ppy.sh/help/wiki/Score this} osu! wiki page for more information.
     *
     * Only available in replay v3 or later.
     *
     * If `map` is defined in analyzer (either in `Beatmap` or `DroidDifficultyCalculator` instance), this will be analyzed using beatmap hitobject information and replay hitobject data for replay v1 and v2.
     */
    hit100k: number;

    /**
     * The total score achieved in the play.
     *
     * Only available in replay v3 or later.
     */
    score: number;

    /**
     * The maximum combo achieved in the play.
     *
     * Only available in replay v3 or later.
     */
    maxCombo: number;

    /**
     * The accuracy achieved in the play.
     */
    accuracy: Accuracy;

    /**
     * Whether or not the play achieved the beatmap's maximum combo.
     *
     * Only available in replay v3 or later.
     */
    isFullCombo: boolean;

    /**
     * The name of the player in the replay.
     *
     * Only available in replay v3 or later.
     */
    playerName: string;

    /**
     * The achieved rank in the play.
     */
    rank: ScoreRank;

    /**
     * Enabled modifications during the play that have been converted to their respective `Mod` instances.
     *
     * Only available in replay v3 or later.
     */
    convertedMods: ModMap;

    /**
     * The cursor movement data of the replay.
     */
    readonly cursorMovement: CursorData[];

    /**
     * The hit object data of the replay.
     */
    readonly hitObjectData: ReplayObjectData[];
}
