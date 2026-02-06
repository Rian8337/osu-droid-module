import { DroidAPIRequestBuilder } from "@rian8337/osu-base";
import { Score } from "./Score";
import { APIPlayer } from "./APIPlayer";

/**
 * Represents an osu!droid player.
 */
export class Player {
    /**
     * The user ID of the player.
     */
    id = 0;

    /**
     * The username of the player.
     */
    username = "";

    /**
     * The avatar URL of the player.
     */
    get avatarUrl(): string {
        return `https://osudroid.moe/user/avatar?id=${this.id.toString()}`;
    }

    /**
     * The location of the player based on ISO 3166-1 country codes. See {@link https://en.wikipedia.org/wiki/ISO_3166-1 this} Wikipedia page for more information.
     */
    location = "";

    /**
     * The overall rank of the player.
     */
    rank = 0;

    /**
     * The total score of the player.
     */
    score = 0;

    /**
     * The total performance points of the player.
     */
    pp = 0;

    /**
     * The overall accuracy of the player.
     */
    accuracy = 0;

    /**
     * The amount of times the player has played.
     */
    playCount = 0;

    /**
     * Recent plays of the player.
     */
    readonly recentPlays: Score[] = [];

    constructor(apiPlayer: APIPlayer) {
        this.id = apiPlayer.id;
        this.username = apiPlayer.username;
        this.score = apiPlayer.score;
        this.playCount = apiPlayer.playcount;
        this.accuracy = apiPlayer.accuracy * 100;
        this.location = apiPlayer.region;
        this.rank = apiPlayer.rank;
        this.pp = apiPlayer.pp;

        for (const score of apiPlayer.recent) {
            this.recentPlays.push(
                new Score({
                    ...score,
                    uid: this.id,
                    username: this.username,
                }),
            );
        }
    }

    /**
     * Retrieves a player's info based on their username.
     *
     * @param uidOrUsername The uid or username of the player.
     * @returns The player, `null` if the player is not found.
     */
    static async getInformation(
        uidOrUsername: string | number,
    ): Promise<Player | null> {
        const apiRequestBuilder = new DroidAPIRequestBuilder()
            .setEndpoint("getuserinfo.php")
            .addParameter(
                typeof uidOrUsername === "number" ? "uid" : "username",
                uidOrUsername,
            );

        const result = await apiRequestBuilder.sendRequest();
        if (result.statusCode !== 200) {
            throw new Error("Error retrieving player data");
        }

        let response: APIPlayer;

        try {
            response = JSON.parse(result.data.toString("utf-8")) as APIPlayer;
        } catch {
            return null;
        }

        if (!response.id) {
            return null;
        }

        return new Player(response);
    }

    /**
     * Returns a string representative of the class.
     */
    toString(): string {
        return `Username: ${this.username}\nUID: ${this.id.toString()}\nRank: ${this.rank.toString()}\nScore: ${this.score.toString()}\nPlay count: ${this.playCount.toString()}`;
    }
}
