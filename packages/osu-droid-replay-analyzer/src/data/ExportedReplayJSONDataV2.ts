export interface ExportedReplayJSONDataV2 {
    /**
     * The name of the beatmap.
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
     * The MD5 hash of the beatmap.
     */
    beatmapMD5: string;

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
}
