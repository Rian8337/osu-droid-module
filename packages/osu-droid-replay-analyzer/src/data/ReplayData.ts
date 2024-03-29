import { Accuracy, IModApplicableToDroid, Mod } from "@rian8337/osu-base";
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
    time?: Date;

    /**
     * The amount of geki and 300 katu achieved in the play. See {@link https://osu.ppy.sh/help/wiki/Score this} osu! wiki page for more information.
     *
     * Only available in replay v3 or later.
     *
     * If `beatmap` is defined in analyzer (either in `Beatmap` or `DroidDifficultyCalculator` instance), this will be analyzed using beatmap hitobject information and replay hitobject data for replay v1 and v2.
     */
    hit300k?: number;

    /**
     * The amount of 100 katu achieved in the play. See {@link https://osu.ppy.sh/help/wiki/Score this} osu! wiki page for more information.
     *
     * Only available in replay v3 or later.
     *
     * If `beatmap` is defined in analyzer (either in `Beatmap` or `DroidDifficultyCalculator` instance), this will be analyzed using beatmap hitobject information and replay hitobject data for replay v1 and v2.
     */
    hit100k?: number;

    /**
     * The total score achieved in the play.
     *
     * Only available in replay v3 or later.
     */
    score?: number;

    /**
     * The maximum combo achieved in the play.
     *
     * Only available in replay v3 or later.
     */
    maxCombo?: number;

    /**
     * The accuracy achieved in the play.
     */
    accuracy: Accuracy;

    /**
     * Whether or not the play achieved the beatmap's maximum combo.
     *
     * Only available in replay v3 or later.
     */
    isFullCombo?: boolean;

    /**
     * The name of the player in the replay.
     *
     * Only available in replay v3 or later.
     */
    playerName?: string;

    /**
     * Enabled modifications during the play in raw Java object format.
     *
     * Only available in replay v3 or later.
     */
    rawMods?: string;

    /**
     * The achieved rank in the play.
     */
    rank: string;

    /**
     * Enabled modifications during the play in osu!standard format.
     *
     * Only available in replay v3 or later.
     */
    convertedMods?: (Mod & IModApplicableToDroid)[];

    /**
     * The speed multiplier of the replay.
     *
     * Only available in replay v4 or later. By default this is 1.
     */
    speedMultiplier?: number;

    /**
     * The force CS of the replay.
     *
     * Only available in replay v5 or later.
     */
    forceCS?: number;

    /**
     * The force AR of the replay.
     *
     * Only available in replay v4 or later.
     */
    forceAR?: number;

    /**
     * The force OD of the replay.
     *
     * Only available in replay v5 or later.
     */
    forceOD?: number;

    /**
     * The force HP of the replay.
     *
     * Only available in replay v5 or later.
     */
    forceHP?: number;

    /**
     * The follow delay set for the FL mod, in seconds.
     *
     * Only available in replay v5 orlater. By default this is 0.12.
     */
    flashlightFollowDelay?: number;

    /**
     * The cursor movement data of the replay.
     */
    cursorMovement: CursorData[];

    /**
     * The hit object data of the replay.
     */
    hitObjectData: ReplayObjectData[];
}

/**
 * Represents a replay data in an osu!droid replay.
 *
 * Stores generic information about an osu!droid replay such as player name, MD5 hash, time set, etc.
 *
 * This is used when analyzing replays using replay analyzer.
 */
export class ReplayData implements ReplayInformation {
    readonly replayVersion: number;
    readonly folderName: string;
    readonly fileName: string;
    readonly hash: string;
    readonly time: Date;
    readonly hit300k: number;
    readonly hit100k: number;
    readonly score: number;
    readonly maxCombo: number;
    readonly accuracy: Accuracy;
    readonly isFullCombo: boolean;
    readonly playerName: string;
    readonly rawMods: string;
    readonly rank: string;
    readonly convertedMods: (Mod & IModApplicableToDroid)[];
    readonly cursorMovement: CursorData[];
    readonly hitObjectData: ReplayObjectData[];
    readonly speedMultiplier: number;
    readonly forceCS?: number;
    readonly forceAR?: number;
    readonly forceOD?: number;
    readonly forceHP?: number;
    readonly flashlightFollowDelay?: number;

    constructor(values: ReplayInformation) {
        this.replayVersion = values.replayVersion;
        this.folderName = values.folderName;
        this.fileName = values.fileName;
        this.hash = values.hash;
        this.time = new Date(values.time || 0);
        this.hit300k = values.hit300k || 0;
        this.hit100k = values.hit100k || 0;
        this.score = values.score || 0;
        this.maxCombo = values.maxCombo || 0;
        this.accuracy = values.accuracy || new Accuracy({});
        this.isFullCombo = values.isFullCombo || false;
        this.playerName = values.playerName || "";
        this.rawMods = values.rawMods || "";
        this.rank = values.rank || "";
        this.convertedMods = values.convertedMods || [];
        this.cursorMovement = values.cursorMovement;
        this.hitObjectData = values.hitObjectData;
        this.speedMultiplier = values.speedMultiplier || 1;
        this.forceCS = values.forceCS;
        this.forceAR = values.forceAR;
        this.forceOD = values.forceOD;
        this.forceHP = values.forceHP;
        this.flashlightFollowDelay = values.flashlightFollowDelay;
    }
}
