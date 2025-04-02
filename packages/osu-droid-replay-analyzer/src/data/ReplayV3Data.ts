import { Mod, IModApplicableToDroid } from "@rian8337/osu-base";
import { ReplayData } from "./ReplayData";
import { ReplayInformation } from "./ReplayInformation";

/**
 * Represents a replay data for replay version 3.
 *
 * Stores generic information about an osu!droid replay.
 *
 * This is used when analyzing replays using replay analyzer.
 */
export class ReplayV3Data extends ReplayData {
    /**
     * The date of which the play was set.
     */
    readonly time: Date;

    /**
     * The total score achieved in the play.
     */
    readonly score: number;

    /**
     * The maximum combo achieved in the play.
     */
    readonly maxCombo: number;

    /**
     * Whether or not the play achieved the beatmap's maximum combo.
     */
    readonly isFullCombo: boolean;

    /**
     * The name of the player in the replay.
     */
    readonly playerName: string;

    /**
     * Enabled modifications during the play that have been converted to their respective `Mod` instances.
     */
    readonly convertedMods: (Mod & IModApplicableToDroid)[];

    constructor(values: ReplayInformation) {
        super(values);

        this.time = values.time;
        this.score = values.score;
        this.maxCombo = values.maxCombo;
        this.isFullCombo = values.isFullCombo;
        this.playerName = values.playerName;
        this.convertedMods = values.convertedMods;
    }
}
