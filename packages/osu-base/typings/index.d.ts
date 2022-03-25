declare module "@rian8337/osu-base" {
    //#region Classes

    /**
     * An accuracy calculator that calculates accuracy based on given parameters.
     */
    export class Accuracy implements AccuracyInformation {
        n300: number;
        n100: number;
        n50: number;
        nmiss: number;
        /**
         * Calculates accuracy based on given parameters.
         *
         * If `percent` and `nobjects` are specified, `n300`, `n100`, and `n50` will
         * be automatically calculated to be the closest to the given
         * acc percent.
         *
         * @param values Function parameters.
         */
        constructor(values: AccuracyInformation);
        /**
         * Calculates the accuracy value (0.0 - 1.0).
         *
         * @param nobjects The amount of objects in the beatmap. If `n300` was not specified in the constructor, this is required.
         */
        value(nobjects?: number): number;
    }

    /**
     * Represents a beatmap with advanced information.
     */
    export class Beatmap {
        /**
         * The format version of the beatmap.
         */
        formatVersion: number;
        /**
         * The title of the song of the beatmap.
         */
        title: string;
        /**
         * The unicode title of the song of the beatmap.
         */
        titleUnicode: string;
        /**
         * The artist of the song of the beatmap.
         */
        artist: string;
        /**
         * The unicode artist of the song of the beatmap.
         */
        artistUnicode: string;
        /**
         * The creator of the beatmap.
         */
        creator: string;
        /**
         * The difficulty name of the beatmap.
         */
        version: string;
        /**
         * The ID of the beatmap.
         */
        beatmapId?: number;
        /**
         * The ID of the beatmapset containing this beatmap.
         */
        beatmapSetId?: number;
        /**
         * The approach rate of the beatmap.
         */
        ar?: number;
        /**
         * The circle size of the beatmap.
         */
        cs: number;
        /**
         * The overall difficulty of the beatmap.
         */
        od: number;
        /**
         * The health drain rate of the beatmap.
         */
        hp: number;
        /**
         * The slider velocity of the beatmap.
         */
        sv: number;
        /**
         * The slider tick rate of the beatmap.
         */
        tickRate: number;
        /**
         * The amount of circles in the beatmap.
         */
        circles: number;
        /**
         * The amount of sliders in the beatmap.
         */
        sliders: number;
        /**
         * The amount of spinners in the beatmap.
         */
        spinners: number;
        /**
         * The objects of the beatmap.
         */
        readonly objects: HitObject[];
        /**
         * The timing points of the beatmap.
         */
        readonly timingPoints: TimingControlPoint[];
        /**
         * The difficulty timing points of the beatmap.
         */
        readonly difficultyTimingPoints: DifficultyControlPoint[];
        /**
         * The break points of the beatmap.
         */
        readonly breakPoints: BreakPoint[];
        /**
         * The stack leniency of the beatmap.
         */
        stackLeniency: number;
        /**
         * The amount of slider ticks in the beatmap.
         */
        get sliderTicks(): number;
        /**
         * The amount of sliderends in the beatmap.
         */
        get sliderEnds(): number;
        /**
         * The amount of slider repeat points in the beatmap.
         */
        get sliderRepeatPoints(): number;
        /**
         * The maximum combo of the beatmap.
         */
        get maxCombo(): number;
        /**
         * Returns a time combined with beatmap-wide time offset.
         *
         * BeatmapVersion 4 and lower had an incorrect offset. Stable has this set as 24ms off.
         *
         * @param time The time.
         */
        getOffsetTime(time: number): number;
        /**
         * Gets the timing control point that applies at a given time.
         *
         * @param time The time.
         */
        timingControlPointAt(time: number): TimingControlPoint;
        /**
         * Gets the difficulty control point that applies at a given time.
         *
         * @param time The time.
         */
        difficultyControlPointAt(time: number): DifficultyControlPoint;
        /**
         * Calculates the osu!droid maximum score of the beatmap without taking spinner bonus into account.
         *
         * @param stats The statistics used for calculation.
         */
        maxDroidScore(stats: MapStats): number;
        /**
         * Calculates the osu!standard maximum score of the beatmap without taking spinner bonus into account.
         *
         * @param mods The modifications to calculate for. Defaults to No Mod.
         */
        maxOsuScore(mods?: Mod[]): number;
        /**
         * Calculates the maximum score with a given difficulty and score multiplier.
         *
         * @param difficultyMultiplier The difficulty multiplier.
         * @param scoreMultiplier The score multiplier.
         */
        private maxScore(
            difficultyMultiplier: number,
            scoreMultiplier: number
        ): number;
        /**
         * Gets the timing point that applies at a given time.
         *
         * @param time The time.
         * @param list The timing points to search in.
         */
        private getTimingPoint<T extends TimingPoint>(
            time: number,
            list: T[]
        ): T;
        /**
         * Returns a string representative of the class.
         */
        toString(): string;
    }

    /**
     * Represents a break period in a beatmap.
     */
    export class BreakPoint {
        /**
         * The minimum duration required for a break to have any effect.
         */
        static readonly MIN_BREAK_DURATION: number;
        /**
         * The start time of the break period.
         */
        readonly startTime: number;
        /**
         * The end time of the break period.
         */
        readonly endTime: number;
        /**
         * The duration of the break period. This is obtained from `endTime - startTime`.
         */
        readonly duration: number;
        constructor(values: { startTime: number; endTime: number });
        /**
         * Returns a string representation of the class.
         */
        toString(): string;
        /**
         * Whether this break period contains a specified time.
         *
         * @param time The time to check in milliseconds.
         * @returns Whether the time falls within this break period.
         */
        contains(time: number): boolean;
    }

    /**
     * Represents a circle in a beatmap.
     *
     * All we need from circles is their position. All positions
     * stored in the objects are in playfield coordinates (512*384
     * rectangle).
     */
    export class Circle extends HitObject {
        constructor(values: {
            startTime: number;
            type: number;
            position: Vector2;
        });
        override toString(): string;
    }

    /**
     * Represents a timing point that changes speed multiplier.
     */
    export class DifficultyControlPoint extends TimingPoint {
        /**
         * The slider speed multiplier of the timing point.
         */
        readonly speedMultiplier: number;
        constructor(values: { time: number; speedMultiplier: number });
        override toString(): string;
    }

    /**
     * API request builder for osu!droid.
     */
    export class DroidAPIRequestBuilder extends APIRequestBuilder {
        protected override readonly host: string;
        protected override readonly APIkey: string;
        protected override readonly APIkeyParam: string;
        override setEndpoint(endpoint: DroidAPIEndpoint): this;
    }

    /**
     * Represents the hit window of osu!droid.
     */
    export class DroidHitWindow extends HitWindow {
        /**
         * @param isPrecise Whether or not to calculate for Precise mod.
         */
        override hitWindowFor300(isPrecise?: boolean): number;
        /**
         * @param isPrecise Whether or not to calculate for Precise mod.
         */
        override hitWindowFor100(isPrecise?: boolean): number;
        /**
         * @param isPrecise Whether or not to calculate for Precise mod.
         */
        override hitWindowFor50(isPrecise?: boolean): number;
    }

    /**
     * Represents the headcircle of a slider (sliderhead).
     */
    export class HeadCircle extends Circle {}

    /**
     * Represents a hitobject in a beatmap.
     */
    export abstract class HitObject {
        /**
         * The start time of the hitobject in milliseconds.
         */
        startTime: number;
        /**
         * The bitwise type of the hitobject (circle/slider/spinner).
         */
        readonly type: objectTypes;
        /**
         * The position of the hitobject in osu!pixels.
         */
        readonly position: Vector2;
        /**
         * The end position of the hitobject in osu!pixels.
         */
        readonly endPosition: Vector2;
        /**
         * The end time of the hitobject.
         */
        endTime: number;
        /**
         * The stacked position of the hitobject.
         */
        get stackedPosition(): Vector2;
        /**
         * The stacked end position of the hitobject.
         */
        get stackedEndPosition(): Vector2;
        /**
         * The stack vector to calculate offset for stacked positions.
         */
        get stackOffset(): Vector2;
        /**
         * Whether or not this hitobject represents a new combo in the beatmap.
         */
        readonly isNewCombo: boolean;
        /**
         * The stack height of the hitobject.
         */
        stackHeight: number;
        /**
         * The scale used to calculate stacked position and radius.
         */
        scale: number;
        /**
         * The radius of the hitobject.
         */
        get radius(): number;
        constructor(values: {
            startTime: number;
            position: Vector2;
            type: number;
            endTime?: number;
        });
        /**
         * Returns the hitobject type.
         */
        typeStr(): string;
        /**
         * Returns the string representative of the class.
         */
        abstract toString(): string;
    }

    export abstract class Interpolation {
        static lerp(start: number, final: number, amount: number): number;
    }

    /**
     * Represents a beatmap with general information.
     */
    export class MapInfo {
        /**
         * The title of the song of the beatmap.
         */
        title: string;
        /**
         * The full title of the beatmap, which is `Artist - Title (Creator) [Difficulty Name]`.
         */
        get fullTitle(): string;
        /**
         * The artist of the song of the beatmap.
         */
        artist: string;
        /**
         * The creator of the beatmap.
         */
        creator: string;
        /**
         * The difficulty name of the beatmap.
         */
        version: string;
        /**
         * The source of the song, if any.
         */
        source: string;
        /**
         * The ranking status of the beatmap.
         */
        approved: rankedStatus;
        /**
         * The ID of the beatmap.
         */
        beatmapID: number;
        /**
         * The ID of the beatmapset containing the beatmap.
         */
        beatmapsetID: number;
        /**
         * The amount of times the beatmap has been played.
         */
        plays: number;
        /**
         * The amount of times the beatmap has been favorited.
         */
        favorites: number;
        /**
         * The date of which the beatmap was submitted.
         */
        submitDate: Date;
        /**
         * The date of which the beatmap was last updated.
         */
        lastUpdate: Date;
        /**
         * The duration of the beatmap not including breaks.
         */
        hitLength: number;
        /**
         * The duration of the beatmap including breaks.
         */
        totalLength: number;
        /**
         * The BPM of the beatmap.
         */
        bpm: number;
        /**
         * The amount of circles in the beatmap.
         */
        circles: number;
        /**
         * The amount of sliders in the beatmap.
         */
        sliders: number;
        /**
         * The amount of spinners in the beatmap.
         */
        spinners: number;
        /**
         * The amount of objects in the beatmap.
         */
        get objects(): number;
        /**
         * The maximum combo of the beatmap.
         */
        maxCombo: number;
        /**
         * The circle size of the beatmap.
         */
        cs: number;
        /**
         * The approach rate of the beatmap.
         */
        ar: number;
        /**
         * The overall difficulty of the beatmap.
         */
        od: number;
        /**
         * The health drain rate of the beatmap.
         */
        hp: number;
        /**
         * The beatmap packs that contain this beatmap, represented by their ID.
         */
        packs: string[];
        /**
         * The aim difficulty rating of the beatmap.
         */
        aimDifficulty: number;
        /**
         * The speed difficulty rating of the beatmap.
         */
        speedDifficulty: number;
        /**
         * The generic difficulty rating of the beatmap.
         */
        totalDifficulty: number;
        /**
         * The MD5 hash of the beatmap.
         */
        hash: string;
        /**
         * Whether or not this beatmap has a storyboard.
         */
        storyboardAvailable: boolean;
        /**
         * Whether or not this beatmap has a video.
         */
        videoAvailable: boolean;
        /**
         * The parsed beatmap from beatmap parser.
         */
        get map(): Beatmap | undefined;
        private cachedBeatmap?: Beatmap;
        /**
         * Retrieve a beatmap's general information.
         *
         * Either beatmap ID or MD5 hash of the beatmap must be specified. If both are specified, beatmap ID is taken.
         */
        static getInformation(params: {
            /**
             * The ID of the beatmap.
             */
            beatmapID?: number;
            /**
             * The MD5 hash of the beatmap.
             */
            hash?: string;
            /**
             * Whether or not to also retrieve the .osu file of the beatmap (required for some utilities). Defaults to `true`.
             */
            file?: boolean;
        }): Promise<MapInfo>;
        /**
         * Fills the current instance with map data.
         *
         * @param mapinfo The map data.
         */
        fillMetadata(mapinfo: OsuAPIResponse): MapInfo;
        /**
         * Retrieves the .osu file of the beatmap.
         *
         * @param forceDownload Whether or not to download the file regardless if it's already available.
         */
        retrieveBeatmapFile(forceDownload?: boolean): Promise<MapInfo>;
        /**
         * Converts the beatmap's BPM if speed-changing mods are applied.
         */
        convertBPM(stats: MapStats): number;
        /**
         * Converts the beatmap's status into a string.
         */
        convertStatus(): string;
        /**
         * Converts the beatmap's length if speed-changing mods are applied.
         */
        convertTime(stats: MapStats): string;
        /**
         * Time string parsing function for statistics utility.
         */
        private timeString(second: number): string;
        /**
         * Shows the beatmap's statistics based on applied statistics and option.
         *
         * - Option `0`: return map title and mods used if defined
         * - Option `1`: return song source and map download link to beatmap mirrors
         * - Option `2`: return CS, AR, OD, HP
         * - Option `3`: return BPM, map length, max combo
         * - Option `4`: return last update date and map status
         * - Option `5`: return favorite count and play count
         *
         * @param option The option to pick.
         * @param stats The custom statistics to apply. This will only be used to apply mods, custom speed multiplier, and force AR.
         */
        showStatistics(option: number, stats?: MapStats): string;
        /**
         * Gets a color integer based on the beatmap's ranking status.
         *
         * Useful to make embed messages.
         */
        get statusColor(): number;
        /**
         * Calculates the osu!droid maximum score of the beatmap without taking spinner bonus into account.
         *
         * This requires .osu file to be downloaded.
         */
        maxScore(stats: MapStats): number;
        /**
         * Returns a string representative of the class.
         */
        toString(): string;
    }

    /**
     * Holds general beatmap statistics for further modifications.
     */
    export class MapStats {
        /**
         * The circle size of the beatmap.
         */
        cs?: number;
        /**
         * The approach rate of the beatmap.
         */
        ar?: number;
        /**
         * The overall difficulty of the beatmap.
         */
        od?: number;
        /**
         * The health drain rate of the beatmap.
         */
        hp?: number;
        /**
         * The enabled modifications.
         */
        mods: Mod[];
        /**
         * The speed multiplier applied from all modifications.
         */
        speedMultiplier: number;
        /**
         * Whether or not this map statistics uses forced AR.
         */
        isForceAR: boolean;
        /**
         * Whether to calculate for old statistics for osu!droid gamemode (1.6.7 and older). Defaults to `false`.
         */
        oldStatistics: boolean;
        /**
         * Whether this map statistics have been calculated.
         */
        private calculated: boolean;
        static readonly OD0_MS: number;
        static readonly OD10_MS: number;
        static readonly AR0_MS: number;
        static readonly AR5_MS: number;
        static readonly AR10_MS: number;
        static readonly OD_MS_STEP: number;
        static readonly AR_MS_STEP1: number;
        static readonly AR_MS_STEP2: number;
        constructor(values?: {
            /**
             * The circle size of the beatmap.
             */
            cs?: number;
            /**
             * The approach rate of the beatmap.
             */
            ar?: number;
            /**
             * The overall difficulty of the beatmap.
             */
            od?: number;
            /**
             * The health drain rate of the beatmap.
             */
            hp?: number;
            /**
             * Applied modifications in osu!standard format.
             */
            mods?: Mod[];
            /**
             * The speed multiplier to calculate for.
             */
            speedMultiplier?: number;
            /**
             * Whether or not force AR is turned on.
             */
            isForceAR?: boolean;
            /**
             * Whether to calculate for old statistics for osu!droid gamemode (1.6.7 or older).
             */
            oldStatistics?: boolean;
        });
        /**
         * Calculates map statistics.
         *
         * This can only be called once for an instance.
         */
        calculate(params?: {
            /**
             * The gamemode to calculate for. Defaults to `modes.osu`.
             */
            mode?: modes;
            /**
             * The applied modifications in osu!standard format.
             */
            mods?: string;
            /**
             * The speed multiplier to calculate for.
             */
            speedMultiplier?: number;
            /**
             * Whether or not force AR is turned on.
             */
            isForceAR?: boolean;
        }): MapStats;
        /**
         * Returns a string representative of the class.
         */
        toString(): string;
        /**
         * Utility function to apply speed and flat multipliers to stats where speed changes apply for AR.
         *
         * @param baseAR The base AR value.
         * @param speedMultiplier The speed multiplier to calculate.
         * @param statisticsMultiplier The statistics multiplier to calculate from map-changing nonspeed-changing mods.
         */
        static modifyAR(
            baseAR: number,
            speedMultiplier: number,
            statisticsMultiplier: number
        ): number;
        /**
         * Converts an AR value to its milliseconds value.
         *
         * @param ar The AR to convert.
         * @returns The milliseconds value represented by the AR.
         */
        static arToMS(ar: number): number;
        /**
         * Utility function to apply speed and flat multipliers to stats where speed changes apply for OD.
         *
         * @param baseOD The base OD value.
         * @param speedMultiplier The speed multiplier to calculate.
         * @param statisticsMultiplier The statistics multiplier to calculate from map-changing nonspeed-changing mods.
         */
        static modifyOD(
            baseOD: number,
            speedMultiplier: number,
            statisticsMultiplier: number
        ): number;
    }

    /**
     * Some math utility functions.
     */
    export abstract class MathUtils {
        /**
         * Rounds a specified number with specified amount of fractional digits.
         *
         * @param num The number to round.
         * @param fractionalDigits The amount of fractional digits.
         */
        static round(num: number, fractionalDigits: number): number;
        /**
         * Limits the specified number on range `[min, max]`.
         *
         * @param num The number to limit.
         * @param min The minimum range.
         * @param max The maximum range.
         */
        static clamp(num: number, min: number, max: number): number;
        /**
         * Calculates the standard deviation of a given data.
         *
         * @param data The data to calculate.
         */
        static calculateStandardDeviation(data: number[]): number;
    }

    /**
     * Represents a mod.
     */
    export abstract class Mod {
        /**
         * The score multiplier of this mod.
         */
        abstract readonly scoreMultiplier: number;
        /**
         * The acronym of the mod.
         */
        abstract readonly acronym: string;
        /**
         * The name of the mod.
         */
        abstract readonly name: string;
        /**
         * Whether the mod is ranked in osu!droid.
         */
        abstract readonly droidRanked: boolean;
        /**
         * Whether the mod is ranked in osu!standard.
         */
        abstract readonly pcRanked: boolean;
        /**
         * The bitwise enum of the mod.
         */
        abstract readonly bitwise: number;
        /**
         * The droid enum of the mod.
         */
        abstract readonly droidString: string;
        /**
         * Whether this mod only exists for osu!droid gamemode.
         */
        abstract readonly droidOnly: boolean;
    }

    /**
     * Represents the Auto mod.
     */
    export class ModAuto extends Mod {
        override readonly scoreMultiplier: number;
        override readonly acronym: string;
        override readonly name: string;
        override readonly droidRanked: boolean;
        override readonly pcRanked: boolean;
        override readonly bitwise: number;
        override readonly droidString: string;
        override readonly droidOnly: boolean;
    }

    /**
     * Represents the Autopilot mod.
     */
    export class ModAutopilot extends Mod {
        override readonly scoreMultiplier: number;
        override readonly acronym: string;
        override readonly name: string;
        override readonly droidRanked: boolean;
        override readonly pcRanked: boolean;
        override readonly bitwise: number;
        override readonly droidString: string;
        override readonly droidOnly: boolean;
    }

    /**
     * Represents the DoubleTime mod.
     */
    export class ModDoubleTime extends Mod {
        override readonly scoreMultiplier: number;
        override readonly acronym: string;
        override readonly name: string;
        override readonly droidRanked: boolean;
        override readonly pcRanked: boolean;
        override readonly bitwise: number;
        override readonly droidString: string;
        override readonly droidOnly: boolean;
    }

    /**
     * Represents the Easy mod.
     */
    export class ModEasy extends Mod {
        override readonly scoreMultiplier: number;
        override readonly acronym: string;
        override readonly name: string;
        override readonly droidRanked: boolean;
        override readonly pcRanked: boolean;
        override readonly bitwise: number;
        override readonly droidString: string;
        override readonly droidOnly: boolean;
    }

    /**
     * Represents the Flashlight mod.
     */
    export class ModFlashlight extends Mod {
        override readonly scoreMultiplier: number;
        override readonly acronym: string;
        override readonly name: string;
        override readonly droidRanked: boolean;
        override readonly pcRanked: boolean;
        override readonly bitwise: number;
        override readonly droidString: string;
        override readonly droidOnly: boolean;
    }

    /**
     * Represents the HalfTime mod.
     */
    export class ModHalfTime extends Mod {
        override readonly scoreMultiplier: number;
        override readonly acronym: string;
        override readonly name: string;
        override readonly droidRanked: boolean;
        override readonly pcRanked: boolean;
        override readonly bitwise: number;
        override readonly droidString: string;
        override readonly droidOnly: boolean;
    }

    /**
     * Represents the HardRock mod.
     */
    export class ModHardRock extends Mod {
        override readonly scoreMultiplier: number;
        override readonly acronym: string;
        override readonly name: string;
        override readonly droidRanked: boolean;
        override readonly pcRanked: boolean;
        override readonly bitwise: number;
        override readonly droidString: string;
        override readonly droidOnly: boolean;
    }

    /**
     * Represents the Hidden mod.
     */
    export class ModHidden extends Mod {
        override readonly scoreMultiplier: number;
        override readonly acronym: string;
        override readonly name: string;
        override readonly droidRanked: boolean;
        override readonly pcRanked: boolean;
        override readonly bitwise: number;
        override readonly droidString: string;
        override readonly droidOnly: boolean;
    }

    /**
     * Represents the NightCore mod.
     */
    export class ModNightCore extends Mod {
        override readonly scoreMultiplier: number;
        override readonly acronym: string;
        override readonly name: string;
        override readonly droidRanked: boolean;
        override readonly pcRanked: boolean;
        override readonly bitwise: number;
        override readonly droidString: string;
        override readonly droidOnly: boolean;
    }

    /**
     * Represents the NoFail mod.
     */
    export class ModNoFail extends Mod {
        override readonly scoreMultiplier: number;
        override readonly acronym: string;
        override readonly name: string;
        override readonly droidRanked: boolean;
        override readonly pcRanked: boolean;
        override readonly bitwise: number;
        override readonly droidString: string;
        override readonly droidOnly: boolean;
    }

    /**
     * Represents the Perfect mod.
     */
    export class ModPerfect extends Mod {
        override readonly scoreMultiplier: number;
        override readonly acronym: string;
        override readonly name: string;
        override readonly droidRanked: boolean;
        override readonly pcRanked: boolean;
        override readonly bitwise: number;
        override readonly droidString: string;
        override readonly droidOnly: boolean;
    }

    /**
     * Represents the Precise mod.
     */
    export class ModPrecise extends Mod {
        override readonly scoreMultiplier: number;
        override readonly acronym: string;
        override readonly name: string;
        override readonly droidRanked: boolean;
        override readonly pcRanked: boolean;
        override readonly bitwise: number;
        override readonly droidString: string;
        override readonly droidOnly: boolean;
    }

    /**
     * Represents the ReallyEasy mod.
     */
    export class ModReallyEasy extends Mod {
        override readonly scoreMultiplier: number;
        override readonly acronym: string;
        override readonly name: string;
        override readonly droidRanked: boolean;
        override readonly pcRanked: boolean;
        override readonly bitwise: number;
        override readonly droidString: string;
        override readonly droidOnly: boolean;
    }

    /**
     * Represents the Relax mod.
     */
    export class ModRelax extends Mod {
        override readonly scoreMultiplier: number;
        override readonly acronym: string;
        override readonly name: string;
        override readonly droidRanked: boolean;
        override readonly pcRanked: boolean;
        override readonly bitwise: number;
        override readonly droidString: string;
        override readonly droidOnly: boolean;
    }

    /**
     * Represents the ScoreV2 mod.
     */
    export class ModScoreV2 extends Mod {
        override readonly scoreMultiplier: number;
        override readonly acronym: string;
        override readonly name: string;
        override readonly droidRanked: boolean;
        override readonly pcRanked: boolean;
        override readonly bitwise: number;
        override readonly droidString: string;
        override readonly droidOnly: boolean;
    }

    /**
     * Represents the SmallCircle mod.
     */
    export class ModSmallCircle extends Mod {
        override readonly scoreMultiplier: number;
        override readonly acronym: string;
        override readonly name: string;
        override readonly droidRanked: boolean;
        override readonly pcRanked: boolean;
        override readonly bitwise: number;
        override readonly droidString: string;
        override readonly droidOnly: boolean;
    }

    /**
     * Represents the SpunOut mod.
     */
    export class ModSpunOut extends Mod {
        override readonly scoreMultiplier: number;
        override readonly acronym: string;
        override readonly name: string;
        override readonly droidRanked: boolean;
        override readonly pcRanked: boolean;
        override readonly bitwise: number;
        override readonly droidString: string;
        override readonly droidOnly: boolean;
    }

    /**
     * Represents the SuddenDeath mod.
     */
    export class ModSuddenDeath extends Mod {
        override readonly scoreMultiplier: number;
        override readonly acronym: string;
        override readonly name: string;
        override readonly droidRanked: boolean;
        override readonly pcRanked: boolean;
        override readonly bitwise: number;
        override readonly droidString: string;
        override readonly droidOnly: boolean;
    }

    /**
     * Represents the TouchDevice mod.
     */
    export class ModTouchDevice extends Mod {
        override readonly scoreMultiplier: number;
        override readonly acronym: string;
        override readonly name: string;
        override readonly droidRanked: boolean;
        override readonly pcRanked: boolean;
        override readonly bitwise: number;
        override readonly droidString: string;
        override readonly droidOnly: boolean;
    }

    /**
     * Utilities for mods.
     */
    export abstract class ModUtil {
        /**
         * Mods that are incompatible with each other.
         */
        static readonly incompatibleMods: Mod[][];
        /**
         * All mods that exists.
         */
        static readonly allMods: Mod[];
        /**
         * Mods that change the playback speed of a beatmap.
         */
        static readonly speedChangingMods: Mod[];
        /**
         * Mods that change the way the map looks.
         */
        static readonly mapChangingMods: Mod[];
        /**
         * Gets a list of mods from a droid mod string, such as "hd".
         *
         * @param str The string.
         */
        static droidStringToMods(str: string): Mod[];
        /**
         * Gets a list of mods from a PC modbits.
         *
         * @param modbits The modbits.
         */
        static pcModbitsToMods(modbits: number): Mod[];
        /**
         * Gets a list of mods from a PC mod string, such as "HDHR".
         *
         * @param str The string.
         */
        static pcStringToMods(str: string): Mod[];
        /**
         * Checks for mods that are incompatible with each other.
         *
         * @param mods The mods to check for.
         */
        private static checkDuplicateMods(mods: Mod[]): Mod[];
    }

    /**
     * API request builder for osu!standard.
     */
    export class OsuAPIRequestBuilder extends APIRequestBuilder {
        protected override readonly host: string;
        protected override readonly APIkey: string;
        protected override readonly APIkeyParam: string;
        override setEndpoint(endpoint: OsuAPIEndpoint): this;
    }

    /**
     * Represents the hit window of osu!standard.
     */
    export class OsuHitWindow extends HitWindow {
        override hitWindowFor300(): number;
        override hitWindowFor100(): number;
        override hitWindowFor50(): number;
    }

    /**
     * A beatmap parser with just enough data for pp calculation.
     */
    export class Parser {
        /**
         * The parsed beatmap.
         */
        readonly map: Beatmap;
        /**
         * The amount of lines of `.osu` file.
         */
        private line: string;
        /**
         * The currently processed line.
         */
        private currentLine: string;
        /**
         * The previously processed line.
         */
        private lastPosition: string;
        /**
         * The currently processed section.
         */
        private section: string;
        /**
         * Parses a beatmap.
         *
         * This will process a `.osu` file and returns the current instance of the parser for easy chaining.
         *
         * @param str The `.osu` file to parse.
         * @param mods The mods to parse the beatmap for.
         */
        parse(str: string, mods?: Mod[]): Parser;
        /**
         * Logs the line at which an exception occurs.
         */
        private logError(): string;
        /**
         * Processes a line of the file.
         */
        private processLine(line: string): Parser;
        /**
         * Sets the last position of the current parser state.
         *
         * This is useful to debug syntax errors.
         */
        private setPosition(str: string): string;
        /**
         * Logs any syntax errors into the console.
         */
        private warn(message: string): void;
        /**
         * Processes a property of the beatmap. This takes the current line as parameter.
         *
         * For example, `ApproachRate:9` will be split into `[ApproachRate, 9]`.
         */
        private property(): string[];
        /**
         * Processes the general section of a beatmap.
         */
        private general(): void;
        /**
         * Processes the metadata section of a beatmap.
         */
        private metadata(): void;
        /**
         * Processes the events section of a beatmap.
         */
        private events(): void;
        /**
         * Processes the difficulty section of a beatmap.
         */
        private difficulty(): void;
        /**
         * Processes the timing points section of a beatmap.
         */
        private timingPoints(): void;
        /**
         * Processes the objects section of a beatmap.
         */
        private objects(): void;
        /**
         * Applies stacking to hitobjects for beatmap version 6 or above.
         */
        private applyStacking(startIndex: number, endIndex: number): void;
        /**
         * Applies stacking to hitobjects for beatmap version 5 or below.
         */
        private applyStackingOld(): void;
        /**
         * Checks if a number is within a given threshold.
         *
         * @param num The number to check.
         * @param min The minimum threshold. Defaults to `-ParserConstants.MAX_PARSE_VALUE`.
         * @param max The maximum threshold. Defaults to `ParserConstants.MAX_PARSE_VALUE`.
         */
        private isNumberValid(num: number, min: number, max: number): boolean;
        /**
         * Checks if each coordinates of a vector is within a given threshold.
         *
         * @param vec The vector to check.
         * @param limit The threshold. Defaults to `ParserConstants.MAX_COORDINATE_VALUE`.
         */
        private isVectorValid(vec: Vector2, limit: number): boolean;
    }

    /**
     * Path approximator for sliders.
     */
    export abstract class PathApproximator {
        private static readonly bezierTolerance: number;
        /**
         * The amount of pieces to calculate for each control point quadruplet.
         */
        private static readonly catmullDetail: number;
        private static readonly circularArcTolerance: number;
        /**
         * Approximates a bezier slider's path.
         *
         * Creates a piecewise-linear approximation of a bezier curve, by adaptively repeatedly subdividing
         * the control points until their approximation error vanishes below a given threshold.
         *
         * @param controlPoints The anchor points of the slider.
         */
        static approximateBezier(controlPoints: Vector2[]): Vector2[];
        /**
         * Approximates a catmull slider's path.
         *
         * Creates a piecewise-linear approximation of a Catmull-Rom spline.
         *
         * @param controlPoints The anchor points of the slider.
         */
        static approximateCatmull(controlPoints: Vector2[]): Vector2[];
        /**
         * Approximates a slider's circular arc.
         *
         * Creates a piecewise-linear approximation of a circular arc curve.
         *
         * @param controlPoints The anchor points of the slider.
         */
        static approximateCircularArc(controlPoints: Vector2[]): Vector2[];
        /**
         * Approximates a linear slider's path.
         *
         * Creates a piecewise-linear approximation of a linear curve.
         * Basically, returns the input.
         *
         * @param controlPoints The anchor points of the slider.
         */
        static approximateLinear(controlPoints: Vector2[]): Vector2[];
        /**
         * Checks if a bezier slider is flat enough to be approximated.
         *
         * Make sure the 2nd order derivative (approximated using finite elements) is within tolerable bounds.
         *
         * NOTE: The 2nd order derivative of a 2d curve represents its curvature, so intuitively this function
         * checks (as the name suggests) whether our approximation is _locally_ "flat". More curvy parts
         * need to have a denser approximation to be more "flat".
         *
         * @param controlPoints The anchor points of the slider.
         */
        private static bezierIsFlatEnough(controlPoints: Vector2[]): void;
        /**
         * Approximates a bezier slider's path.
         *
         * This uses {@link https://en.wikipedia.org/wiki/De_Casteljau%27s_algorithm De Casteljau's algorithm} to obtain an optimal
         * piecewise-linear approximation of the bezier curve with the same amount of points as there are control points.
         *
         * @param controlPoints The control points describing the bezier curve to be approximated.
         * @param output The points representing the resulting piecewise-linear approximation.
         * @param subdivisionBuffer1 The first buffer containing the current subdivision state.
         * @param subdivisionBuffer2 The second buffer containing the current subdivision state.
         * @param count The number of control points in the original array.
         */
        private static bezierApproximate(
            controlPoints: Vector2[],
            output: Vector2[],
            subdivisionBuffer1: Vector2[],
            subdivisionBuffer2: Vector2[],
            count: number
        ): void;
        /**
         * Subdivides `n` control points representing a bezier curve into 2 sets of `n` control points, each
         * describing a bezier curve equivalent to a half of the original curve. Effectively this splits
         * the original curve into 2 curves which result in the original curve when pieced back together.
         *
         * @param controlPoints The anchor points of the slider.
         * @param l Parts of the slider for approximation.
         * @param r Parts of the slider for approximation.
         * @param subdivisionBuffer Parts of the slider for approximation.
         * @param count The amount of anchor points in the slider.
         */
        private static bezierSubdivide(
            controlPoints: Vector2[],
            l: Vector2[],
            r: Vector2[],
            subdivisionBuffer: Vector2[],
            count: number
        ): void;
        /**
         * Finds a point on the spline at the position of a parameter.
         *
         * @param vec1 The first vector.
         * @param vec2 The second vector.
         * @param vec3 The third vector.
         * @param vec4 The fourth vector.
         * @param t The parameter at which to find the point on the spline, in the range [0, 1].
         */
        private static catmullFindPoint(
            vec1: Vector2,
            vec2: Vector2,
            vec3: Vector2,
            vec4: Vector2,
            t: number
        ): Vector2;
    }

    /**
     * Precision utilities.
     */
    export abstract class Precision {
        static readonly FLOAT_EPSILON: number;
        /**
         * Checks if two numbers are equal with a given tolerance.
         *
         * @param value1 The first number.
         * @param value2 The second number.
         * @param acceptableDifference The acceptable difference as threshold. Default is `Precision.FLOAT_EPSILON = 1e-3`.
         */
        static almostEqualsNumber(
            value1: number,
            value2: number,
            acceptableDifference?: number
        ): boolean;
        /**
         * Checks if two vectors are equal with a given tolerance.
         *
         * @param vec1 The first vector.
         * @param vec2 The second vector.
         * @param acceptableDifference The acceptable difference as threshold. Default is `Precision.FLOAT_EPSILON = 1e-3`.
         */
        static almostEqualsVector(
            vec1: Vector2,
            vec2: Vector2,
            acceptableDifference?: number
        ): boolean;
    }

    /**
     * Represents a repeat point in a slider.
     */
    export class RepeatPoint extends HitObject {
        /**
         * The index of the repeat point.
         */
        readonly repeatIndex: number;
        /**
         * The duration of the repeat point.
         */
        readonly spanDuration: number;
        constructor(values: {
            position: Vector2;
            startTime: number;
            repeatIndex: number;
            spanDuration: number;
        });
        override toString(): string;
    }

    /**
     * Represents a slider in a beatmap.
     */
    export class Slider extends HitObject {
        /**
         * The nested hitobjects of the slider. Consists of headcircle (sliderhead), slider ticks, repeat points, and tailcircle (sliderend).
         */
        readonly nestedHitObjects: HitObject[];
        /**
         * The slider's path.
         */
        readonly path: SliderPath;
        /**
         * The slider's velocity.
         */
        readonly velocity: number;
        /**
         * The spacing between slider ticks of this slider.
         */
        readonly tickDistance: number;
        /**
         * The position of the cursor at the point of completion of this slider if it was hit
         * with as few movements as possible. This is set and used by difficulty calculation.
         */
        lazyEndPosition?: Vector2;
        /**
         * The distance travelled by the cursor upon completion of this slider if it was hit
         * with as few movements as possible. This is set and used by difficulty calculation.
         */
        lazyTravelDistance: number;
        /**
         * The time taken by the cursor upon completion of this slider if it was hit with
         * as few movements as possible. This is set and used by difficulty calculation.
         */
        lazyTravelTime: number;
        /**
         * The length of one span of this slider.
         */
        readonly spanDuration: number;
        /**
         * The slider's head (sliderhead).
         */
        readonly headCircle: HeadCircle;
        /**
         * The slider's tail (sliderend).
         */
        readonly tailCircle: TailCircle;
        /**
         * The duration of this slider.
         */
        get duration(): number;
        /**
         * The amount of slider ticks in this slider.
         */
        get ticks(): number;
        /**
         * The amount of repeat points in this slider.
         */
        get repeatPoints(): number;
        /**
         * The repetition amount of the slider. Note that 1 repetition means no repeats (1 loop).
         */
        private readonly repetitions: number;
        static readonly legacyLastTickOffset: number;
        constructor(values: {
            startTime: number;
            type: number;
            position: Vector2;
            repetitions: number;
            path: SliderPath;
            speedMultiplier: number;
            msPerBeat: number;
            mapSliderVelocity: number;
            mapTickRate: number;
            tickDistanceMultiplier: number;
        });
        override toString(): string;
    }

    /**
     * Represents a slider's path.
     */
    export class SliderPath {
        /**
         * The path type of the slider.
         */
        readonly pathType: PathType;
        /**
         * The control points (anchor points) of the slider.
         */
        readonly controlPoints: Vector2[];
        /**
         * Distance that is expected when calculating slider path.
         */
        readonly expectedDistance: number;
        /**
         * Whether or not the instance has been initialized.
         */
        isInitialized: boolean;
        /**
         * The calculated path of the slider.
         */
        readonly calculatedPath: Vector2[];
        /**
         * The cumulative length of the slider.
         */
        readonly cumulativeLength: number[];
        /**
         * The path approximator of the slider.
         */
        readonly pathApproximator: PathApproximator;
        constructor(values: {
            /**
             * The path type of the slider.
             */
            pathType: PathType;
            /**
             * The anchor points of the slider.
             */
            controlPoints: Vector2[];
            /**
             * The distance that is expected when calculating slider path.
             */
            expectedDistance: number;
        });
        /**
         * Initializes the instance.
         */
        ensureInitialized(): void;
        /**
         * Calculates the slider's path.
         */
        calculatePath(): void;
        /**
         * Calculates the slider's subpath.
         */
        calculateSubPath(subControlPoints: Vector2[]): Vector2[];
        /**
         * Calculates the slider's cumulative length.
         */
        calculateCumulativeLength(): void;
        /**
         * Computes the position on the slider at a given progress that ranges from 0 (beginning of the path)
         * to 1 (end of the path).
         *
         * @param progress Ranges from 0 (beginning of the path) to 1 (end of the path).
         */
        positionAt(progress: number): Vector2;
        /**
         * Returns the progress of reaching expected distance.
         */
        private progressToDistance(progress: number): number;
        /**
         * Interpolates verticles of the slider.
         */
        private interpolateVerticles(i: number, d: number): Vector2;
        /**
         * Returns the index of distance.
         */
        private indexOfDistance(d: number): number;
    }

    /**
     * Represents a slider tick in a slider.
     */
    export class SliderTick extends HitObject {
        /**
         * The index of the slider tick.
         */
        readonly spanIndex: number;
        /**
         * The start time of the slider tick.
         */
        readonly spanStartTime: number;
        constructor(values: {
            position: Vector2;
            startTime: number;
            spanIndex: number;
            spanStartTime: number;
        });
        override toString(): string;
    }

    /**
     * Represents a spinner in a beatmap.
     *
     * All we need from spinners is their duration. The
     * position of a spinner is always at 256x192.
     */
    export class Spinner extends HitObject {
        /**
         * The duration of the spinner.
         */
        readonly duration: number;
        constructor(values: {
            startTime: number;
            type: number;
            duration: number;
        });
        override toString(): string;
    }

    /**
     * Represents the tailcircle of a slider (sliderend).
     */
    export class TailCircle extends Circle {}

    /**
     * Represents a timing point that changes the beatmap's BPM.
     */
    export class TimingControlPoint extends TimingPoint {
        /**
         * The amount of milliseconds passed for each beat.
         */
        readonly msPerBeat: number;
        constructor(values: { time: number; msPerBeat: number });
        override toString(): string;
    }

    /**
     * Based on `Vector2` class in C#.
     */
    export class Vector2 {
        /**
         * The x position of the vector.
         */
        x: number;
        /**
         * The y position of the vector.
         */
        y: number;
        /**
         * @param x The x position of the vector.
         * @param y The y position of the vector.
         */
        constructor(x: number, y: number);
        /**
         * Multiplies the vector with another vector.
         */
        multiply(vec: Vector2): Vector2;
        divide(divideFactor: number): Vector2;
        /**
         * Adds the vector with another vector.
         */
        add(vec: Vector2): Vector2;
        /**
         * Subtracts the vector with another vector.
         */
        subtract(vec: Vector2): Vector2;
        /**
         * The length of the vector.
         */
        get length(): number;
        /**
         * Performs a dot multiplication with another vector.
         */
        dot(vec: Vector2): number;
        /**
         * Scales the vector.
         */
        scale(scaleFactor: number): Vector2;
        /**
         * Gets the distance between this vector and another vector.
         */
        getDistance(vec: Vector2): number;
        /**
         * Normalizes the vector.
         */
        normalize(): void;
    }

    /**
     * Some utilities, no biggie.
     */
    export abstract class Utils {
        /**
         * Returns a random element of an array.
         *
         * @param array The array to get the element from.
         */
        static getRandomArrayElement<T>(array: T[]): T;
        /**
         * Deep copies an instance.
         *
         * @param instance The instance to deep copy.
         */
        static deepCopy<T>(instance: T): T;
        /**
         * Creates an array with specific length that's prefilled with an initial value.
         *
         * @param length The length of the array.
         * @param initialValue The initial value of each array value.
         */
        static initializeArray<T>(length: number, initialValue?: T): T[];
    }

    //#endregion

    //#region Enums

    /**
     * Mode enum to switch things between osu!droid and osu!standard.
     */
    export enum modes {
        droid = "droid",
        osu = "osu",
    }

    /**
     * Bitmask constant of object types. This is needed as osu! uses bits to determine object types.
     */
    export enum objectTypes {
        circle = 1 << 0,
        slider = 1 << 1,
        spinner = 1 << 3,
    }

    /**
     * Constants for beatmap parser.
     */
    export enum ParserConstants {
        MAX_PARSE_VALUE = 2147483647,
        MAX_COORDINATE_VALUE = 131072,
        MIN_REPETITIONS_VALUE = 0,
        MAX_REPETITIONS_VALUE = 9000,
        MIN_DISTANCE_VALUE = 0,
        MAX_DISTANCE_VALUE = 131072,
        MIN_SPEEDMULTIPLIER_VALUE = 0.1,
        MAX_SPEEDMULTIPLIER_VALUE = 10,
        MIN_MSPERBEAT_VALUE = 6,
        MAX_MSPERBEAT_VALUE = 60000,
    }

    /**
     * Types of slider paths.
     */
    export enum PathType {
        Catmull = 0,
        Bezier = 1,
        Linear = 2,
        PerfectCurve = 3,
    }

    /**
     * Ranking status of a beatmap.
     */
    export enum rankedStatus {
        GRAVEYARD = -2,
        WIP = -1,
        PENDING = 0,
        RANKED = 1,
        APPROVED = 2,
        QUALIFIED = 3,
        LOVED = 4,
    }

    //#endregion

    //#region Interfaces

    /**
     * Information about an accuracy value.
     */
    export interface AccuracyInformation {
        /**
         * The amount of objects in the beatmap.
         */
        nobjects?: number;
        /**
         * The accuracy achieved.
         */
        percent?: number;
        /**
         * The amount of 300s achieved.
         */
        n300?: number;
        /**
         * The amount of 100s achieved.
         */
        n100?: number;
        /**
         * The amount of 50s achieved.
         */
        n50?: number;
        /**
         * The amount of misses achieved.
         */
        nmiss?: number;
    }

    /**
     * Represents a `get_beatmaps` response from osu! API.
     */
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

    //#endregion

    //#region Types

    export type DroidAPIEndpoint =
        | "banscore.php"
        | "getuserinfo.php"
        | "scoresearch.php"
        | "scoresearchv2.php"
        | "rename.php"
        | "upload"
        | "user_list.php"
        | "usergeneral.php"
        | "top.php"
        | "time.php";

    export type OsuAPIEndpoint =
        | "get_beatmaps"
        | "get_user"
        | "get_scores"
        | "get_user_best"
        | "get_user_recent"
        | "get_match"
        | "get_replay";

    //#endregion

    //#region Unexported classes

    abstract class APIRequestBuilder {
        /**
         * The main point of API host.
         */
        protected abstract readonly host: string;
        /**
         * The API key for this builder.
         */
        protected abstract readonly APIkey: string;
        /**
         * The parameter for API key requests.
         */
        protected abstract readonly APIkeyParam: string;
        /**
         * Whether or not to include the API key in the request URL.
         */
        protected requiresAPIkey: boolean;
        /**
         * The endpoint of this builder.
         */
        protected endpoint: DroidAPIEndpoint | OsuAPIEndpoint | string;
        /**
         * The parameters of this builder.
         */
        protected readonly params: Map<string, string | number>;
        private fetchAttempts: number;
        /**
         * Sets the API endpoint.
         *
         * @param endpoint The endpoint to set.
         */
        abstract setEndpoint(endpoint: DroidAPIEndpoint | OsuAPIEndpoint): this;
        /**
         * Sets if this builder includes the API key in the request URL.
         *
         * @param requireAPIkey Whether or not to include the API key in the request URL.
         */
        setRequireAPIkey(requireAPIkey: boolean): this;
        /**
         * Builds the URL to request the API.
         */
        buildURL(): string;
        /**
         * Sends a request to the API using built parameters.
         *
         * If the request fails, it will be redone 5 times.
         */
        sendRequest(): Promise<RequestResponse>;
        /**
         * Adds a parameter to the builder.
         *
         * @param param The parameter to add.
         * @param value The value to add for the parameter.
         */
        addParameter(param: string, value: string | number): this;
        /**
         * Removes a parameter from the builder.
         *
         * @param param The parameter to remove.
         */
        removeParameter(param: string): this;
    }

    abstract class HitWindow {
        /**
         * The overall difficulty of this hit window.
         */
        readonly overallDifficulty: number;
        /**
         * Gets the threshold for 300 (great) hit result.
         *
         * @param isPrecise Whether or not to calculate for Precise mod. This is only available for `DroidHitWindow`.
         */
        abstract hitWindowFor300(isPrecise?: boolean): number;
        /**
         * Gets the threshold for 100 (good) hit result.
         *
         * @param isPrecise Whether or not to calculate for Precise mod. This is only available for `DroidHitWindow`.
         */
        abstract hitWindowFor100(isPrecise?: boolean): number;
        /**
         * Gets the threshold for 50 (meh) hit result.
         *
         * @param isPrecise Whether or not to calculate for Precise mod. This is only available for `DroidHitWindow`.
         */
        abstract hitWindowFor50(isPrecise?: boolean): number;
        constructor(overallDifficulty: number);
    }

    /**
     * Represents a timing point in a beatmap.
     */
    abstract class TimingPoint {
        /**
         * The time at which the timing point takes effect in milliseconds.
         */
        readonly time: number;
        constructor(values: {
            /**
             * The time at which the timing point takes effect in milliseconds.
             */
            time: number;
        });
        /**
         * Returns a string representative of the class.
         */
        abstract toString(): string;
    }

    //#endregion
}
