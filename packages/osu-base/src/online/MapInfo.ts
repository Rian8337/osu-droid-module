import { Beatmap } from "../beatmap/Beatmap";
import { RankedStatus } from "../constants/RankedStatus";
import { BeatmapDecoder } from "../beatmap/BeatmapDecoder";
import { If } from "../utils/If";
import { OsuAPIRequestBuilder } from "./OsuAPIRequestBuilder";
import { BeatmapGenre } from "./BeatmapGenre";
import { BeatmapLanguage } from "./BeatmapLanguage";

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
export class MapInfo<THasBeatmap extends boolean = boolean> {
    /**
     * The title of the song of the beatmap.
     */
    title = "";

    /**
     * The full title of the beatmap, which is `Artist - Title (Creator) [Difficulty Name]`.
     */
    get fullTitle(): string {
        return `${this.artist} - ${this.title} (${this.creator}) [${this.version}]`;
    }

    /**
     * The artist of the song of the beatmap.
     */
    artist = "";

    /**
     * The creator of the beatmap.
     */
    creator = "";

    /**
     * The user ID of the creator of the beatmap.
     */
    creatorId = 0;

    /**
     * The difficulty name of the beatmap.
     */
    version = "";

    /**
     * The source of the song, if any.
     */
    source = "";

    /**
     * The ranking status of the beatmap.
     */
    approved = RankedStatus.pending;

    /**
     * The ID of the beatmap.
     */
    beatmapId = 0;

    /**
     * The ID of the beatmapset containing the beatmap.
     */
    beatmapSetId = 0;

    /**
     * The amount of times the beatmap has been played.
     */
    plays = 0;

    /**
     * The amount of times this beatmap has been passed.
     */
    passes = 0;

    /**
     * The amount of times the beatmap has been favorited.
     */
    favorites = 0;

    /**
     * The user rating of this beatmap.
     */
    rating = 0;

    /**
     * The date of which the beatmap was submitted.
     */
    submitDate = new Date(0);

    /**
     * The date of which this beatmap was approved.
     */
    approvedDate: Date | null = null;

    /**
     * The date of which the beatmap was last updated.
     */
    lastUpdate = new Date(0);

    /**
     * The duration of the beatmap not including breaks.
     */
    hitLength = 0;

    /**
     * The duration of the beatmap including breaks.
     */
    totalLength = 0;

    /**
     * The genre of this beatmap.
     */
    genre = BeatmapGenre.any;

    /**
     * The language of this beatmap.
     */
    language = BeatmapLanguage.any;

    /**
     * The BPM of the beatmap.
     */
    bpm = 0;

    /**
     * The amount of circles in the beatmap.
     */
    circles = 0;

    /**
     * The amount of sliders in the beatmap.
     */
    sliders = 0;

    /**
     * The amount of spinners in the beatmap.
     */
    spinners = 0;

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
    cs = 0;

    /**
     * The approach rate of the beatmap.
     */
    ar = 0;

    /**
     * The overall difficulty of the beatmap.
     */
    od = 0;

    /**
     * The health drain rate of the beatmap.
     */
    hp = 0;

    /**
     * The beatmap packs that contain this beatmap, represented by their ID.
     */
    packs: string[] = [];

    /**
     * The tags of this beatmap.
     */
    tags: string[] = [];

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
    hash = "";

    /**
     * Whether this beatmap has a storyboard.
     */
    storyboardAvailable = false;

    /**
     * Whether this beatmap has a video.
     */
    videoAvailable = false;

    /**
     * Whether the download for this beatmap is available.
     *
     * The download of a beatmap may not be available due to old beatmap, etc.
     */
    downloadAvailable = true;

    /**
     * Whether the audio of this beatmap is available.
     *
     * The audio of a beatmap may not be available due to DMCA takedown, etc.
     */
    audioAvailable = true;

    /**
     * The decoded beatmap from beatmap decoder.
     */
    get beatmap(): If<THasBeatmap, Beatmap> {
        return this.cachedBeatmap as If<THasBeatmap, Beatmap>;
    }

    /**
     * The osu! site link to this beatmap.
     */
    get beatmapLink(): string {
        return `https://osu.ppy.sh/b/${this.beatmapId.toString()}`;
    }

    /**
     * The osu! site link to this beatmapset.
     */
    get beatmapSetLink(): string {
        return `https://osu.ppy.sh/s/${this.beatmapSetId.toString()}`;
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
        const apiRequestBuilder = new OsuAPIRequestBuilder()
            .setEndpoint("get_beatmaps")
            .addParameter(
                typeof beatmapIdOrHash === "string" ? "h" : "b",
                beatmapIdOrHash,
            );

        const result = await apiRequestBuilder.sendRequest();

        if (result.statusCode !== 200) {
            throw new Error("osu! API error");
        }

        const mapinfo = (
            JSON.parse(result.data.toString("utf-8")) as OsuAPIResponse[]
        ).at(0);

        if (!mapinfo) {
            return null;
        }

        if (parseInt(mapinfo.mode) !== 0) {
            return null;
        }

        const map = this.from(mapinfo);

        if (downloadBeatmap !== false) {
            await map.retrieveBeatmapFile();
        }

        return map;
    }

    /**
     * Constructs a `MapInfo` from an osu! API response.
     *
     * @param mapinfo The osu! API response.
     * @returns A `MapInfo` instance representing the osu! API response.
     */
    static from(mapinfo: OsuAPIResponse): MapInfo;

    /**
     * Constructs a `MapInfo` from an osu! API response and a parsed `Beatmap`.
     *
     * @param mapinfo The osu! API response.
     * @param parsedBeatmap The parsed `Beatmap`.
     * @returns A `MapInfo` instance representing the osu! API response and parsed `Beatmap`.
     */
    static from(mapinfo: OsuAPIResponse, parsedBeatmap: Beatmap): MapInfo<true>;

    static from(mapinfo: OsuAPIResponse, parsedBeatmap?: Beatmap): MapInfo {
        const map = new MapInfo();

        const parseDate = (str: string): Date => {
            const t = str.split(/[- :]/).map((e) => parseInt(e));

            return new Date(Date.UTC(t[0], t[1] - 1, t[2], t[3], t[4], t[5]));
        };

        map.title = mapinfo.title;
        map.artist = mapinfo.artist;
        map.creator = mapinfo.creator;
        map.creatorId = parseInt(mapinfo.creator_id);
        map.version = mapinfo.version;
        map.source = mapinfo.source;
        map.approved = parseInt(mapinfo.approved);
        map.beatmapId = parseInt(mapinfo.beatmap_id);
        map.beatmapSetId = parseInt(mapinfo.beatmapset_id);
        map.plays = parseInt(mapinfo.playcount);
        map.passes = parseInt(mapinfo.passcount);
        map.favorites = parseInt(mapinfo.favourite_count);
        map.rating = parseFloat(mapinfo.rating);
        map.lastUpdate = parseDate(mapinfo.last_update);
        map.submitDate = parseDate(mapinfo.submit_date);
        map.approvedDate = mapinfo.approved_date
            ? parseDate(mapinfo.approved_date)
            : null;
        map.hitLength = parseInt(mapinfo.hit_length);
        map.totalLength = parseInt(mapinfo.total_length);
        map.genre = parseInt(mapinfo.genre_id);
        map.language = parseInt(mapinfo.language_id);
        map.bpm = parseFloat(mapinfo.bpm);
        map.circles = mapinfo.count_normal ? parseInt(mapinfo.count_normal) : 0;
        map.sliders = mapinfo.count_slider ? parseInt(mapinfo.count_slider) : 0;
        map.spinners = mapinfo.count_spinner
            ? parseInt(mapinfo.count_spinner)
            : 0;
        map.maxCombo =
            mapinfo.max_combo !== null ? parseInt(mapinfo.max_combo) : null;
        map.cs = parseFloat(mapinfo.diff_size);
        map.ar = parseFloat(mapinfo.diff_approach);
        map.od = parseFloat(mapinfo.diff_overall);
        map.hp = parseFloat(mapinfo.diff_drain);
        if (mapinfo.packs) {
            map.packs = mapinfo.packs.split(",").map((pack) => pack.trim());
        }
        map.tags = mapinfo.tags.split(" ");
        map.aimDifficulty = mapinfo.diff_aim
            ? parseFloat(mapinfo.diff_aim)
            : null;
        map.speedDifficulty = mapinfo.diff_speed
            ? parseFloat(mapinfo.diff_speed)
            : null;
        map.totalDifficulty = mapinfo.difficultyrating
            ? parseFloat(mapinfo.difficultyrating)
            : null;
        map.hash = mapinfo.file_md5;
        map.storyboardAvailable = !!parseInt(mapinfo.storyboard);
        map.videoAvailable = !!parseInt(mapinfo.video);
        map.downloadAvailable = !parseInt(mapinfo.download_unavailable);
        map.audioAvailable = !parseInt(mapinfo.audio_unavailable);

        if (parsedBeatmap) {
            map.cachedBeatmap = parsedBeatmap;
        }

        return map;
    }

    /**
     * Converts this `MapInfo` to its raw API response.
     *
     * @returns The raw API response represented by this `MapInfo`.
     */
    toAPIResponse(): OsuAPIResponse {
        const padDateNumber = (num: number) => num.toString().padStart(2, "0");

        const convertDate = (date: Date) =>
            `${date.getUTCFullYear().toString()}-${padDateNumber(
                date.getUTCMonth() + 1,
            )}-${padDateNumber(date.getUTCDate())} ${padDateNumber(
                date.getUTCHours(),
            )}:${padDateNumber(date.getUTCMinutes())}:${padDateNumber(
                date.getUTCSeconds(),
            )}`;

        return {
            approved: this.approved.toString(),
            submit_date: convertDate(this.submitDate),
            approved_date: this.approvedDate
                ? convertDate(this.approvedDate)
                : null,
            last_update: convertDate(this.lastUpdate),
            artist: this.artist,
            beatmap_id: this.beatmapId.toString(),
            beatmapset_id: this.beatmapSetId.toString(),
            bpm: this.bpm.toString(),
            creator: this.creator,
            creator_id: this.creatorId.toString(),
            difficultyrating: this.totalDifficulty?.toString() ?? null,
            diff_aim: this.aimDifficulty?.toString() ?? null,
            diff_speed: this.speedDifficulty?.toString() ?? null,
            diff_size: this.cs.toString(),
            diff_overall: this.od.toString(),
            diff_approach: this.ar.toString(),
            diff_drain: this.hp.toString(),
            hit_length: this.hitLength.toString(),
            source: this.source,
            genre_id: this.genre.toString(),
            language_id: this.language.toString(),
            title: this.title,
            total_length: this.totalLength.toString(),
            version: this.version,
            file_md5: this.hash,
            // Guaranteed to be osu!standard for the time being.
            mode: "0",
            tags: this.tags.join(" "),
            favourite_count: this.favorites.toString(),
            rating: this.rating.toString(),
            playcount: this.plays.toString(),
            passcount: this.passes.toString(),
            count_normal: this.circles.toString(),
            count_slider: this.sliders.toString(),
            count_spinner: this.spinners.toString(),
            max_combo: this.maxCombo?.toString() ?? null,
            storyboard: this.storyboardAvailable ? "1" : "0",
            video: this.videoAvailable ? "1" : "0",
            download_unavailable: this.downloadAvailable ? "0" : "1",
            audio_unavailable: this.audioAvailable ? "0" : "1",
            packs: this.packs.join(" ") || null,
        };
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

        const url = `https://osu.ppy.sh/osu/${this.beatmapId.toString()}`;

        return fetch(url)
            .then(async (res) => {
                const text = await res.text();

                if (res.status >= 500) {
                    throw new Error(text);
                }

                this.cachedBeatmap = new BeatmapDecoder().decode(text).result;
            })
            .catch((e: unknown) => {
                console.error(
                    `Request to ${url} failed with an error, aborting`,
                    e,
                );
            });
    }

    /**
     * Sets the parsed beatmap that is associated with this `MapInfo`.
     *
     * This is used as an alternative to downloading the beatmap file in case the beatmap file already exists locally.
     *
     * @param beatmap The beatmap to associate with this `MapInfo`.
     */
    setBeatmap(beatmap: Beatmap) {
        this.cachedBeatmap = beatmap;
    }

    /**
     * Returns a string representative of the class.
     */
    toString(): string {
        return `${this.fullTitle}\nCS: ${this.cs.toString()} - AR: ${this.ar.toString()} - OD: ${this.od.toString()} - HP: ${this.hp.toString()}\nBPM: ${this.bpm.toString()} - Length: ${this.hitLength.toString()}/${this.totalLength.toString()} - Max Combo: ${this.maxCombo?.toString() ?? "N/A"}\nLast Update: ${this.lastUpdate.toUTCString()}`;
    }
}
