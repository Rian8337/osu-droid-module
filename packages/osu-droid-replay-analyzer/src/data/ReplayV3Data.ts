import { Modes, ModMap, ModUtil } from "@rian8337/osu-base";
import { ReplayData } from "./ReplayData";
import { ReplayInformation } from "./ReplayInformation";

/**
 * Represents a replay data for replay version 3 and later.
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
     *
     * Between replay version 3 and 7, this is the final score after applying score multiplier from mods.
     * From replay version 8 onwards, this is the score before applying score multiplier from mods.
     *
     * The {@link totalScore} getter can be used to get the total score across all replay versions.
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
    readonly convertedMods: ModMap;

    /**
     * The total score achieved in the play, after applying score multiplier from mods.
     */
    get totalScore(): number {
        if (this.replayVersion < 8) {
            return this.score;
        }

        this.scoreMultiplier ??= ModUtil.calculateScoreMultiplier(
            this.convertedMods.values(),
            Modes.droid,
        );

        return Math.round(this.score * this.scoreMultiplier);
    }

    private scoreMultiplier?: number;

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
