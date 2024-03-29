import {
    DroidAPIRequestBuilder,
    RequestResponse,
    Accuracy,
} from "@rian8337/osu-base";
import { Score } from "./Score";

interface ExtraInformation {
    readonly rank: number;
    readonly recent: {
        readonly filename: string;
        readonly score: number;
        readonly scoreid: number;
        readonly combo: number;
        readonly mark: string;
        readonly mode: string;
        readonly accuracy: number;
        readonly perfect: number;
        readonly good: number;
        readonly bad: number;
        readonly miss: number;
        readonly date: number;
        readonly hash: string;
    }[];
}

/**
 * Represents an osu!droid player.
 */
export class Player {
    /**
     * The uid of the player.
     */
    uid: number = 0;

    /**
     * The username of the player.
     */
    username: string = "";

    /**
     * The avatar URL of the player.
     */
    avatarURL: string = "";

    /**
     * The location of the player based on ISO 3166-1 country codes. See {@link https://en.wikipedia.org/wiki/ISO_3166-1 this} Wikipedia page for more information.
     */
    location: string = "";

    /**
     * The email that is attached to the player's account.
     */
    email: string = "";

    /**
     * The overall rank of the player.
     */
    rank: number = 0;

    /**
     * The total score of the player.
     */
    score: number = 0;

    /**
     * The overall accuracy of the player.
     */
    accuracy: number = 0;

    /**
     * The amount of times the player has played.
     */
    playCount: number = 0;

    /**
     * Recent plays of the player.
     */
    readonly recentPlays: Score[] = [];

    /**
     * Retrieves a player's info based on their username.
     *
     * @param uidOrUsername The uid or username of the player.
     * @returns The player, `null` if the player is not found.
     */
    static async getInformation(
        uidOrUsername: string | number
    ): Promise<Player | null> {
        const player: Player = new Player();

        const apiRequestBuilder: DroidAPIRequestBuilder =
            new DroidAPIRequestBuilder()
                .setEndpoint("getuserinfo.php")
                .addParameter(
                    typeof uidOrUsername === "number" ? "uid" : "username",
                    uidOrUsername
                );

        const result: RequestResponse = await apiRequestBuilder.sendRequest();
        if (result.statusCode !== 200) {
            throw new Error("Error retrieving player data");
        }

        const data: string = result.data.toString("utf-8");
        const resArr: string[] = data.split("<br>");
        const headerRes: string[] = resArr[0].split(" ");

        if (headerRes[0] === "FAILED") {
            return null;
        }

        player.fillInformation(data);

        return player;
    }

    /**
     * Fills this instance with player information.
     *
     * @param info The player information from API response to fill with.
     */
    fillInformation(info: string): Player {
        const resArr: string[] = info.split("<br>");
        const headerRes: string[] = resArr[0].split(" ");

        if (headerRes[0] === "FAILED") {
            return this;
        }

        const obj: ExtraInformation = JSON.parse(resArr[1]);

        this.uid = parseInt(headerRes[1]);
        this.username = headerRes[2];
        this.score = parseInt(headerRes[3]);
        this.playCount = parseInt(headerRes[4]);
        this.accuracy = parseFloat((parseFloat(headerRes[5]) * 100).toFixed(2));
        this.email = headerRes[6];
        this.location = headerRes[7];
        this.avatarURL = `https://osudroid.moe/user/avatar?id=${this.uid}`;
        this.rank = obj.rank;

        const recent: ExtraInformation["recent"] = obj.recent;
        for (const play of recent) {
            // https://stackoverflow.com/a/63199512
            const date: Date = new Date((play.date + 3600 * 8) * 1000);
            const tz: string = date
                .toLocaleString("en", {
                    timeZone: "Europe/Berlin",
                    timeStyle: "long",
                })
                .split(" ")
                .slice(-1)[0];
            const dateString: string = date.toString();
            const msOffset: number =
                Date.parse(`${dateString} UTC`) -
                Date.parse(`${dateString} ${tz}`);

            this.recentPlays.push(
                new Score({
                    uid: this.uid,
                    username: this.username,
                    scoreID: play.scoreid,
                    score: play.score,
                    accuracy: new Accuracy({
                        n300: play.perfect,
                        n100: play.good,
                        n50: play.bad,
                        nmiss: play.miss,
                    }),
                    rank: play.mark,
                    combo: play.combo,
                    title: play.filename,
                    date: date.getTime() - msOffset,
                    mods: play.mode,
                    hash: play.hash,
                })
            );
        }

        return this;
    }

    /**
     * Returns a string representative of the class.
     */
    toString(): string {
        return `Username: ${this.username}\nUID: ${this.uid}\nRank: ${this.rank}\nScore: ${this.score}\nPlay count: ${this.playCount}`;
    }
}
