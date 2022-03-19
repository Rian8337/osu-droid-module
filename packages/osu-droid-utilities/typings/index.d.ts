declare module "@rian8337/osu-droid-utilities" {
    import { Accuracy, Mod } from "@rian8337/osu-base";
    import { ReplayAnalyzer } from "@rian8337/osu-droid-replay-analyzer";

    //#region Classes

    /**
     * Represents an osu!droid player.
     */
    export class Player {
        /**
         * The uid of the player.
         */
        uid: number;
        /**
         * The username of the player.
         */
        username: string;
        /**
         * The avatar URL of the player.
         */
        avatarURL: string;
        /**
         * The location of the player based on ISO 3166-1 country codes. See {@link https://en.wikipedia.org/wiki/ISO_3166-1 this} Wikipedia page for more information.
         */
        location: string;
        /**
         * The email that is attached to the player's account.
         */
        email: string;
        /**
         * The overall rank of the player.
         */
        rank: number;
        /**
         * The total score of the player.
         */
        score: number;
        /**
         * The overall accuracy of the player.
         */
        accuracy: number;
        /**
         * The amount of times the player has played.
         */
        playCount: number;
        /**
         * Recent plays of the player.
         */
        readonly recentPlays: Score[];
        /**
         * Retrieves a player's info based on uid or username.
         *
         * Either uid or username must be specified.
         */
        static getInformation(params: {
            uid?: number;
            username?: string;
        }): Promise<Player>;
        /**
         * Fills this instance with player information.
         *
         * @param info The player information from API response to fill with.
         */
        fillInformation(info: string): Player;
        /**
         * Returns a string representative of the class.
         */
        toString(): string;
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
         * Enabled modifications.
         */
        mods: Mod[];

        /**
         * The MD5 hash of the play.
         */
        hash: string;

        /**
         * The speed multiplier of the play.
         */
        speedMultiplier: number;
        /**
         * The forced AR of the play.
         */
        forcedAR?: number;
        /**
         * The replay of the score.
         */
        replay?: ReplayAnalyzer;
        constructor(values?: ScoreInformation);
        /**
         * Retrieves play information.
         *
         * @param values Function parameters.
         */
        static getFromHash(params: {
            /**
             * The uid of the player.
             */
            uid: number;
            /**
             * The MD5 hash to retrieve.
             */
            hash: string;
        }): Promise<Score>;
        /**
         * Fills this instance with score information.
         *
         * @param info The score information from API response to fill with.
         */
        fillInformation(info: string): Score;
        /**
         * Returns the complete mod string of this score (mods, speed multiplier, and force AR combined).
         */
        getCompleteModString(): string;
        /**
         * Downloads the replay of this score.
         */
        downloadReplay(): Promise<void>;
        /**
         * Returns a string representative of the class.
         */
        toString(): string;
    }

    //#endregion

    //#region Interfaces

    export interface ScoreInformation {
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
         * Enabled modifications in the play.
         */
        mods: Mod[];
        /**
         * MD5 hash of the play.
         */
        hash: string;
    }

    //#endregion
}
