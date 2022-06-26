import request from "request";
import { Beatmap } from "../beatmap/Beatmap";
import { MapStats } from "../utils/MapStats";
import { rankedStatus } from "../constants/rankedStatus";
import {
    OsuAPIRequestBuilder,
    RequestResponse,
} from "../utils/APIRequestBuilder";
import { Precision } from "../utils/Precision";
import { TimingControlPoint } from "../beatmap/timings/TimingControlPoint";
import { BeatmapDecoder } from "../beatmap/BeatmapDecoder";
import { modes } from "../constants/modes";
import { MathUtils } from "../mathutil/MathUtils";
import { If } from "../utils/If";

export interface OsuAPIResponse {
    readonly approved: string;
    readonly submit_date: string;
    readonly approved_date: string;
    readonly last_update: string;
    readonly artist: string;
    readonly beatmap_id: string;
    readonly beatmapset_id: string;
    readonly bpm: string;
    readonly creator: string;
    readonly creator_id: string;
    readonly difficultyrating?: string;
    readonly diff_aim?: string;
    readonly diff_speed?: string;
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
    readonly max_combo: string;
    readonly storyboard: string;
    readonly video: string;
    readonly download_unavailable: string;
    readonly audio_unavailable: string;
    readonly packs?: string;
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
    approved: rankedStatus = 0;

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
    maxCombo: number = 0;

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
    aimDifficulty: number = 0;

    /**
     * The speed difficulty rating of the beatmap.
     */
    speedDifficulty: number = 0;

    /**
     * The generic difficulty rating of the beatmap.
     */
    totalDifficulty: number = 0;

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
    get map(): If<HasBeatmap, Beatmap> {
        return <If<HasBeatmap, Beatmap>>this.cachedBeatmap;
    }

    private cachedBeatmap: Beatmap | null = null;

    /**
     * Retrieve a beatmap's general information.
     *
     * @param beatmapId The ID of the beatmap.
     * @param downloadBeatmap Whether to also retrieve the .osu file of the beatmap. Defaults to `true`.
     * @returns The beatmap, `null` if the beatmap is not found or the beatmap is not an osu!standard beatmap.
     */
    static async getInformation(
        beatmapId: number,
        downloadBeatmap?: boolean
    ): Promise<MapInfo<true> | null>;

    /**
     * Retrieve a beatmap's general information.
     *
     * @param beatmapId The ID of the beatmap.
     * @param downloadBeatmap Whether to also retrieve the .osu file of the beatmap. Defaults to `true`.
     * @returns The beatmap, `null` if the beatmap is not found or the beatmap is not an osu!standard beatmap.
     */
    static async getInformation(
        beatmapId: number,
        downloadBeatmap: false
    ): Promise<MapInfo<false> | null>;

    /**
     * Retrieve a beatmap's general information.
     *
     * @param hash The MD5 hash of the beatmap.
     * @param downloadBeatmap Whether to also retrieve the .osu file of the beatmap. Defaults to `true`.
     * @returns The beatmap, `null` if the beatmap is not found or the beatmap is not an osu!standard beatmap.
     */
    static async getInformation(
        hash: string,
        downloadBeatmap?: boolean
    ): Promise<MapInfo<true> | null>;

    /**
     * Retrieve a beatmap's general information.
     *
     * @param hash The MD5 hash of the beatmap.
     * @param downloadBeatmap Whether to also retrieve the .osu file of the beatmap. Defaults to `true`.
     * @returns The beatmap, `null` if the beatmap is not found or the beatmap is not an osu!standard beatmap.
     */
    static async getInformation(
        hash: string,
        downloadBeatmap: false
    ): Promise<MapInfo<false> | null>;

    static async getInformation(
        beatmapIdOrHash: string | number,
        downloadBeatmap?: boolean
    ): Promise<MapInfo | null> {
        const apiRequestBuilder: OsuAPIRequestBuilder =
            new OsuAPIRequestBuilder()
                .setEndpoint("get_beatmaps")
                .addParameter(
                    typeof beatmapIdOrHash === "string" ? "h" : "b",
                    beatmapIdOrHash
                );

        const map: MapInfo = new MapInfo();
        const result: RequestResponse = await apiRequestBuilder.sendRequest();

        if (result.statusCode !== 200) {
            throw new Error("osu! API error");
        }

        const mapinfo: OsuAPIResponse = JSON.parse(
            result.data.toString("utf-8")
        )[0];

        if (!mapinfo) {
            return null;
        }

        if (parseInt(mapinfo.mode) !== 0) {
            return null;
        }

        map.fillMetadata(mapinfo);

        if (downloadBeatmap) {
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
            Date.UTC(t[0], t[1] - 1, t[2], t[3], t[4], t[5])
        );
        const s: number[] = mapinfo.submit_date
            .split(/[- :]/)
            .map((e) => parseInt(e));
        this.submitDate = new Date(
            Date.UTC(s[0], s[1] - 1, s[2], s[3], s[4], s[5])
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
        this.maxCombo = parseInt(mapinfo.max_combo);
        this.cs = parseFloat(mapinfo.diff_size);
        this.ar = parseFloat(mapinfo.diff_approach);
        this.od = parseFloat(mapinfo.diff_overall);
        this.hp = parseFloat(mapinfo.diff_drain);
        if (mapinfo.packs) {
            this.packs = mapinfo.packs.split(",").map((pack) => pack.trim());
        }
        this.aimDifficulty = mapinfo.diff_aim
            ? parseFloat(mapinfo.diff_aim)
            : 0;
        this.speedDifficulty = mapinfo.diff_speed
            ? parseFloat(mapinfo.diff_speed)
            : 0;
        this.totalDifficulty = mapinfo.difficultyrating
            ? parseFloat(mapinfo.difficultyrating)
            : 0;
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
    retrieveBeatmapFile(force?: boolean): Promise<void> {
        return new Promise((resolve) => {
            if (this.hasDownloadedBeatmap() && !force) {
                return resolve();
            }

            const url: string = `https://osu.ppy.sh/osu/${this.beatmapID}`;
            const dataArray: Buffer[] = [];
            request(url, { timeout: 10000 })
                .on("data", (chunk) => {
                    dataArray.push(Buffer.from(chunk));
                })
                .on("complete", (response) => {
                    if (response.statusCode !== 200) {
                        return resolve();
                    }

                    this.cachedBeatmap = new BeatmapDecoder().decode(
                        Buffer.concat(dataArray).toString("utf8")
                    ).result;

                    resolve();
                });
        });
    }

    /**
     * Converts the beatmap's BPM if speed-changing mods are applied.
     */
    convertBPM(stats: MapStats): number {
        let bpm: number = this.bpm;
        bpm *= stats.speedMultiplier;

        return parseFloat(bpm.toFixed(2));
    }

    /**
     * Converts the beatmap's status into a string.
     */
    convertStatus(): string {
        let status: string = "Unknown";
        for (const stat in rankedStatus) {
            if (
                rankedStatus[stat as keyof typeof rankedStatus] ===
                this.approved
            ) {
                status = stat;
                break;
            }
        }
        return status !== "WIP"
            ? status.charAt(0) + status.slice(1).toLowerCase()
            : status;
    }

    /**
     * Converts the beatmap's length if speed-changing mods are applied.
     */
    convertTime(stats: MapStats): string {
        let hitLength: number = this.hitLength;
        let totalLength: number = this.totalLength;

        hitLength /= stats.speedMultiplier;
        totalLength /= stats.speedMultiplier;

        return `${this.timeString(this.hitLength)}${
            this.hitLength === hitLength
                ? ""
                : ` (${this.timeString(hitLength)})`
        }/${this.timeString(this.totalLength)}${
            this.totalLength === totalLength
                ? ""
                : ` (${this.timeString(totalLength)})`
        }`;
    }

    /**
     * Time string parsing function for statistics utility.
     */
    private timeString(second: number): string {
        let str: string = new Date(1000 * Math.ceil(second))
            .toISOString()
            .substr(11, 8)
            .replace(/^[0:]+/, "");

        if (second < 60) {
            str = "0:" + str;
        }

        return str;
    }

    /**
     * Shows the beatmap's statistics based on applied statistics and option.
     *
     * - Option `0`: return map title and mods used if defined
     * - Option `1`: return song source and map download link to beatmap mirrors
     * - Option `2`: return circle, slider, and spinner count
     * - Option `3`: return CS, AR, OD, HP, and max score statistics for droid
     * - Option `4`: return CS, AR, OD, HP, and max score statistics for PC
     * - Option `5`: return BPM, map length, and max combo
     * - Option `6`: return last update date and map status
     * - Option `7`: return favorite count and play count
     *
     * @param option The option to pick.
     * @param stats The custom statistics to apply. This will only be used to apply mods, custom speed multiplier, and force AR.
     */
    showStatistics(option: number, stats?: MapStats): string {
        const mapParams = {
            cs: this.cs,
            ar: this.ar,
            od: this.od,
            hp: this.hp,
            mods: stats?.mods ?? [],
            isForceAR: false,
            speedMultiplier: 1,
        };
        if (stats) {
            if (stats.isForceAR) {
                mapParams.ar = stats.ar ?? mapParams.ar;
            }
            mapParams.isForceAR = stats.isForceAR ?? mapParams.isForceAR;
            mapParams.speedMultiplier =
                stats.speedMultiplier ?? mapParams.speedMultiplier;
        }

        switch (option) {
            case 0: {
                const mapStatistics: MapStats = new MapStats(
                    mapParams
                ).calculate();

                let string: string = `${this.fullTitle}${
                    (mapStatistics.mods.length ?? 0) > 0
                        ? ` +${mapStatistics.mods
                              .map((m) => m.acronym)
                              .join("")}`
                        : ""
                }`;
                if (
                    mapParams.speedMultiplier !== 1 ||
                    mapStatistics.isForceAR
                ) {
                    string += " (";
                    if (mapStatistics.isForceAR) {
                        string += `AR${mapStatistics.ar}`;
                    }
                    if (mapParams.speedMultiplier !== 1) {
                        if (mapStatistics.isForceAR) {
                            string += ", ";
                        }
                        string += `${mapParams.speedMultiplier}x`;
                    }
                    string += ")";
                }
                return string;
            }
            case 1: {
                let string: string = `${
                    this.source ? `**Source**: ${this.source}\n` : ""
                }**Download**: [osu!](https://osu.ppy.sh/d/${
                    this.beatmapsetID
                })${
                    this.videoAvailable
                        ? ` [(no video)](https://osu.ppy.sh/d/${this.beatmapsetID}n)`
                        : ""
                } - [Chimu](https://chimu.moe/en/d/${
                    this.beatmapsetID
                }) - [Sayobot](https://txy1.sayobot.cn/beatmaps/download/full/${
                    this.beatmapsetID
                })${
                    this.videoAvailable
                        ? ` [(no video)](https://txy1.sayobot.cn/beatmaps/download/novideo/${this.beatmapsetID})`
                        : ""
                } - [Beatconnect](https://beatconnect.io/b/${
                    this.beatmapsetID
                }/) - [Nerina](https://nerina.pw/d/${this.beatmapsetID})${
                    this.approved >= rankedStatus.RANKED &&
                    this.approved !== rankedStatus.QUALIFIED
                        ? ` - [Ripple](https://storage.ripple.moe/d/${this.beatmapsetID})`
                        : ""
                }`;
                if (this.packs.length > 0) {
                    string += "\n**Beatmap Pack**: ";
                    for (let i = 0; i < this.packs.length; i++) {
                        string += `[${this.packs[i]}](https://osu.ppy.sh/beatmaps/packs/${this.packs[i]})`;
                        if (i + 1 < this.packs.length) {
                            string += " - ";
                        }
                    }
                }
                string += `\n🖼️ ${
                    this.storyboardAvailable ? "✅" : "❎"
                } **|** 🎞️ ${this.videoAvailable ? "✅" : "❎"}`;
                return string;
            }
            case 2:
                return `**Circles**: ${this.circles} - **Sliders**: ${this.sliders} - **Spinners**: ${this.spinners}`;
            case 3: {
                const droidOriginalStats: MapStats = new MapStats({
                    cs: this.cs,
                    ar: this.ar,
                    od: this.od,
                    hp: this.hp,
                }).calculate({ mode: modes.droid });

                const droidModifiedStats: MapStats = new MapStats(
                    mapParams
                ).calculate({ mode: modes.droid });

                droidOriginalStats.cs = MathUtils.round(
                    droidOriginalStats.cs!,
                    2
                );
                droidOriginalStats.ar = MathUtils.round(
                    droidOriginalStats.ar!,
                    2
                );
                droidOriginalStats.od = MathUtils.round(
                    droidOriginalStats.od!,
                    2
                );
                droidOriginalStats.hp = MathUtils.round(
                    droidOriginalStats.hp!,
                    2
                );

                droidModifiedStats.cs = MathUtils.round(
                    droidModifiedStats.cs!,
                    2
                );
                droidModifiedStats.ar = MathUtils.round(
                    droidModifiedStats.ar!,
                    2
                );
                droidModifiedStats.od = MathUtils.round(
                    droidModifiedStats.od!,
                    2
                );
                droidModifiedStats.hp = MathUtils.round(
                    droidModifiedStats.hp!,
                    2
                );

                const maxScore: number =
                    this.map?.maxDroidScore(new MapStats(mapParams)) ?? 0;

                return `**CS**: ${droidOriginalStats.cs}${
                    Precision.almostEqualsNumber(
                        droidOriginalStats.cs!,
                        droidModifiedStats.cs!
                    )
                        ? ""
                        : ` (${droidModifiedStats.cs})`
                } - **AR**: ${droidOriginalStats.ar}${
                    Precision.almostEqualsNumber(
                        droidOriginalStats.ar!,
                        droidModifiedStats.ar!
                    )
                        ? ""
                        : ` (${droidModifiedStats.ar})`
                } - **OD**: ${droidOriginalStats.od}${
                    Precision.almostEqualsNumber(
                        droidOriginalStats.od!,
                        droidModifiedStats.od!
                    )
                        ? ""
                        : ` (${droidModifiedStats.od})`
                } - **HP**: ${droidOriginalStats.hp}${
                    Precision.almostEqualsNumber(
                        droidOriginalStats.hp!,
                        droidModifiedStats.hp!
                    )
                        ? ""
                        : ` (${droidModifiedStats.hp})`
                }${
                    maxScore > 0
                        ? `\n**Max Score**: ${maxScore.toLocaleString()}`
                        : ""
                }`;
            }
            case 4: {
                const mapStatistics: MapStats = new MapStats(
                    mapParams
                ).calculate();

                mapStatistics.cs = MathUtils.round(mapStatistics.cs!, 2);
                mapStatistics.ar = MathUtils.round(mapStatistics.ar!, 2);
                mapStatistics.od = MathUtils.round(mapStatistics.od!, 2);
                mapStatistics.hp = MathUtils.round(mapStatistics.hp!, 2);

                const maxScore: number =
                    this.map?.maxOsuScore(mapStatistics.mods) ?? 0;

                return `**CS**: ${this.cs}${
                    Precision.almostEqualsNumber(this.cs, mapStatistics.cs!)
                        ? ""
                        : ` (${mapStatistics.cs})`
                } - **AR**: ${this.ar}${
                    Precision.almostEqualsNumber(this.ar, mapStatistics.ar!)
                        ? ""
                        : ` (${mapStatistics.ar})`
                } - **OD**: ${this.od}${
                    Precision.almostEqualsNumber(this.od, mapStatistics.od!)
                        ? ""
                        : ` (${mapStatistics.od})`
                } - **HP**: ${this.hp}${
                    Precision.almostEqualsNumber(this.hp, mapStatistics.hp!)
                        ? ""
                        : ` (${mapStatistics.hp})`
                }${
                    maxScore > 0
                        ? `\n**Max Score**: ${maxScore.toLocaleString()}`
                        : ""
                }`;
            }
            case 5: {
                const mapStatistics: MapStats = new MapStats(
                    mapParams
                ).calculate();

                const convertedBPM: number = this.convertBPM(mapStatistics);
                let string = "**BPM**: ";
                if (this.map) {
                    const uninheritedTimingPoints: readonly TimingControlPoint[] =
                        this.map.controlPoints.timing.points;

                    if (uninheritedTimingPoints.length === 1) {
                        string += `${this.bpm}${
                            !Precision.almostEqualsNumber(
                                this.bpm,
                                convertedBPM
                            )
                                ? ` (${convertedBPM})`
                                : ""
                        } - **Length**: ${this.convertTime(
                            mapStatistics
                        )} - **Max Combo**: ${this.maxCombo}x`;
                    } else {
                        let maxBPM: number = this.bpm;
                        let minBPM: number = this.bpm;
                        for (const t of uninheritedTimingPoints) {
                            const bpm: number = parseFloat(
                                (60000 / t.msPerBeat).toFixed(2)
                            );
                            maxBPM = Math.max(maxBPM, bpm);
                            minBPM = Math.min(minBPM, bpm);
                        }
                        maxBPM = Math.round(maxBPM);
                        minBPM = Math.round(minBPM);
                        const speedMulMinBPM: number = Math.round(
                            minBPM * mapStatistics.speedMultiplier
                        );
                        const speedMulMaxBPM: number = Math.round(
                            maxBPM * mapStatistics.speedMultiplier
                        );

                        string +=
                            Precision.almostEqualsNumber(minBPM, this.bpm) &&
                            Precision.almostEqualsNumber(maxBPM, this.bpm)
                                ? `${this.bpm} `
                                : `${minBPM}-${maxBPM} (${this.bpm}) `;

                        if (
                            !Precision.almostEqualsNumber(
                                this.bpm,
                                convertedBPM
                            )
                        ) {
                            if (
                                !Precision.almostEqualsNumber(
                                    speedMulMinBPM,
                                    speedMulMaxBPM
                                )
                            ) {
                                string += `(${speedMulMinBPM}-${speedMulMaxBPM} (${convertedBPM})) `;
                            } else {
                                string += `(${convertedBPM}) `;
                            }
                        }

                        string += `- **Length**: ${this.convertTime(
                            mapStatistics
                        )} - **Max Combo**: ${this.maxCombo}x`;
                    }
                } else {
                    string += `${this.bpm}${
                        !Precision.almostEqualsNumber(this.bpm, convertedBPM)
                            ? ` (${convertedBPM})`
                            : ""
                    } - **Length**: ${this.convertTime(
                        mapStatistics
                    )} - **Max Combo**: ${this.maxCombo}x`;
                }
                return string;
            }
            case 6:
                return `**Last Update**: ${this.lastUpdate.toUTCString()} | **${this.convertStatus()}**`;
            case 7:
                return `❤️ **${this.favorites.toLocaleString()}** - ▶️ **${this.plays.toLocaleString()}**`;
            default:
                throw {
                    name: "NotSupportedError",
                    message: `This mode (${option}) is not supported`,
                };
        }
    }

    /**
     * Returns a color integer based on the beatmap's ranking status.
     *
     * Useful to make embed messages.
     */
    get statusColor(): number {
        switch (this.approved) {
            case -2:
                return 16711711; // Graveyard: red
            case -1:
                return 9442302; // WIP: purple
            case 0:
                return 16312092; // Pending: yellow
            case 1:
                return 2483712; // Ranked: green
            case 2:
                return 16741376; // Approved: tosca
            case 3:
                return 5301186; // Qualified: light blue
            case 4:
                return 16711796; // Loved: pink
            default:
                return 0;
        }
    }

    /**
     * Returns a string representative of the class.
     */
    toString(): string {
        return `${this.fullTitle}\nCS: ${this.cs} - AR: ${this.ar} - OD: ${this.od} - HP: ${this.hp}\nBPM: ${this.bpm} - Length: ${this.hitLength}/${this.totalLength} - Max Combo: ${this.maxCombo}\nLast Update: ${this.lastUpdate}`;
    }
}
