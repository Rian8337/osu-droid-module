import {
    Accuracy,
    Mod,
    ModUtil,
    DroidAPIRequestBuilder,
    RequestResponse,
    IModApplicableToDroid,
} from "@rian8337/osu-base";

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
        let finalString: string = `+${
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

        this.mods = [];
        this.oldStatistics = false;

        this.parseMods(values?.mods ?? "");
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

        this.parseMods(play[6]);

        this.accuracy = new Accuracy({
            n300: parseInt(play[8]),
            n100: parseInt(play[9]),
            n50: parseInt(play[10]),
            nmiss: parseInt(play[11]),
        });

        const date: Date = new Date(parseInt(play[12]) * 1000);
        date.setUTCHours(date.getUTCHours() + 8);

        // https://stackoverflow.com/a/63199512
        const tz: string = date
            .toLocaleString("en", {
                timeZone: "Europe/Berlin",
                timeStyle: "long",
            })
            .split(" ")
            .slice(-1)[0];
        const dateString: string = date.toString();
        const msOffset: number =
            Date.parse(`${dateString} UTC`) - Date.parse(`${dateString} ${tz}`);
        date.setUTCMilliseconds(date.getUTCMilliseconds() - msOffset);

        this.date = date;
        this.title = play[13]
            .substring(0, play[13].length - 4)
            .replace(/_/g, " ");
        this.hash = play[14];
        return this;
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
        const modstrings: string[] = str.split("|");
        let actualMods: string = "";

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
