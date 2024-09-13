import { Accuracy, IModApplicableToDroid, Mod } from "@rian8337/osu-base";
import { CursorData } from "./CursorData";
import { ReplayObjectData } from "./ReplayObjectData";
import { Grade } from "./Grade";
import { ReplayInformation } from "./ReplayInformation";

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
    readonly rank: Grade;
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
