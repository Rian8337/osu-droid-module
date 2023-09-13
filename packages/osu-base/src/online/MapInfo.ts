import { Beatmap } from "../beatmap/Beatmap";
import { RankedStatus } from "../constants/RankedStatus";
import { BeatmapDecoder } from "../beatmap/BeatmapDecoder";
import { If } from "../utils/If";
import { OsuAPIRequestBuilder } from "./OsuAPIRequestBuilder";
import { RequestResponse } from "./RequestResponse";

export interface OsuAPIResponse {
    readonly approved: string;
    readonly submit_date: string;
    readonly approved_date: string | null;
    readonly last_update: string;
    readonly artist: string;
    readonly beatmap_id: string;
    readonly beatmapset_id: string;
    readonly bpm: string;
    readonly creator: string;
    readonly creator_id: string;
    readonly difficultyrating: string | null;
    readonly diff_aim: string | null;
    readonly diff_speed: string | null;
    readonly diff_size: string;
    readonly diff_overall: string;
    readonly diff_approach: string;
    readonly diff_drain: string;
    readonly hit_length: string;
    readonly source: string;
    readonly genre_id: string;
    readonly language_id: string;
    readonly title: string;
    readonly total_length: string;
    readonly version: string;
    readonly file_md5: string;
    readonly mode: string;
    readonly tags: string;
    readonly favourite_count: string;
    readonly rating: string;
    readonly playcount: string;
    readonly passcount: string;
    readonly count_normal: string;
    readonly count_slider: string;
    readonly count_spinner: string;
    readonly max_combo: string | null;
    readonly storyboard: string;
    readonly video: string;
    readonly download_unavailable: string;
    readonly audio_unavailable: string;
    readonly packs: string | null;
}

/**
 * Represents a beatmap with general information.
 */
export class MapInfo<HasBeatmap extends boolean = boolean> {
    /**
     * The title of the song of the beatmap.
     */
    title: string = "";

    /**
     * The full title of the beatmap, which is `Artist - Title (Creator) [Difficulty Name]`.
     */
    get fullTitle(): string {
        return `${this.artist} - ${this.title} (${this.creator}) [${this.version}]`;
    }

    /**
     * The artist of the song of the beatmap.
     */
    artist: string = "";

    /**
     * The creator of the beatmap.
     */
    creator: string = "";

    /**
     * The difficulty name of the beatmap.
     */
    version: string = "";

    /**
     * The source of the song, if any.
     */
    source: string = "";

    /**
     * The ranking status of the beatmap.
     */
    approved: RankedStatus = 0;

    /**
     * The ID of the beatmap.
     */
    beatmapID: number = 0;

    /**
     * The ID of the beatmapset containing the beatmap.
     */
    beatmapsetID: number = 0;

    /**
     * The amount of times the beatmap has been played.
     */
    plays: number = 0;

    /**
     * The amount of times the beatmap has been favorited.
     */
    favorites: number = 0;

    /**
     * The date of which the beatmap was submitted.
     */
    submitDate: Date = new Date(0);

    /**
     * The date of which the beatmap was last updated.
     */
    lastUpdate: Date = new Date(0);

    /**
     * The duration of the beatmap not including breaks.
     */
    hitLength: number = 0;

    /**
     * The duration of the beatmap including breaks.
     */
    totalLength: number = 0;

    /**
     * The BPM of the beatmap.
     */
    bpm: number = 0;

    /**
     * The amount of circles in the beatmap.
     */
    circles: number = 0;

    /**
     * The amount of sliders in the beatmap.
     */
    sliders: number = 0;

    /**
     * The amount of spinners in the beatmap.
     */
    spinners: number = 0;

    /**
     * The amount of objects in the beatmap.
     */
    get objects(): number {
        return this.circles + this.sliders + this.spinners;
    }

    /**
     * The maximum combo of the beatmap.
     */
    maxCombo: number | null = null;

    /**
     * The circle size of the beatmap.
     */
    cs: number = 0;

    /**
     * The approach rate of the beatmap.
     */
    ar: number = 0;

    /**
     * The overall difficulty of the beatmap.
     */
    od: number = 0;

    /**
     * The health drain rate of the beatmap.
     */
    hp: number = 0;

    /**
     * The beatmap packs that contain this beatmap, represented by their ID.
     */
    packs: string[] = [];

    /**
     * The aim difficulty rating of the beatmap.
     */
    aimDifficulty: number | null = null;

    /**
     * The speed difficulty rating of the beatmap.
     */
    speedDifficulty: number | null = null;

    /**
     * The generic difficulty rating of the beatmap.
     */
    totalDifficulty: number | null = null;

    /**
     * The MD5 hash of the beatmap.
     */
    hash: string = "";

    /**
     * Whether or not this beatmap has a storyboard.
     */
    storyboardAvailable: boolean = false;

    /**
     * Whether or not this beatmap has a video.
     */
    videoAvailable: boolean = false;

    /**
     * The decoded beatmap from beatmap decoder.
     */
    get beatmap(): If<HasBeatmap, Beatmap> {
        return <If<HasBeatmap, Beatmap>>this.cachedBeatmap;
    }

    private cachedBeatmap: Beatmap | null = null;

    /**
     * Retrieve a beatmap's general information.
     *
     * @param beatmapIdOrHash The beatmap ID or MD5 hash of the beatmap.
     * @param downloadBeatmap Whether to also retrieve the .osu file of the beatmap. Defaults to `true`.
     * @returns The beatmap, `null` if the beatmap is not found or the beatmap is not an osu!standard beatmap.
     */
    static async getInformation(
        beatmapIdOrHash: string | number,
        downloadBeatmap?: boolean,
    ): Promise<MapInfo<true> | null>;

    /**
     * Retrieve a beatmap's general information.
     *
     * @param beatmapIdOrHash The beatmap ID or MD5 hash of the beatmap.
     * @param downloadBeatmap Whether to also retrieve the .osu file of the beatmap. Defaults to `true`.
     * @returns The beatmap, `null` if the beatmap is not found or the beatmap is not an osu!standard beatmap.
     */
    static async getInformation(
        beatmapIdOrHash: string | number,
        downloadBeatmap: false,
    ): Promise<MapInfo<false> | null>;

    static async getInformation(
        beatmapIdOrHash: string | number,
        downloadBeatmap?: boolean,
    ): Promise<MapInfo | null> {
        const apiRequestBuilder: OsuAPIRequestBuilder =
            new OsuAPIRequestBuilder()
                .setEndpoint("get_beatmaps")
                .addParameter(
                    typeof beatmapIdOrHash === "string" ? "h" : "b",
                    beatmapIdOrHash,
                );

        const map: MapInfo = new MapInfo();
        const result: RequestResponse = await apiRequestBuilder.sendRequest();

        if (result.statusCode !== 200) {
            throw new Error("osu! API error");
        }

        const mapinfo: OsuAPIResponse = JSON.parse(
            result.data.toString("utf-8"),
        )[0];

        if (!mapinfo) {
            return null;
        }

        if (parseInt(mapinfo.mode) !== 0) {
            return null;
        }

        map.fillMetadata(mapinfo);

        if (downloadBeatmap !== false) {
            await map.retrieveBeatmapFile();
        }

        return map;
    }

    /**
     * Fills the current instance with map data.
     *
     * @param mapinfo The map data.
     */
    fillMetadata(mapinfo: OsuAPIResponse): MapInfo {
        this.title = mapinfo.title;
        this.artist = mapinfo.artist;
        this.creator = mapinfo.creator;
        this.version = mapinfo.version;
        this.source = mapinfo.source;
        this.approved = parseInt(mapinfo.approved);
        this.beatmapID = parseInt(mapinfo.beatmap_id);
        this.beatmapsetID = parseInt(mapinfo.beatmapset_id);
        this.plays = parseInt(mapinfo.playcount);
        this.favorites = parseInt(mapinfo.favourite_count);
        const t: number[] = mapinfo.last_update
            .split(/[- :]/)
            .map((e) => parseInt(e));
        this.lastUpdate = new Date(
            Date.UTC(t[0], t[1] - 1, t[2], t[3], t[4], t[5]),
        );
        const s: number[] = mapinfo.submit_date
            .split(/[- :]/)
            .map((e) => parseInt(e));
        this.submitDate = new Date(
            Date.UTC(s[0], s[1] - 1, s[2], s[3], s[4], s[5]),
        );
        this.hitLength = parseInt(mapinfo.hit_length);
        this.totalLength = parseInt(mapinfo.total_length);
        this.bpm = parseFloat(mapinfo.bpm);
        this.circles = mapinfo.count_normal
            ? parseInt(mapinfo.count_normal)
            : 0;
        this.sliders = mapinfo.count_slider
            ? parseInt(mapinfo.count_slider)
            : 0;
        this.spinners = mapinfo.count_spinner
            ? parseInt(mapinfo.count_spinner)
            : 0;
        this.maxCombo =
            mapinfo.max_combo !== null ? parseInt(mapinfo.max_combo) : null;
        this.cs = parseFloat(mapinfo.diff_size);
        this.ar = parseFloat(mapinfo.diff_approach);
        this.od = parseFloat(mapinfo.diff_overall);
        this.hp = parseFloat(mapinfo.diff_drain);
        if (mapinfo.packs) {
            this.packs = mapinfo.packs.split(",").map((pack) => pack.trim());
        }
        this.aimDifficulty = mapinfo.diff_aim
            ? parseFloat(mapinfo.diff_aim)
            : null;
        this.speedDifficulty = mapinfo.diff_speed
            ? parseFloat(mapinfo.diff_speed)
            : null;
        this.totalDifficulty = mapinfo.difficultyrating
            ? parseFloat(mapinfo.difficultyrating)
            : null;
        this.hash = mapinfo.file_md5;
        this.storyboardAvailable = !!parseInt(mapinfo.storyboard);
        this.videoAvailable = !!parseInt(mapinfo.video);
        return this;
    }

    /**
     * Checks whether the beatmap file has been downloaded.
     */
    hasDownloadedBeatmap(): this is MapInfo<true> {
        return this.cachedBeatmap !== null;
    }

    /**
     * Retrieves the .osu file of the beatmap.
     *
     * After this, you can use the `hasDownloadedBeatmap` method to check if the beatmap has been downloaded.
     *
     * @param force Whether to download the file regardless if it's already available.
     */
    async retrieveBeatmapFile(force?: boolean): Promise<void> {
        if (this.hasDownloadedBeatmap() && !force) {
            return;
        }

        const url: string = `https://osu.ppy.sh/osu/${this.beatmapID}`;

        return fetch(url)
            .then(async (res) => {
                const text: string = await res.text();

                if (res.status >= 500) {
                    throw new Error(text);
                }

                this.cachedBeatmap = new BeatmapDecoder().decode(text).result;
            })
            .catch((e: Error) => {
                console.error(
                    `Request to ${url} failed with the following error: ${e.message}; aborting`,
                );
            });
    }

    /**
     * Returns a string representative of the class.
     */
    toString(): string {
        return `${this.fullTitle}\nCS: ${this.cs} - AR: ${this.ar} - OD: ${this.od} - HP: ${this.hp}\nBPM: ${this.bpm} - Length: ${this.hitLength}/${this.totalLength} - Max Combo: ${this.maxCombo}\nLast Update: ${this.lastUpdate}`;
    }
}
