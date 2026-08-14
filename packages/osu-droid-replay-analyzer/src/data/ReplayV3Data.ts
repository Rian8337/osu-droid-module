import {
    BeatmapDifficulty,
    DroidLegacyScoreMultiplierCalculator,
    DroidScoreMultiplierCalculator,
    ModMap,
} from "@rian8337/osu-base";
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
     * The {@link getTotalScore} method can be used to get the total score across all replay versions.
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
     * Obtains the total score achieved in the play, after applying score multiplier from mods.
     *
     * @param difficulty The `BeatmapDifficulty` of the beatmap that was played. Required to correctly compute
     * the score multiplier of difficulty-dependent mods. If not provided, those mods fall back to their
     * difficulty-independent multiplier.
     */
    getTotalScore(difficulty: BeatmapDifficulty | null = null): number {
        let baseScore = this.score;

        if (this.replayVersion < 8) {
            // Replay versions 3 to 7 store the score after applying score multiplier
            // from mods, so we need to reverse it to get the base score.
            const legacyScoreMultiplier = new DroidLegacyScoreMultiplierCalculator(
                difficulty,
            ).calculateFor(this.convertedMods.values());

            baseScore = Math.round(this.score / legacyScoreMultiplier);
        }

        const scoreMultiplier = new DroidScoreMultiplierCalculator(
            difficulty,
        ).calculateFor(this.convertedMods.values());

        return Math.round(baseScore * scoreMultiplier);
    }

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
