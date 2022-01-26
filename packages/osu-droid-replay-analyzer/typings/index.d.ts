declare module "@rian8337/osu-droid-replay-analyzer" {
    import { Beatmap, Accuracy, Mod } from "@rian8337/osu-base";
    import { DroidStarRating } from "@rian8337/osu-difficulty-calculator";
    import { DroidStarRating as RebalanceDroidStarRating } from "@rian8337/osu-rebalance-difficulty-calculator";

    //#region Classes

    /**
     * Represents a cursor instance in an osu!droid replay.
     *
     * Stores cursor movement data such as x and y coordinates, movement size, etc.
     *
     * This is used when analyzing replays using replay analyzer.
     */
    export class CursorData implements CursorInformation {
        size: number;
        readonly time: number[];
        readonly x: number[];
        readonly y: number[];
        readonly id: movementType[];
        constructor(values: CursorInformation);
    }

    /**
     * A replay analyzer that analyzes a replay from osu!droid.
     *
     * Created by reverse engineering the replay parser from the game itself, which can be found {@link https://github.com/osudroid/osu-droid/blob/master/src/ru/nsu/ccfit/zuev/osu/scoring/Replay.java here}.
     *
     * Once analyzed, the result can be accessed via the `data` property.
     */
    export class ReplayAnalyzer {
        /**
         * The score ID of the replay.
         */
        scoreID: number;
        /**
         * The original odr file of the replay.
         */
        originalODR: Buffer | null;
        /**
         * The fixed odr file of the replay.
         */
        fixedODR: Buffer | null;
        /**
         * Whether or not the play is considered using >=3 finger abuse.
         */
        is3Finger?: boolean;
        /**
         * Whether or not the play is considered 2-handed.
         */
        is2Hand?: boolean;
        /**
         * The beatmap that is being analyzed. `DroidStarRating` or `RebalanceDroidStarRating` is required for three finger or two hand analyzing.
         */
        map?: Beatmap | DroidStarRating | RebalanceDroidStarRating;
        /**
         * The results of the analyzer. `null` when initialized.
         */
        data: ReplayData | null;
        /**
         * Penalty value used to penalize dpp for 2-hand.
         */
        aimPenalty: number;
        /**
         * Penalty value used to penalize dpp for 3 finger abuse.
         */
        tapPenalty: number;
        /**
         * Whether this replay has been checked against 3 finger usage.
         */
        hasBeenCheckedFor3Finger: boolean;
        /**
         * Whether this replay has been checked against 2 hand usage.
         */
        hasBeenCheckedFor2Hand: boolean;
        private readonly BYTE_LENGTH: number;
        private readonly SHORT_LENGTH: number;
        private readonly INT_LENGTH: number;
        private readonly LONG_LENGTH: number;
        constructor(values: {
            /**
             * The ID of the score.
             */
            scoreID: number;
            /**
             * The beatmap to analyze.
             *
             * `DroidStarRating` or `RebalanceDroidStarRating` is required for three finger or two hand analyzing.
             */
            map?: Beatmap | DroidStarRating | RebalanceDroidStarRating;
        });
        /**
         * Analyzes a replay.
         */
        analyze(): Promise<ReplayAnalyzer>;
        /**
         * Downloads the given score ID's replay.
         */
        private downloadReplay(): Promise<Buffer | null>;
        /**
         * Decompresses a replay.
         *
         * The decompressed replay is in a form of Java object. This will be converted to a buffer and deserialized to read data from the replay.
         */
        private decompress(): Promise<Buffer>;
        /**
         * Parses a replay after being downloaded and converted to a buffer.
         */
        private parseReplay(): void;
        /**
         * Converts replay mods to droid mod string.
         */
        private convertDroidMods(replayMods: string[]): string;
        /**
         * Converts replay mods to regular mod string.
         */
        private convertMods(replayMods: string[]): string;
        /**
         * Gets hit error information of the replay.
         *
         * `analyze()` must be called before calling this.
         */
        calculateHitError(): HitErrorInformation | null;
        /**
         * Checks if a play is using 3 fingers.
         *
         * Requires `analyze()` to be called first and `map` to be defined as `DroidStarRating`.
         */
        checkFor3Finger(): void;
        /**
         * Checks if a play is using 2 hands.
         *
         * Requires `analyze()` to be called first and `map` to be defined as `DroidStarRating`.
         */
        checkFor2Hand(): void;
    }

    /**
     * Represents a replay data in an osu!droid replay.
     *
     * Stores generic information about an osu!droid replay such as player name, MD5 hash, time set, etc.
     *
     * This is used when analyzing replays using replay analyzer.
     */
    export class ReplayData implements ReplayInformation {
        readonly replayVersion: number;
        readonly folderName: string;
        readonly fileName: string;
        readonly hash: string;
        readonly time: Date;
        readonly hit300k: number;
        readonly hit100k: number;
        readonly score: number;
        readonly maxCombo: number;
        readonly accuracy: Accuracy;
        readonly isFullCombo: boolean;
        readonly playerName: string;
        readonly rawMods: string;
        readonly rank: string;
        readonly convertedMods: Mod[];
        readonly cursorMovement: CursorData[];
        readonly hitObjectData: ReplayObjectData[];
        readonly speedModification: number;
        readonly forcedAR?: number;
        constructor(values: ReplayInformation);
    }

    /**
     * Represents a hitobject in an osu!droid replay.
     *
     * Stores information about hitobjects in an osu!droid replay such as hit offset, tickset, and hit result.
     *
     * This is used when analyzing replays using replay analyzer.
     */
    export class ReplayObjectData {
        /**
         * The offset of which the hitobject was hit in milliseconds.
         */
        accuracy: number;
        /**
         * The tickset of the hitobject.
         *
         * This is used to determine whether or not a slider event (tick/repeat/end) is hit based on the order they appear.
         */
        tickset: boolean[];
        /**
         * The bitwise hit result of the hitobject.
         */
        result: hitResult;
        constructor(values: {
            /**
             * The offset of which the hitobject was hit in milliseconds.
             */
            accuracy: number;
            /**
             * The tickset of the hitobject.
             *
             * This is used to determine whether or not a slider event (tick/repeat/end) is hit based on the order they appear.
             */
            tickset: boolean[];
            /**
             * The bitwise hit result of the hitobject.
             */
            result: hitResult;
        });
    }

    /**
     * Utility to check whether or not a beatmap is three-fingered.
     */
    export class ThreeFingerChecker {
        /**
         * The beatmap to analyze.
         */
        readonly map: DroidStarRating | RebalanceDroidStarRating;
        /**
         * The data of the replay.
         */
        readonly data: ReplayData;
        /**
         * Checks whether a beatmap is eligible to be detected for three finger.
         *
         * @param map The beatmap.
         */
        static isEligibleToDetect(
            map: DroidStarRating | RebalanceDroidStarRating
        ): boolean;
    }

    //#endregion

    //#region Enums

    /**
     * The result of a hit in an osu!droid replay.
     */
    export enum hitResult {
        /**
         * Miss (0).
         */
        RESULT_0 = 1,
        /**
         * Meh (50).
         */
        RESULT_50 = 2,
        /**
         * Great (100).
         */
        RESULT_100 = 3,
        /**
         * Good (300).
         */
        RESULT_300 = 4,
    }

    /**
     * Mode enum to switch things between osu!droid and osu!standard.
     */
    export enum modes {
        droid = "droid",
        osu = "osu",
    }

    /**
     * Movement type of a cursor in an osu!droid replay.
     */
    export enum movementType {
        DOWN = 0,
        MOVE = 1,
        UP = 2,
    }

    //#endregion

    //#region Interfaces

    /**
     * Contains information about a cursor instance.
     */
    export interface CursorInformation {
        /**
         * The movement size of the cursor instance.
         */
        size: number;
        /**
         * The time during which this cursor instance is active in milliseconds.
         */
        time: number[];
        /**
         * The x coordinates of this cursor instance in osu!pixels.
         */
        x: number[];
        /**
         * The y coordinates of this cursor instance in osu!pixels.
         */
        y: number[];
        /**
         * The hit IDs of this cursor instance.
         */
        id: number[];
    }

    /**
     * Represents a replay's hit error information.
     */
    export interface HitErrorInformation {
        /**
         * Average of hits below 0ms.
         */
        readonly negativeAvg: number;
        /**
         * Average of hits above 0ms.
         */
        readonly positiveAvg: number;
        /**
         * The unstable rate of the replay.
         */
        readonly unstableRate: number;
    }

    /**
     * Contains information about a replay.
     */
    export interface ReplayInformation {
        /**
         * The version of the replay.
         */
        replayVersion: number;
        /**
         * The folder name containing the beatmap played.
         */
        folderName: string;
        /**
         * The file name of the beatmap played.
         */
        fileName: string;
        /**
         * The MD5 hash of the beatmap played.
         */
        hash: string;
        /**
         * The date of which the play was set.
         *
         * Only available in replay v3 or later.
         */
        time?: Date;
        /**
         * The amount of geki and 300 katu achieved in the play. See {@link https://osu.ppy.sh/help/wiki/Score this} osu! wiki page for more information.
         *
         * Only available in replay v3 or later.
         *
         * If `map` is defined in analyzer (either in `Beatmap` or `StarRating` instance), this will be analyzed using beatmap hitobject information and replay hitobject data for replay v1 and v2.
         */
        hit300k?: number;
        /**
         * The amount of 300s achieved in the play.
         *
         * Only available in replay v3 or later.
         *
         * If `map` is defined in analyzer (either in `Beatmap` or `StarRating` instance), this will be analyzed using beatmap hitobject information and replay hitobject data for replay v1 and v2.
         */
        hit300?: number;
        /**
         * The amount of 100 katu achieved in the play. See {@link https://osu.ppy.sh/help/wiki/Score this} osu! wiki page for more information.
         *
         * Only available in replay v3 or later.
         *
         * If `map` is defined in analyzer (either in `Beatmap` or `StarRating` instance), this will be analyzed using beatmap hitobject information and replay hitobject data for replay v1 and v2.
         */
        hit100k?: number;
        /**
         * The total score achieved in the play.
         *
         * Only available in replay v3 or later.
         */
        score?: number;
        /**
         * The maximum combo achieved in the play.
         *
         * Only available in replay v3 or later.
         */
        maxCombo?: number;
        /**
         * The accuracy achieved in the play.
         *
         * Only available in replay v3 or later.
         *
         * If `map` is defined in analyzer (either in `Beatmap` or `StarRating` instance), this will be analyzed using beatmap hitobject information and replay hitobject data for replay v1 and v2.
         */
        accuracy?: Accuracy;
        /**
         * Whether the play achieved the beatmap's maximum combo.
         *
         * Only available in replay v3 or later.
         */
        isFullCombo?: boolean;
        /**
         * The name of the player in the replay.
         *
         * Only available in replay v3 or later.
         */
        playerName?: string;
        /**
         * Enabled modifications during the play in raw Java object format.
         *
         * Only available in replay v3 or later.
         */
        rawMods?: string;
        /**
         * The rank achieved in the play.
         *
         * Only available in replay v3 or later.
         *
         * If `map` is defined in analyzer (either in `Beatmap` or `StarRating` instance), this will be analyzed using beatmap hitobject information and replay hitobject data for replay v1 and v2.
         */
        rank?: string;
        /**
         * Enabled modifications during the play in osu!standard format.
         *
         * Only available in replay v3 or later.
         */
        convertedMods?: Mod[];
        /**
         * The speed modification of the replay.
         *
         * Only available in replay v4 or later. By default this is 1.
         */
        speedModification?: number;
        /**
         * The forced AR of the replay.
         *
         * Only available in replay v4 or later.
         */
        forcedAR?: number;
        /**
         * The cursor movement data of the replay.
         */
        cursorMovement: CursorData[];
        /**
         * The hit object data of the replay.
         */
        hitObjectData: ReplayObjectData[];
    }

    /**
     * Represents an exported replay's JSON structure.
     */
    export interface ExportedReplayJSON {
        /**
         * The version of the exported replay.
         */
        version: number;
        /**
         * Data of the exported replay.
         */
        replaydata: {
            /**
             * The path towards the beatmap's `.osu` file from the song directory of the game.
             */
            filename: string;
            /**
             * The name of the player.
             */
            playername: string;
            /**
             * The name of the replay file.
             */
            replayfile: string;
            /**
             * Droid modifications that are used in the replay.
             */
            mod: string;
            /**
             * The amount of total score achieved.
             */
            score: number;
            /**
             * The maximum combo achieved.
             */
            combo: number;
            /**
             * The rank achieved in the replay.
             */
            mark: string;
            /**
             * The amount of geki hits in the replay.
             */
            h300k: number;
            /**
             * The amount of great hits in the replay.
             */
            h300: number;
            /**
             * The amount of katu hits in the replay.
             */
            h100k: number;
            /**
             * The amount of good hits in the replay.
             */
            h100: number;
            /**
             * The amount of meh hits in the replay.
             */
            h50: number;
            /**
             * The amount of misses in the replay.
             */
            misses: number;
            /**
             * Accuracy gained in the replay.
             */
            accuracy: number;
            /**
             * The epoch date at which the score was set, in milliseconds.
             */
            time: number;
            /**
             * Whether the score is a full combo (1 is `true`, 0 is `false`).
             */
            perfect: number;
        };
    }

    /**
     * Represents a response from an API request.
     */
    export interface RequestResponse {
        /**
         * The result of the API request.
         */
        readonly data: Buffer;
        /**
         * The status code of the API request.
         */
        readonly statusCode: number;
    }

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
