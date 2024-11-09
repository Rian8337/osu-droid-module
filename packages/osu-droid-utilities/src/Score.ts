import {
    Accuracy,
    Mod,
    ModUtil,
    DroidAPIRequestBuilder,
    IModApplicableToDroid,
    ScoreRank,
} from "@rian8337/osu-base";
import { APIScore } from "./APIScore";

/**
 * Represents an osu!droid score.
 */
export class Score {
    /**
     * The ID of the score.
     */
    id: number;

    /**
     * The uid of the player.
     */
    uid: number;

    /**
     * The player's name.
     */
    username: string;

    /**
     * The title of the beatmap.
     */
    title: string;

    /**
     * The maximum combo achieved in the play.
     */
    combo: number;

    /**
     * The score achieved in the play.
     */
    score: number;

    /**
     * The rank achieved in the play.
     */
    rank: ScoreRank;

    /**
     * The date of which the play was set.
     */
    date: Date;

    /**
     * The accuracy achieved in the play.
     */
    accuracy: Accuracy;

    /**
     * The amount of 300s in the play.
     */
    get perfect(): number {
        return this.accuracy.n300;
    }

    /**
     * The amount of 100s in the play.
     */
    get good(): number {
        return this.accuracy.n100;
    }

    /**
     * The amount of 50s in the play.
     */
    get bad(): number {
        return this.accuracy.n50;
    }

    /**
     * The amount of misses in the play.
     */
    get miss(): number {
        return this.accuracy.nmiss;
    }

    /**
     * Enabled modifications in the score.
     */
    mods: (Mod & IModApplicableToDroid)[] = [];

    /**
     * MD5 hash of the play.
     */
    hash: string;

    /**
     * The performance points of the play.
     */
    pp: number | null;

    /**
     * The speed multiplier of the play.
     */
    speedMultiplier = 1;

    /**
     * Whether to use old statistics for this score when calculating with `MapStats`.
     *
     * Otherwise, this denotes whether the score was set in version 1.6.7 or lower.
     */
    oldStatistics = false;

    /**
     * The force CS of the play.
     */
    forceCS?: number;

    /**
     * The force AR of the play.
     */
    forceAR?: number;

    /**
     * The force OD of the play.
     */
    forceOD?: number;

    /**
     * The force HP of the play.
     */
    forceHP?: number;

    /**
     * The follow delay set for the FL mod, in seconds.
     */
    flashlightFollowDelay?: number;

    /**
     * The complete mod string of this score (mods, speed multiplier, and force AR combined).
     */
    get completeModString(): string {
        let finalString = `+${
            this.mods.length > 0 ? this.mods.map((v) => v.acronym) : "No Mod"
        }`;

        const customStats: string[] = [];

        if (this.speedMultiplier !== 1) {
            customStats.push(`${this.speedMultiplier}x`);
        }

        if (this.forceAR !== undefined) {
            customStats.push(`AR${this.forceAR}`);
        }

        if (this.forceOD !== undefined) {
            customStats.push(`OD${this.forceOD}`);
        }

        if (this.forceCS !== undefined) {
            customStats.push(`CS${this.forceCS}`);
        }

        if (this.forceHP !== undefined) {
            customStats.push(`HP${this.forceHP}`);
        }

        if (this.flashlightFollowDelay !== undefined) {
            customStats.push(`FLD${this.flashlightFollowDelay}`);
        }

        if (customStats.length > 0) {
            finalString += ` (${customStats.join(", ")})`;
        }

        return finalString;
    }

    constructor(apiScore: APIScore) {
        this.id = apiScore.id;
        this.uid = apiScore.uid;
        this.username = apiScore.username;
        this.title = apiScore.filename;
        this.combo = apiScore.combo;
        this.score = apiScore.score;
        this.rank = apiScore.mark;
        this.date = new Date(apiScore.date * 1000);

        this.accuracy = new Accuracy({
            n300: apiScore.perfect,
            n100: apiScore.good,
            n50: apiScore.bad,
            nmiss: apiScore.miss,
        });

        this.hash = apiScore.hash;
        this.pp = apiScore.pp;

        this.parseMods(apiScore.mode);
    }

    /**
     * Retrieves score information on a beatmap from a player.
     *
     * @param uid The uid of the player.
     * @param hash The MD5 hash of the beatmap.
     * @returns The score, `null` if the score is not found.
     */
    static async getFromHash(uid: number, hash: string): Promise<Score | null> {
        const apiRequestBuilder = new DroidAPIRequestBuilder()
            .setEndpoint("scoresearchv2.php")
            .addParameter("uid", uid)
            .addParameter("hash", hash);

        const result = await apiRequestBuilder.sendRequest();

        if (result.statusCode !== 200) {
            throw new Error("Error retrieving score data");
        }

        let response: APIScore;

        try {
            response = JSON.parse(result.data.toString("utf-8"));
        } catch {
            return null;
        }

        return new Score(response);
    }

    /**
     * Returns a string representative of the class.
     */
    toString(): string {
        return `Player: ${this.username}, uid: ${this.uid}, title: ${this.title}, score: ${this.score}, combo: ${this.combo}, rank: ${this.rank}, acc: ${this.accuracy}%, date: ${this.date}, mods: ${this.mods}, hash: ${this.hash}`;
    }

    /**
     * Parses a modstring returned from the osu!droid API or replay.
     *
     * @param str The modstring.
     */
    private parseMods(str: string): void {
        const modstrings = str.split("|");
        let actualMods = "";

        for (const str of modstrings) {
            if (!str) {
                continue;
            }

            switch (true) {
                // Forced stats
                case str.startsWith("CS"):
                    this.forceCS = parseFloat(str.replace("CS", ""));
                    break;

                case str.startsWith("AR"):
                    this.forceAR = parseFloat(str.replace("AR", ""));
                    break;

                case str.startsWith("OD"):
                    this.forceOD = parseFloat(str.replace("OD", ""));
                    break;

                case str.startsWith("HP"):
                    this.forceHP = parseFloat(str.replace("HP", ""));
                    break;

                // FL follow delay
                case str.startsWith("FLD"):
                    this.flashlightFollowDelay = parseFloat(
                        str.replace("FLD", ""),
                    );
                    break;

                // Speed multiplier
                case str.startsWith("x"):
                    this.speedMultiplier = parseFloat(str.replace("x", ""));
                    break;

                default:
                    actualMods += str;
            }
        }

        this.mods = ModUtil.droidStringToMods(actualMods);

        // The pipe was added in 1.6.8 first pre-release (https://github.com/osudroid/osu-droid/commit/c08c406f4b2e535ed1ec43607a72fd8f70f8e316),
        // so we can use that information to infer whether the score was set on version 1.6.7 or lower.
        this.oldStatistics = !str.includes("|");
    }
}
