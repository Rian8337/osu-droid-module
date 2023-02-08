import {
    Accuracy,
    Beatmap,
    DroidAPIRequestBuilder,
    DroidHitWindow,
    MapStats,
    MathUtils,
    ModFlashlight,
    ModHidden,
    ModPrecise,
    ModUtil,
    PlaceableHitObject,
    RequestResponse,
    Slider,
    Spinner,
} from "@rian8337/osu-base";
import { DroidDifficultyCalculator } from "@rian8337/osu-difficulty-calculator";
import { DroidDifficultyCalculator as RebalanceDroidDifficultyCalculator } from "@rian8337/osu-rebalance-difficulty-calculator";
import { Parse } from "unzipper";
import * as javaDeserialization from "java-deserialization";
import { Readable } from "stream";
import { ReplayData, ReplayInformation } from "./data/ReplayData";
import { CursorData } from "./data/CursorData";
import { ReplayObjectData } from "./data/ReplayObjectData";
import {
    ThreeFingerChecker,
    ThreeFingerInformation,
} from "./analysis/ThreeFingerChecker";
import { TwoHandChecker, TwoHandInformation } from "./analysis/TwoHandChecker";
import { MovementType } from "./constants/MovementType";
import { HitResult } from "./constants/HitResult";
import { SliderCheeseChecker } from "./analysis/SliderCheeseChecker";

export interface HitErrorInformation {
    negativeAvg: number;
    positiveAvg: number;
    unstableRate: number;
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
    originalODR: Buffer | null = null;

    /**
     * The fixed odr file of the replay.
     */
    fixedODR: Buffer | null = null;

    /**
     * Whether or not the play is considered using >=3 finger abuse.
     */
    is3Finger?: boolean;

    /**
     * Whether or not the play is considered 2-handed.
     */
    is2Hand?: boolean;

    /**
     * The beatmap that is being analyzed. `DroidDifficultyCalculator` or `RebalanceDroidDifficultyCalculator` is required for three finger or two hand analyzing.
     */
    beatmap?:
        | Beatmap
        | DroidDifficultyCalculator
        | RebalanceDroidDifficultyCalculator;

    /**
     * The results of the analyzer. `null` when initialized.
     */
    data: ReplayData | null = null;

    /**
     * Penalty value used to penalize dpp for 2-hand.
     */
    aimPenalty: number = 1;

    /**
     * Penalty value used to penalize dpp for 3 finger abuse.
     */
    tapPenalty: number = 1;

    /**
     * Penalty value used to penalize dpp for slider cheesing.
     */
    sliderCheesePenalty: number = 1;

    /**
     * Whether this replay has been checked against 3 finger usage.
     */
    hasBeenCheckedFor3Finger: boolean = false;

    /**
     * Whether this replay has been checked against 2 hand usage.
     */
    hasBeenCheckedFor2Hand: boolean = false;

    /**
     * The amount of two-handed objects.
     */
    twoHandedNoteCount: number = 0;

    // Sizes of primitive data types in Java (in bytes)
    private readonly BYTE_LENGTH: number = 1;
    private readonly SHORT_LENGTH: number = 2;
    private readonly INT_LENGTH: number = 4;
    private readonly FLOAT_LENGTH: number = 4;
    private readonly LONG_LENGTH: number = 8;

    constructor(values: {
        /**
         * The ID of the score.
         */
        scoreID: number;

        /**
         * The beatmap to analyze.
         *
         * `DroidDifficultyCalculator` or `RebalanceDroidDifficultyCalculator` is required for three finger or two hand analyzing.
         */
        map?:
            | Beatmap
            | DroidDifficultyCalculator
            | RebalanceDroidDifficultyCalculator;
    }) {
        this.scoreID = values.scoreID;
        this.beatmap = values.map;
    }

    /**
     * Analyzes a replay.
     */
    async analyze(): Promise<ReplayAnalyzer> {
        if (!this.originalODR && !this.fixedODR) {
            this.originalODR = await this.downloadReplay();
        }

        if (!this.originalODR) {
            return this;
        }

        if (!this.fixedODR) {
            this.fixedODR = await this.decompress().catch(() => null);
        }

        if (!this.fixedODR) {
            return this;
        }

        this.parseReplay();
        return this;
    }

    /**
     * Downloads the given score ID's replay.
     */
    private async downloadReplay(): Promise<Buffer | null> {
        const apiRequestBuilder: DroidAPIRequestBuilder =
            new DroidAPIRequestBuilder()
                .setRequireAPIkey(false)
                .setEndpoint("upload")
                .addParameter("", `${this.scoreID}.odr`);

        const result: RequestResponse = await apiRequestBuilder.sendRequest();

        if (result.statusCode !== 200) {
            return null;
        }

        return result.data;
    }

    /**
     * Decompresses a replay.
     *
     * The decompressed replay is in a form of Java object. This will be converted to a buffer and deserialized to read data from the replay.
     */
    private decompress(): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const stream: Readable = new Readable();
            stream.push(this.originalODR);
            stream.push(null);
            stream
                .pipe(Parse())
                .on("entry", async (entry) => {
                    const fileName: string = entry.path;
                    if (fileName === "data") {
                        return resolve(await entry.buffer());
                    } else {
                        entry.autodrain();
                    }
                })
                .on("error", (e) => {
                    setTimeout(() => reject(e), 2000);
                });
        });
    }

    /**
     * Parses a replay after being downloaded and converted to a buffer.
     */
    private parseReplay(): void {
        // javaDeserialization can only somewhat parse some string field
        // the rest will be a buffer that we need to manually parse
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let rawObject: any[];
        try {
            rawObject = javaDeserialization.parse(this.fixedODR);
        } catch {
            return;
        }

        const resultObject: ReplayInformation = {
            replayVersion: rawObject[0].version,
            folderName: rawObject[1],
            fileName: rawObject[2],
            hash: rawObject[3],
            cursorMovement: [],
            hitObjectData: [],
        };

        if (resultObject.replayVersion >= 3) {
            resultObject.time = new Date(
                Number(rawObject[4].readBigUInt64BE(0))
            );
            resultObject.hit300k = rawObject[4].readInt32BE(8);
            resultObject.hit100k = rawObject[4].readInt32BE(16);
            resultObject.score = rawObject[4].readInt32BE(32);
            resultObject.maxCombo = rawObject[4].readInt32BE(36);
            resultObject.accuracy = new Accuracy({
                n300: rawObject[4].readInt32BE(12),
                n100: rawObject[4].readInt32BE(20),
                n50: rawObject[4].readInt32BE(24),
                nmiss: rawObject[4].readInt32BE(28),
            });
            resultObject.isFullCombo = !!rawObject[4][44];
            resultObject.playerName = rawObject[5];
            resultObject.rawMods = rawObject[6].elements;
            resultObject.convertedMods = ModUtil.droidStringToMods(
                this.convertDroidMods(rawObject[6].elements)
            );

            // Determine rank
            const totalHits: number =
                resultObject.accuracy.n300 +
                resultObject.accuracy.n100 +
                resultObject.accuracy.n50 +
                resultObject.accuracy.nmiss;
            const isHidden: boolean = resultObject.convertedMods.some(
                (m) => m instanceof ModHidden || m instanceof ModFlashlight
            );

            const hit300Ratio: number = resultObject.accuracy.n300 / totalHits;

            switch (true) {
                case resultObject.accuracy.value() === 1:
                    if (isHidden) {
                        resultObject.rank = "XH";
                    } else {
                        resultObject.rank = "X";
                    }
                    break;
                case hit300Ratio > 0.9 &&
                    resultObject.accuracy.n50 / totalHits < 0.01 &&
                    !resultObject.accuracy.nmiss:
                    if (isHidden) {
                        resultObject.rank = "SH";
                    } else {
                        resultObject.rank = "S";
                    }
                    break;
                case (hit300Ratio > 0.8 && !resultObject.accuracy.nmiss) ||
                    hit300Ratio > 0.9:
                    resultObject.rank = "A";
                    break;
                case (hit300Ratio > 0.7 && !resultObject.accuracy.nmiss) ||
                    hit300Ratio > 0.8:
                    resultObject.rank = "B";
                    break;
                case hit300Ratio > 0.6:
                    resultObject.rank = "C";
                    break;
                default:
                    resultObject.rank = "D";
            }
        }

        if (resultObject.replayVersion >= 4) {
            const s: string[] = rawObject[7].split("|");
            resultObject.speedModification =
                parseFloat(s[0].replace("x", "")) || 1;
            if (s.length > 1) {
                resultObject.forcedAR = parseFloat(s[1].replace("AR", ""));
            }
        }

        let bufferIndex: number;
        switch (true) {
            // replay v4 and above
            case resultObject.replayVersion >= 4:
                bufferIndex = 8;
                break;
            // replay v3
            case resultObject.replayVersion === 3:
                bufferIndex = 7;
                break;
            // replay v1 and v2
            default:
                bufferIndex = 4;
        }

        const replayDataBufferArray: Buffer[] = [];

        while (bufferIndex < rawObject.length) {
            replayDataBufferArray.push(rawObject[bufferIndex++]);
        }

        // Merge all cursor movement and hit object data section into one for better control when parsing
        const replayDataBuffer: Buffer = Buffer.concat(replayDataBufferArray);
        let bufferCounter: number = 0;

        const size: number = replayDataBuffer.readInt32BE(bufferCounter);
        bufferCounter += this.INT_LENGTH;

        // Parse movement data
        for (let x = 0; x < size; x++) {
            const moveSize: number =
                replayDataBuffer.readInt32BE(bufferCounter);
            bufferCounter += this.INT_LENGTH;
            const time: number[] = [];
            const x: number[] = [];
            const y: number[] = [];
            const id: MovementType[] = [];
            for (let i = 0; i < moveSize; i++) {
                time[i] = replayDataBuffer.readInt32BE(bufferCounter);
                bufferCounter += this.INT_LENGTH;
                id[i] = time[i] & 3;
                time[i] >>= 2;
                if (id[i] !== MovementType.up) {
                    if (resultObject.replayVersion >= 5) {
                        x[i] = replayDataBuffer.readFloatBE(bufferCounter);
                        bufferCounter += this.FLOAT_LENGTH;
                        y[i] = replayDataBuffer.readFloatBE(bufferCounter);
                        bufferCounter += this.FLOAT_LENGTH;
                    } else {
                        x[i] = replayDataBuffer.readInt16BE(bufferCounter);
                        bufferCounter += this.SHORT_LENGTH;
                        y[i] = replayDataBuffer.readInt16BE(bufferCounter);
                        bufferCounter += this.SHORT_LENGTH;
                    }
                } else {
                    x[i] = -1;
                    y[i] = -1;
                }
            }
            resultObject.cursorMovement.push(
                new CursorData({
                    size: moveSize,
                    time: time,
                    x: x,
                    y: y,
                    id: id,
                })
            );
        }

        const replayObjectLength: number =
            replayDataBuffer.readInt32BE(bufferCounter);
        bufferCounter += this.INT_LENGTH;

        // Parse result data
        for (let i = 0; i < replayObjectLength; i++) {
            const replayObjectData: ReplayObjectData = {
                accuracy: 0,
                tickset: [],
                result: 0,
            };

            replayObjectData.accuracy =
                replayDataBuffer.readInt16BE(bufferCounter);
            bufferCounter += this.SHORT_LENGTH;
            const len = replayDataBuffer.readInt8(bufferCounter);
            bufferCounter += this.BYTE_LENGTH;

            if (len > 0) {
                const bytes: number[] = [];

                for (let j = 0; j < len; j++) {
                    bytes.push(replayDataBuffer.readInt8(bufferCounter));
                    bufferCounter += this.BYTE_LENGTH;
                }
                // Int/int division in Java; numbers must be truncated to get actual number
                for (let j = 0; j < len * 8; j++) {
                    replayObjectData.tickset.push(
                        (bytes[len - Math.trunc(j / 8) - 1] &
                            (1 << Math.trunc(j % 8))) !==
                            0
                    );
                }
            }

            if (resultObject.replayVersion >= 1) {
                replayObjectData.result =
                    replayDataBuffer.readInt8(bufferCounter);
                bufferCounter += this.BYTE_LENGTH;
            }

            resultObject.hitObjectData.push(replayObjectData);
        }

        // Parse max combo, hit results, and accuracy in old replay version
        if (resultObject.replayVersion < 3 && this.beatmap) {
            let hit300: number = 0;
            let hit300k: number = 0;
            let hit100: number = 0;
            let hit100k: number = 0;
            let hit50: number = 0;
            let hit0: number = 0;
            let grantsGekiOrKatu: boolean = true;

            const objects: readonly PlaceableHitObject[] = (
                this.beatmap instanceof DroidDifficultyCalculator ||
                this.beatmap instanceof RebalanceDroidDifficultyCalculator
                    ? this.beatmap.beatmap
                    : this.beatmap
            ).hitObjects.objects;

            for (let i = 0; i < resultObject.hitObjectData.length; ++i) {
                // Hit result
                const hitObjectData: ReplayObjectData =
                    resultObject.hitObjectData[i];
                const isNextNewCombo: boolean =
                    i + 1 !== objects.length ? objects[i + 1].isNewCombo : true;

                switch (hitObjectData.result) {
                    case HitResult.miss:
                        ++hit0;
                        grantsGekiOrKatu = false;
                        break;
                    case HitResult.meh:
                        ++hit50;
                        grantsGekiOrKatu = false;
                        break;
                    case HitResult.good:
                        ++hit100;
                        if (grantsGekiOrKatu && isNextNewCombo) {
                            ++hit100k;
                        }
                        break;
                    case HitResult.great:
                        ++hit300;
                        if (grantsGekiOrKatu && isNextNewCombo) {
                            ++hit300k;
                        }
                        break;
                }

                if (isNextNewCombo) {
                    grantsGekiOrKatu = true;
                }
            }

            resultObject.hit300k = hit300k;
            resultObject.hit100k = hit100k;

            resultObject.accuracy = new Accuracy({
                n300: hit300,
                n100: hit100,
                n50: hit50,
                nmiss: hit0,
                nobjects: hit300 + hit100 + hit50 + hit0,
            });

            // Determine rank
            const totalHits: number =
                resultObject.accuracy.n300 +
                resultObject.accuracy.n100 +
                resultObject.accuracy.n50 +
                resultObject.accuracy.nmiss;
            const isHidden: boolean =
                resultObject.convertedMods?.some(
                    (m) => m instanceof ModHidden || m instanceof ModFlashlight
                ) ?? false;

            const hit300Ratio: number = resultObject.accuracy.n300 / totalHits;

            switch (true) {
                case resultObject.accuracy.value() === 1:
                    if (isHidden) {
                        resultObject.rank = "XH";
                    } else {
                        resultObject.rank = "X";
                    }
                    break;
                case hit300Ratio > 0.9 &&
                    resultObject.accuracy.n50 / totalHits < 0.01 &&
                    !resultObject.accuracy.nmiss:
                    if (isHidden) {
                        resultObject.rank = "SH";
                    } else {
                        resultObject.rank = "S";
                    }
                    break;
                case (hit300Ratio > 0.8 && !resultObject.accuracy.nmiss) ||
                    hit300Ratio > 0.9:
                    resultObject.rank = "A";
                    break;
                case (hit300Ratio > 0.7 && !resultObject.accuracy.nmiss) ||
                    hit300Ratio > 0.8:
                    resultObject.rank = "B";
                    break;
                case hit300Ratio > 0.6:
                    resultObject.rank = "C";
                    break;
                default:
                    resultObject.rank = "D";
            }
        }

        this.data = new ReplayData(resultObject);
    }

    /**
     * Gets hit error information of the replay.
     *
     * `analyze()` must be called before calling this.
     */
    calculateHitError(): HitErrorInformation | null {
        if (!this.data || !this.beatmap) {
            return null;
        }

        const hitObjectData: ReplayObjectData[] = this.data.hitObjectData;
        let positiveCount: number = 0;
        let negativeCount: number = 0;
        let positiveTotal: number = 0;
        let negativeTotal: number = 0;

        const beatmap: Beatmap =
            this.beatmap instanceof DroidDifficultyCalculator ||
            this.beatmap instanceof RebalanceDroidDifficultyCalculator
                ? this.beatmap.beatmap
                : this.beatmap;
        const objects: readonly PlaceableHitObject[] =
            beatmap.hitObjects.objects;

        const stats: MapStats = new MapStats({
            od: beatmap.difficulty.od,
            mods: this.data.convertedMods.filter(
                (m) =>
                    !ModUtil.speedChangingMods.some(
                        (v) => v.acronym === m.acronym
                    )
            ),
        }).calculate();
        const hitWindow50: number = new DroidHitWindow(
            stats.od!
        ).hitWindowFor50(
            this.data.convertedMods.some((m) => m instanceof ModPrecise)
        );

        // The accuracy of sliders is set to (50 hit window)ms + 13ms if their head was not hit:
        // https://github.com/osudroid/osu-droid/blob/6306c68e3ffaf671eac794bf45cc95c0f3313a82/src/ru/nsu/ccfit/zuev/osu/game/Slider.java#L821
        //
        // In such cases, the slider is skipped.
        const sliderbreakHitOffset: number = Math.floor(hitWindow50) + 13;
        const accuracies: number[] = [];

        for (let i = 0; i < hitObjectData.length; ++i) {
            const v: ReplayObjectData = hitObjectData[i];
            const o: PlaceableHitObject = objects[i];

            if (o instanceof Spinner || v.result === HitResult.miss) {
                accuracies.push(0);
                continue;
            }

            const accuracy: number = v.accuracy;

            if (o instanceof Slider && v.accuracy === sliderbreakHitOffset) {
                accuracies.push(0);
                continue;
            }

            accuracies.push(accuracy);

            if (accuracy >= 0) {
                positiveTotal += accuracy;
                ++positiveCount;
            } else {
                negativeTotal += accuracy;
                ++negativeCount;
            }
        }

        return {
            positiveAvg: positiveTotal / positiveCount || 0,
            negativeAvg: negativeTotal / negativeCount || 0,
            unstableRate: MathUtils.calculateStandardDeviation(accuracies) * 10,
        };
    }

    /**
     * Converts replay mods to droid mod string.
     */
    private convertDroidMods(replayMods: string[]): string {
        const replayModsConstants = {
            MOD_NOFAIL: "n",
            MOD_EASY: "e",
            MOD_HIDDEN: "h",
            MOD_HARDROCK: "r",
            MOD_DOUBLETIME: "d",
            MOD_HALFTIME: "t",
            MOD_NIGHTCORE: "c",
            MOD_PRECISE: "s",
            MOD_SMALLCIRCLE: "m",
            MOD_SPEEDUP: "b",
            MOD_REALLYEASY: "l",
            MOD_PERFECT: "f",
            MOD_SUDDENDEATH: "u",
            MOD_SCOREV2: "v",
        };

        let modString: string = "";
        for (const mod of replayMods) {
            for (const property in replayModsConstants) {
                if (!(property in replayModsConstants)) {
                    continue;
                }
                if (!mod.includes(property)) {
                    continue;
                }
                modString +=
                    replayModsConstants[
                        property as keyof typeof replayModsConstants
                    ];
                break;
            }
        }

        return modString;
    }

    /**
     * Checks if a play is using 3 fingers.
     *
     * Requires `analyze()` to be called first and `map` to be defined as `DroidDifficultyCalculator`.
     */
    checkFor3Finger(): void {
        if (
            !(
                this.beatmap instanceof DroidDifficultyCalculator ||
                this.beatmap instanceof RebalanceDroidDifficultyCalculator
            ) ||
            !this.data
        ) {
            return;
        }

        const threeFingerChecker: ThreeFingerChecker = new ThreeFingerChecker(
            this.beatmap,
            this.data
        );
        const result: ThreeFingerInformation = threeFingerChecker.check();

        this.is3Finger = result.is3Finger;
        this.tapPenalty = result.penalty;
        this.hasBeenCheckedFor3Finger = true;
    }

    /**
     * Checks if a play is using 2 hands.
     *
     * Requires `analyze()` to be called first and `map` to be defined as `DroidDifficultyCalculator`.
     */
    checkFor2Hand(): void {
        if (
            !(
                this.beatmap instanceof DroidDifficultyCalculator ||
                this.beatmap instanceof RebalanceDroidDifficultyCalculator
            ) ||
            !this.data
        ) {
            return;
        }

        const twoHandChecker: TwoHandChecker = new TwoHandChecker(
            this.beatmap,
            this.data
        );
        const result: TwoHandInformation = twoHandChecker.check();

        this.is2Hand = result.is2Hand;
        this.twoHandedNoteCount = result.twoHandedNoteCount;
        this.hasBeenCheckedFor2Hand = true;
    }

    /**
     * Checks if a play has cheesed sliders.
     *
     * Requires `analyze()` to be called first and `map` to be defined as `DroidDifficultyCalculator`.
     */
    checkForSliderCheesing(): void {
        if (
            !(
                this.beatmap instanceof DroidDifficultyCalculator ||
                this.beatmap instanceof RebalanceDroidDifficultyCalculator
            ) ||
            !this.data
        ) {
            return;
        }

        const sliderCheeseChecker: SliderCheeseChecker =
            new SliderCheeseChecker(this.beatmap, this.data);

        this.sliderCheesePenalty = sliderCheeseChecker.check();
    }
}
