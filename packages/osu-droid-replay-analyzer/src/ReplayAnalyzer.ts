import {
    Accuracy,
    Beatmap,
    DroidAPIRequestBuilder,
    DroidHitWindow,
    MathUtils,
    ModAuto,
    ModAutopilot,
    ModDifficultyAdjust,
    ModDoubleTime,
    ModEasy,
    ModFlashlight,
    ModHalfTime,
    ModHardRock,
    ModHidden,
    ModNightCore,
    ModNoFail,
    ModPerfect,
    ModPrecise,
    ModReallyEasy,
    ModRelax,
    ModScoreV2,
    ModSmallCircle,
    ModSpeedUp,
    ModSuddenDeath,
    ModUtil,
    Modes,
    Slider,
    Spinner,
    calculateDroidDifficultyStatistics,
} from "@rian8337/osu-base";
import {
    DroidDifficultyCalculator,
    ExtendedDroidDifficultyAttributes,
} from "@rian8337/osu-difficulty-calculator";
import {
    DroidDifficultyCalculator as RebalanceDroidDifficultyCalculator,
    ExtendedDroidDifficultyAttributes as RebalanceExtendedDroidDifficultyAttributes,
} from "@rian8337/osu-rebalance-difficulty-calculator";
import { Parse } from "unzipper";
import * as javaDeserialization from "java-deserialization";
import { Readable } from "stream";
import { ReplayData, ReplayInformation } from "./data/ReplayData";
import { CursorData } from "./data/CursorData";
import { ReplayObjectData } from "./data/ReplayObjectData";
import { ThreeFingerChecker } from "./analysis/ThreeFingerChecker";
import { TwoHandChecker } from "./analysis/TwoHandChecker";
import { MovementType } from "./constants/MovementType";
import { HitResult } from "./constants/HitResult";
import { SliderCheeseChecker } from "./analysis/SliderCheeseChecker";
import { SliderCheeseInformation } from "./analysis/structures/SliderCheeseInformation";
import { RebalanceThreeFingerChecker } from "./analysis/RebalanceThreeFingerChecker";

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
     * The difficulty attributes of the beatmap.
     */
    difficultyAttributes?:
        | ExtendedDroidDifficultyAttributes
        | RebalanceExtendedDroidDifficultyAttributes;

    /**
     * The results of the analyzer. `null` when initialized.
     */
    data: ReplayData | null = null;

    /**
     * Penalty value used to penalize dpp for 2-hand.
     */
    aimPenalty = 1;

    /**
     * Penalty value used to penalize dpp for 3 finger abuse.
     */
    tapPenalty = 1;

    /**
     * Penalty values used to penalize dpp for slider cheesing.
     */
    sliderCheesePenalty: SliderCheeseInformation = {
        aimPenalty: 1,
        flashlightPenalty: 1,
        visualPenalty: 1,
    };

    /**
     * Whether this replay has been checked against 3 finger usage.
     */
    hasBeenCheckedFor3Finger = false;

    /**
     * Whether this replay has been checked against 2 hand usage.
     */
    hasBeenCheckedFor2Hand = false;

    /**
     * Whether this replay has been checked against slider cheesing.
     */
    hasBeenCheckedForSliderCheesing = false;

    /**
     * The amount of two-handed objects.
     */
    twoHandedNoteCount = 0;

    private playableBeatmap?: Beatmap;
    private bufferOffset = 0;

    constructor(values: {
        /**
         * The ID of the score.
         */
        scoreID: number;

        /**
         * The beatmap to analyze.
         *
         * `DroidDifficultyCalculator` or `RebalanceDroidDifficultyCalculator` is required for two hand analyzing.
         */
        map?:
            | Beatmap
            | DroidDifficultyCalculator
            | RebalanceDroidDifficultyCalculator;

        /**
         * The difficulty attributes.
         *
         * If `map` is defined as `DroidDifficultyCalculator` or `RebalanceDroidDifficultyCalculator`, the difficulty attributes will be obtained from it instead.
         */
        difficultyAttributes?:
            | ExtendedDroidDifficultyAttributes
            | RebalanceExtendedDroidDifficultyAttributes;
    }) {
        this.scoreID = values.scoreID;
        this.beatmap = values.map;
        this.difficultyAttributes = values.difficultyAttributes;

        if (this.beatmap && !(this.beatmap instanceof Beatmap)) {
            this.difficultyAttributes = this.beatmap.attributes;
        }
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
        const apiRequestBuilder = new DroidAPIRequestBuilder()
            .setRequireAPIkey(false)
            .setEndpoint("upload")
            .addParameter("", `${this.scoreID}.odr`);

        const result = await apiRequestBuilder.sendRequest();

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
            const stream = new Readable();
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
        if (!this.fixedODR) {
            return;
        }

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
            accuracy: new Accuracy({ n300: 0 }),
            rank: "",
        };

        const determineRank = () => {
            const totalHits =
                resultObject.accuracy.n300 +
                resultObject.accuracy.n100 +
                resultObject.accuracy.n50 +
                resultObject.accuracy.nmiss;
            const isHidden =
                resultObject.convertedMods?.some(
                    (m) => m instanceof ModHidden || m instanceof ModFlashlight,
                ) ?? false;

            const hit300Ratio = resultObject.accuracy.n300 / totalHits;

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
        };

        if (resultObject.replayVersion >= 3) {
            resultObject.time = new Date(
                Number(rawObject[4].readBigUInt64BE(0)),
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
                this.convertDroidMods(rawObject[6].elements),
            );

            determineRank();
        }

        if (resultObject.replayVersion >= 4) {
            const str: string[] = rawObject[7].split("|");

            for (const s of str) {
                switch (true) {
                    // Forced stats
                    case s.startsWith("CS"):
                        resultObject.forceCS = parseFloat(s.replace("CS", ""));
                        break;
                    case s.startsWith("AR"):
                        resultObject.forceAR = parseFloat(s.replace("AR", ""));
                        break;
                    case s.startsWith("OD"):
                        resultObject.forceOD = parseFloat(s.replace("OD", ""));
                        break;
                    case s.startsWith("HP"):
                        resultObject.forceHP = parseFloat(s.replace("HP", ""));
                        break;
                    // FL follow delay
                    case s.startsWith("FLD"):
                        resultObject.flashlightFollowDelay =
                            parseFloat(s.replace("FLD", "")) || 0.12;
                        break;
                    // Speed multiplier
                    case s.startsWith("x"):
                        resultObject.speedMultiplier =
                            parseFloat(s.replace("x", "")) || 1;
                        break;
                }
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
        const replayDataBuffer = Buffer.concat(replayDataBufferArray);
        this.bufferOffset = 0;

        const size = this.readInt(replayDataBuffer);

        // Parse movement data
        for (let x = 0; x < size; x++) {
            const moveSize = this.readInt(replayDataBuffer);
            const time: number[] = [];
            const x: number[] = [];
            const y: number[] = [];
            const id: MovementType[] = [];
            for (let i = 0; i < moveSize; i++) {
                time[i] = this.readInt(replayDataBuffer);
                id[i] = time[i] & 3;
                time[i] >>= 2;
                if (id[i] !== MovementType.up) {
                    if (resultObject.replayVersion >= 5) {
                        x[i] = this.readFloat(replayDataBuffer);
                        y[i] = this.readFloat(replayDataBuffer);
                    } else {
                        x[i] = this.readShort(replayDataBuffer);
                        y[i] = this.readShort(replayDataBuffer);
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
                }),
            );
        }

        const replayObjectLength = this.readInt(replayDataBuffer);

        // Parse result data
        for (let i = 0; i < replayObjectLength; i++) {
            const replayObjectData: ReplayObjectData = {
                accuracy: 0,
                tickset: [],
                result: HitResult.miss,
            };

            replayObjectData.accuracy = this.readShort(replayDataBuffer);
            const len = this.readByte(replayDataBuffer);

            if (len > 0) {
                const bytes: number[] = [];

                for (let j = 0; j < len; j++) {
                    bytes.push(this.readByte(replayDataBuffer));
                }
                // Int/int division in Java; numbers must be truncated to get actual number
                for (let j = 0; j < len * 8; j++) {
                    replayObjectData.tickset.push(
                        (bytes[len - Math.trunc(j / 8) - 1] &
                            (1 << Math.trunc(j % 8))) !==
                            0,
                    );
                }
            }

            if (resultObject.replayVersion >= 1) {
                replayObjectData.result = this.readByte(replayDataBuffer);
            }

            resultObject.hitObjectData.push(replayObjectData);
        }

        // Parse max combo, hit results, and accuracy in old replay version
        if (resultObject.replayVersion < 3) {
            const objects = (
                this.beatmap instanceof DroidDifficultyCalculator ||
                this.beatmap instanceof RebalanceDroidDifficultyCalculator
                    ? this.beatmap.beatmap
                    : this.beatmap
            )?.hitObjects.objects;

            let grantsGekiOrKatu = true;

            for (let i = 0; i < resultObject.hitObjectData.length; ++i) {
                // Hit result
                const hitObjectData = resultObject.hitObjectData[i];
                const isNextNewCombo = objects
                    ? i + 1 !== objects.length
                        ? objects[i + 1].isNewCombo
                        : true
                    : false;

                switch (hitObjectData.result) {
                    case HitResult.miss:
                        ++resultObject.accuracy.nmiss;
                        grantsGekiOrKatu = false;
                        break;
                    case HitResult.meh:
                        ++resultObject.accuracy.n50;
                        grantsGekiOrKatu = false;
                        break;
                    case HitResult.good:
                        ++resultObject.accuracy.n100;
                        if (grantsGekiOrKatu && isNextNewCombo) {
                            resultObject.hit100k ??= 0;
                            ++resultObject.hit100k;
                        }
                        break;
                    case HitResult.great:
                        ++resultObject.accuracy.n300;
                        if (grantsGekiOrKatu && isNextNewCombo) {
                            resultObject.hit300k ??= 0;
                            ++resultObject.hit300k;
                        }
                        break;
                }

                if (isNextNewCombo) {
                    grantsGekiOrKatu = true;
                }
            }

            determineRank();
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

        const hitObjectData = this.data.hitObjectData;
        let positiveCount = 0;
        let negativeCount = 0;
        let positiveTotal = 0;
        let negativeTotal = 0;

        const beatmap =
            this.beatmap instanceof DroidDifficultyCalculator ||
            this.beatmap instanceof RebalanceDroidDifficultyCalculator
                ? this.beatmap.beatmap
                : this.beatmap;
        const { objects } = beatmap.hitObjects;

        const od = calculateDroidDifficultyStatistics({
            overallDifficulty: beatmap.difficulty.od,
            mods: ModUtil.removeSpeedChangingMods(this.data.convertedMods),
        }).overallDifficulty;

        const hitWindow50 = new DroidHitWindow(od).hitWindowFor50(
            this.data.convertedMods.some((m) => m instanceof ModPrecise),
        );

        // The accuracy of sliders is set to (50 hit window)ms + 13ms if their head was not hit:
        // https://github.com/osudroid/osu-droid/blob/6306c68e3ffaf671eac794bf45cc95c0f3313a82/src/ru/nsu/ccfit/zuev/osu/game/Slider.java#L821
        //
        // In such cases, the slider is skipped.
        const sliderbreakHitOffset = Math.floor(hitWindow50) + 13;
        const accuracies: number[] = [];

        for (let i = 0; i < hitObjectData.length; ++i) {
            const v = hitObjectData[i];
            const o = objects[i];

            if (o instanceof Spinner || v.result === HitResult.miss) {
                accuracies.push(0);
                continue;
            }

            const { accuracy } = v;

            if (o instanceof Slider && accuracy === sliderbreakHitOffset) {
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
            MOD_AUTO: new ModAuto().droidString,
            MOD_AUTOPILOT: new ModAutopilot().droidString,
            MOD_NOFAIL: new ModNoFail().droidString,
            MOD_EASY: new ModEasy().droidString,
            MOD_HIDDEN: new ModHidden().droidString,
            MOD_HARDROCK: new ModHardRock().droidString,
            MOD_DOUBLETIME: new ModDoubleTime().droidString,
            MOD_HALFTIME: new ModHalfTime().droidString,
            MOD_NIGHTCORE: new ModNightCore().droidString,
            MOD_PRECISE: new ModPrecise().droidString,
            MOD_SMALLCIRCLE: new ModSmallCircle().droidString,
            MOD_SPEEDUP: new ModSpeedUp().droidString,
            MOD_REALLYEASY: new ModReallyEasy().droidString,
            MOD_RELAX: new ModRelax().droidString,
            MOD_PERFECT: new ModPerfect().droidString,
            MOD_SUDDENDEATH: new ModSuddenDeath().droidString,
            MOD_SCOREV2: new ModScoreV2().droidString,
            MOD_FLASHLIGHT: new ModFlashlight().droidString,
        };

        let modString = "";
        for (const mod of replayMods) {
            for (const property in replayModsConstants) {
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
     * Requires `analyze()` to be called first and `map` and `difficultyAttributes` to be defined.
     */
    checkFor3Finger(): void {
        if (!this.beatmap || !this.data || !this.difficultyAttributes) {
            return;
        }

        this.playableBeatmap ??= this.constructPlayableBeatmap();

        const threeFingerChecker =
            this.difficultyAttributes.mode === "rebalance"
                ? new RebalanceThreeFingerChecker(
                      this.playableBeatmap,
                      this.data,
                      this.difficultyAttributes,
                  )
                : new ThreeFingerChecker(
                      this.playableBeatmap,
                      this.data,
                      this.difficultyAttributes,
                  );

        const result = threeFingerChecker.check();

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

        const twoHandChecker = new TwoHandChecker(this.beatmap, this.data);
        const result = twoHandChecker.check();

        this.is2Hand = result.is2Hand;
        this.twoHandedNoteCount = result.twoHandedNoteCount;
        this.hasBeenCheckedFor2Hand = true;
    }

    /**
     * Checks if a play has cheesed sliders.
     *
     * Requires `analyze()` to be called first and `map` and `difficultyAttributes` to be defined.
     */
    checkForSliderCheesing(): void {
        if (!this.beatmap || !this.data || !this.difficultyAttributes) {
            return;
        }

        this.playableBeatmap ??= this.constructPlayableBeatmap();

        const sliderCheeseChecker = new SliderCheeseChecker(
            this.playableBeatmap,
            this.data,
            this.difficultyAttributes,
        );

        this.sliderCheesePenalty = sliderCheeseChecker.check();
        this.hasBeenCheckedForSliderCheesing = true;
    }

    private constructPlayableBeatmap(): Beatmap {
        if (!this.beatmap || !this.data) {
            throw new Error("Beatmap and replay data must be defined.");
        }

        const mods = this.data.convertedMods.slice();

        if (
            [
                this.data.forceCS,
                this.data.forceAR,
                this.data.forceOD,
                this.data.forceHP,
            ].some((v) => v !== undefined)
        ) {
            mods.push(
                new ModDifficultyAdjust({
                    cs: this.data.forceCS,
                    ar: this.data.forceAR,
                    od: this.data.forceOD,
                    hp: this.data.forceHP,
                }),
            );
        }

        return (
            this.beatmap instanceof Beatmap
                ? this.beatmap
                : this.beatmap.beatmap
        ).createPlayableBeatmap({
            mode: Modes.droid,
            mods: mods,
            customSpeedMultiplier: this.data.speedMultiplier,
        });
    }

    private readByte(buffer: Buffer): number {
        const num = buffer.readInt8(this.bufferOffset);
        this.bufferOffset += 1;

        return num;
    }

    private readShort(buffer: Buffer): number {
        const num = buffer.readInt16BE(this.bufferOffset);
        this.bufferOffset += 2;

        return num;
    }

    private readInt(buffer: Buffer): number {
        const num = buffer.readInt32BE(this.bufferOffset);
        this.bufferOffset += 4;

        return num;
    }

    private readFloat(buffer: Buffer): number {
        const num = buffer.readFloatBE(this.bufferOffset);
        this.bufferOffset += 4;

        return num;
    }
}
