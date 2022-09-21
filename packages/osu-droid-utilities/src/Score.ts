import {
    Accuracy,
    Mod,
    ModUtil,
    DroidAPIRequestBuilder,
    RequestResponse,
    IModApplicableToDroid,
} from "@rian8337/osu-base";
import { ReplayAnalyzer } from "@rian8337/osu-droid-replay-analyzer";

interface ScoreInformation {
    /**
     * The uid of the player.
     */
    uid?: number;

    /**
     * The ID of the score.
     */
    scoreID?: number;

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
    rank: string;

    /**
     * The date of which the play was set.
     */
    date: Date | number;

    /**
     * The accuracy achieved in the play.
     */
    accuracy: Accuracy;

    /**
     * Enabled modifications in the score, including force AR and custom speed multiplier.
     */
    mods: string;

    /**
     * MD5 hash of the play.
     */
    hash: string;
}

/**
 * Represents an osu!droid score.
 */
export class Score {
    /**
     * The uid of the player.
     */
    uid: number;

    /**
     * The ID of the score.
     */
    scoreID: number;

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
    rank: string;

    /**
     * The date of which the play was set.
     */
    date: Date;

    /**
     * The accuracy achieved in the play.
     */
    accuracy: Accuracy;

    /**
     * Enabled modifications in the score.
     */
    mods: (Mod & IModApplicableToDroid)[];

    /**
     * MD5 hash of the play.
     */
    hash: string;

    /**
     * The speed multiplier of the play.
     */
    speedMultiplier: number = 1;

    /**
     * Whether to use old statistics for this score when calculating with `MapStats`.
     *
     * Otherwise, this denotes whether the score was set in version 1.6.7 or lower.
     */
    oldStatistics: boolean;

    /**
     * The forced AR of the play.
     */
    forcedAR?: number;

    /**
     * The replay of the score.
     */
    replay?: ReplayAnalyzer;

    constructor(values?: ScoreInformation) {
        this.uid = values?.uid ?? 0;
        this.scoreID = values?.scoreID ?? 0;
        this.username = values?.username ?? "";
        this.title = values?.title ?? "";
        this.combo = values?.combo ?? 0;
        this.score = values?.score ?? 0;
        this.rank = values?.rank ?? "";
        this.date = new Date(values?.date ?? 0);
        this.accuracy = values?.accuracy ?? new Accuracy({});
        this.hash = values?.hash ?? "";

        const modstrings: string[] = (values?.mods ?? "").split("|");
        let actualMods: string = "";
        for (let i = 0; i < modstrings.length; ++i) {
            if (!modstrings[i]) {
                continue;
            }

            if (modstrings[i].startsWith("AR")) {
                this.forcedAR = parseFloat(modstrings[i].replace("AR", ""));
            } else if (modstrings[i].startsWith("x")) {
                this.speedMultiplier = parseFloat(
                    modstrings[i].replace("x", "")
                );
            } else {
                actualMods += modstrings[i];
            }
        }

        this.mods = ModUtil.droidStringToMods(actualMods);
        // The pipe was added in 1.6.8 first pre-release (https://github.com/osudroid/osu-droid/commit/c08c406f4b2e535ed1ec43607a72fd8f70f8e316),
        // so we can use that information to infer whether the score was set on version 1.6.7 or lower.
        this.oldStatistics = !(values?.mods ?? "").includes("|");
    }

    /**
     * Retrieves score information on a beatmap from a player.
     *
     * @param uid The uid of the player.
     * @param hash The MD5 hash of the beatmap.
     * @returns The score, `null` if the score is not found.
     */
    static async getFromHash(uid: number, hash: string): Promise<Score | null> {
        const score = new Score();

        const apiRequestBuilder: DroidAPIRequestBuilder =
            new DroidAPIRequestBuilder()
                .setEndpoint("scoresearchv2.php")
                .addParameter("uid", uid)
                .addParameter("hash", hash);

        const result: RequestResponse = await apiRequestBuilder.sendRequest();

        if (result.statusCode !== 200) {
            throw new Error("Error retrieving score data");
        }

        const entry: string[] = result.data.toString("utf-8").split("<br>");

        entry.shift();

        if (entry.length === 0) {
            return null;
        }

        score.fillInformation(entry[0]);

        return score;
    }

    /**
     * Fills this instance with score information.
     *
     * @param info The score information from API response to fill with.
     */
    fillInformation(info: string): Score {
        const play: string[] = info.split(" ");

        this.scoreID = parseInt(play[0]);
        this.uid = parseInt(play[1]);
        this.username = play[2];
        this.score = parseInt(play[3]);
        this.combo = parseInt(play[4]);
        this.rank = play[5];

        const modstrings: string[] = play[6].split("|");
        let actualMods: string = "";
        for (let i = 0; i < modstrings.length; ++i) {
            if (!modstrings[i]) {
                continue;
            }

            if (modstrings[i].startsWith("AR")) {
                this.forcedAR = parseFloat(modstrings[i].replace("AR", ""));
            } else if (modstrings[i].startsWith("x")) {
                this.speedMultiplier = parseFloat(
                    modstrings[i].replace("x", "")
                );
            } else {
                actualMods += modstrings[i];
            }
        }

        this.mods = ModUtil.droidStringToMods(actualMods);
        this.oldStatistics = !play[6].includes("|");

        this.accuracy = new Accuracy({
            n300: parseInt(play[8]),
            n100: parseInt(play[9]),
            n50: parseInt(play[10]),
            nmiss: parseInt(play[11]),
        });
        const date: Date = new Date(parseInt(play[12]) * 1000);
        date.setUTCHours(date.getUTCHours() + 6);
        this.date = date;
        this.title = play[13]
            .substring(0, play[13].length - 4)
            .replace(/_/g, " ");
        this.hash = play[14];
        return this;
    }

    /**
     * Returns the complete mod string of this score (mods, speed multiplier, and force AR combined).
     */
    getCompleteModString(): string {
        let finalString: string = `+${
            this.mods.length > 0 ? this.mods.map((v) => v.acronym) : "No Mod"
        }`;

        if (this.forcedAR !== undefined || this.speedMultiplier !== 1) {
            finalString += " (";
            if (this.forcedAR !== undefined) {
                finalString += `AR${this.forcedAR}`;
            }
            if (this.speedMultiplier !== 1) {
                if (this.forcedAR !== undefined) {
                    finalString += ", ";
                }
                finalString += `${this.speedMultiplier}x`;
            }
            finalString += ")";
        }

        return finalString;
    }

    /**
     * Downloads the replay of this score.
     */
    async downloadReplay(): Promise<void> {
        if (!this.scoreID || this.replay) {
            return;
        }

        this.replay = await new ReplayAnalyzer({
            scoreID: this.scoreID,
        }).analyze();
    }

    /**
     * Returns a string representative of the class.
     */
    toString(): string {
        return `Player: ${this.username}, uid: ${this.uid}, title: ${this.title}, score: ${this.score}, combo: ${this.combo}, rank: ${this.rank}, acc: ${this.accuracy}%, date: ${this.date}, mods: ${this.mods}, hash: ${this.hash}`;
    }
}
