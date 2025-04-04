import {
    Accuracy,
    DroidAPIRequestBuilder,
    DroidLegacyModConverter,
    ModMap,
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
    readonly mods: ModMap;

    /**
     * MD5 hash of the play.
     */
    hash: string;

    /**
     * The performance points of the play.
     */
    pp: number | null;

    constructor(apiScore: APIScore) {
        this.id = apiScore.id;
        this.uid = apiScore.uid;
        this.username = apiScore.username;
        this.title = apiScore.filename;
        this.combo = apiScore.combo;
        this.score = apiScore.score;
        this.rank = apiScore.mark;
        this.date = new Date(apiScore.date * 1000);
        this.mods = DroidLegacyModConverter.convert(apiScore.mode);

        this.accuracy = new Accuracy({
            n300: apiScore.perfect,
            n100: apiScore.good,
            n50: apiScore.bad,
            nmiss: apiScore.miss,
        });

        this.hash = apiScore.hash;
        this.pp = apiScore.pp;
    }

    /**
     * Retrieves score information on a beatmap from a player.
     *
     * @param uid The uid of the player.
     * @param hash The MD5 hash of the beatmap.
     * @param bestPP Whether to retrieve the score in terms of the best performance points rather than best score. Defaults to `false`.
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

        let response: APIScore[];

        try {
            response = JSON.parse(result.data.toString("utf-8"));
        } catch {
            return null;
        }

        if (response.length === 0) {
            return null;
        }

        return new Score(response[0]);
    }

    /**
     * Returns a string representative of the class.
     */
    toString(): string {
        return `Player: ${this.username}, uid: ${this.uid}, title: ${this.title}, score: ${this.score}, combo: ${this.combo}, rank: ${this.rank}, acc: ${this.accuracy}%, date: ${this.date}, mods: ${this.mods}, hash: ${this.hash}`;
    }
}
