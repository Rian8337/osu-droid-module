import {
    Accuracy,
    Beatmap,
    BeatmapDifficulty,
    Circle,
    DroidAPIRequestBuilder,
    DroidHitWindow,
    DroidLegacyModConverter,
    DroidPlayableBeatmap,
    HitWindow,
    MathUtils,
    Mod,
    ModAuto,
    ModAutopilot,
    ModDoubleTime,
    ModEasy,
    ModFlashlight,
    ModHalfTime,
    ModHardRock,
    ModHidden,
    ModMap,
    ModNightCore,
    ModNoFail,
    ModOldNightCore,
    ModPerfect,
    ModPrecise,
    ModReallyEasy,
    ModRelax,
    ModReplayV6,
    ModScoreV2,
    ModSmallCircle,
    ModSuddenDeath,
    ModTraceable,
    ModUtil,
    Modes,
    PreciseDroidHitWindow,
    ScoreRank,
    SerializedMod,
    Slider,
    SliderTail,
    SliderTick,
    Spinner,
} from "@rian8337/osu-base";
import { IExtendedDroidDifficultyAttributes } from "@rian8337/osu-difficulty-calculator";
import { IExtendedDroidDifficultyAttributes as IRebalanceExtendedDroidDifficultyAttributes } from "@rian8337/osu-rebalance-difficulty-calculator";
import * as javaDeserialization from "java-deserialization";
import { Readable } from "stream";
import { Parse } from "unzipper";
import { RebalanceThreeFingerChecker } from "./analysis/RebalanceThreeFingerChecker";
import { SliderCheeseChecker } from "./analysis/SliderCheeseChecker";
import { ThreeFingerChecker } from "./analysis/ThreeFingerChecker";
import { TwoHandChecker } from "./analysis/TwoHandChecker";
import { SliderCheeseInformation } from "./analysis/structures/SliderCheeseInformation";
import { HitResult } from "./constants/HitResult";
import { MovementType } from "./constants/MovementType";
import { CursorData } from "./data/CursorData";
import { ReplayData } from "./data/ReplayData";
import { ReplayInformation } from "./data/ReplayInformation";
import { ReplayObjectData } from "./data/ReplayObjectData";
import { ReplayV3Data } from "./data/ReplayV3Data";
import { SliderHitInformation } from "./data/SliderHitInformation";
import { RebalanceSliderCheeseChecker } from "./analysis/RebalanceSliderCheeseChecker";

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
    scoreID?: number;

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
    beatmap?: Beatmap | DroidPlayableBeatmap;

    /**
     * The difficulty attributes of the beatmap.
     */
    difficultyAttributes?:
        | IExtendedDroidDifficultyAttributes
        | IRebalanceExtendedDroidDifficultyAttributes;

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

    private playableBeatmap?: DroidPlayableBeatmap;
    private bufferOffset = 0;

    constructor(values?: {
        /**
         * The ID of the score.
         */
        scoreID?: number;

        /**
         * The beatmap to analyze.
         */
        map?: Beatmap | DroidPlayableBeatmap;

        /**
         * The difficulty attributes.
         */
        difficultyAttributes?:
            | IExtendedDroidDifficultyAttributes
            | IRebalanceExtendedDroidDifficultyAttributes;
    }) {
        this.scoreID = values?.scoreID;
        this.beatmap = values?.map;
        this.difficultyAttributes = values?.difficultyAttributes;

        if (this.beatmap instanceof DroidPlayableBeatmap) {
            this.playableBeatmap = this.beatmap;
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

        this.fixedODR ??= await this.decompress().catch(() => null);

        if (!this.fixedODR) {
            return this;
        }

        this.parseReplay();

        return this;
    }

    /**
     * Gets hit error information of the replay.
     *
     * `analyze()` must be called before calling this, and `beatmap` must be defined.
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

        const { objects } = this.beatmap.hitObjects;

        const mods = this.data.isReplayV3()
            ? this.data.convertedMods
            : (this.difficultyAttributes?.mods ?? new ModMap());

        const adjustedDifficulty = new BeatmapDifficulty(
            this.beatmap.difficulty,
        );

        ModUtil.applyModsToBeatmapDifficulty(
            adjustedDifficulty,
            Modes.droid,
            mods,
        );

        const mehWindow = mods.has(ModPrecise)
            ? new PreciseDroidHitWindow(adjustedDifficulty.od).mehWindow
            : new DroidHitWindow(adjustedDifficulty.od).mehWindow;

        const accuracies: number[] = [];

        for (let i = 0; i < hitObjectData.length; ++i) {
            const v = hitObjectData[i];
            const o = objects[i];

            if (o instanceof Spinner || v.result === HitResult.miss) {
                continue;
            }

            const { accuracy } = v;

            if (
                o instanceof Slider &&
                // Do not include slider breaks.
                (-mehWindow > accuracy ||
                    accuracy > Math.min(mehWindow, o.duration))
            ) {
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
     * Obtains the amount of slider ticks and ends hit in the replay.
     *
     * This requires `analyze()` to be called first and `beatmap` to be defined.
     *
     * @returns Slider hit information or `null` if the replay has not been analyzed or the beatmap is not defined.
     */
    obtainSliderHitInformation(): SliderHitInformation | null {
        const { data, beatmap } = this;

        if (!data || !beatmap) {
            return null;
        }

        const sliderInformation: SliderHitInformation = {
            tick: { obtained: 0, total: beatmap.hitObjects.sliderTicks },
            end: { obtained: 0, total: beatmap.hitObjects.sliders },
        };

        for (let i = 0; i < data.hitObjectData.length; ++i) {
            const object = beatmap.hitObjects.objects[i];
            const objectData = data.hitObjectData[i];

            if (
                objectData.result === HitResult.miss ||
                !(object instanceof Slider)
            ) {
                continue;
            }

            // Exclude the head circle.
            for (let j = 1; j < object.nestedHitObjects.length; ++j) {
                const nested = object.nestedHitObjects[j];

                if (!objectData.tickset[j - 1]) {
                    continue;
                }

                if (nested instanceof SliderTick) {
                    ++sliderInformation.tick.obtained;
                } else if (nested instanceof SliderTail) {
                    ++sliderInformation.end.obtained;
                }
            }
        }

        return sliderInformation;
    }

    /**
     * Simulates a hit window for the replay.
     *
     * This does not account for required spins in a spinner.
     *
     * Requires `analyze()` to be called first and `beatmap` to be defined.
     *
     * @param hitWindow The hit window to simulate.
     * @returns The accuracy of the replay based on the hit window, or `null` if the replay has not been analyzed or the beatmap is not defined.
     */
    simulateHitWindow(hitWindow: HitWindow): Accuracy | null {
        const { data, beatmap } = this;

        if (!data || !beatmap) {
            return null;
        }

        const accuracy = new Accuracy({ n300: 0, n100: 0, n50: 0, nmiss: 0 });

        for (let i = 0; i < data.hitObjectData.length; ++i) {
            const object = beatmap.hitObjects.objects[i];
            const objectData = data.hitObjectData[i];
            const hitAccuracy = Math.abs(objectData.accuracy);

            let { result } = objectData;

            if (object instanceof Circle) {
                if (hitAccuracy <= hitWindow.greatWindow) {
                    result = HitResult.great;
                } else if (hitAccuracy <= hitWindow.okWindow) {
                    result = HitResult.good;
                } else if (hitAccuracy <= hitWindow.mehWindow) {
                    result = HitResult.meh;
                } else {
                    result = HitResult.miss;
                }
            } else if (object instanceof Slider) {
                if (
                    hitAccuracy <=
                    Math.min(hitWindow.mehWindow, object.duration)
                ) {
                    let ticksObtained = 1;

                    for (let j = 1; j < object.nestedHitObjects.length; ++j) {
                        if (objectData.tickset[j - 1]) {
                            ++ticksObtained;
                        }
                    }

                    if (ticksObtained === object.nestedHitObjects.length) {
                        result = HitResult.great;
                    } else if (
                        ticksObtained >=
                        Math.trunc(object.nestedHitObjects.length / 2)
                    ) {
                        result = HitResult.good;
                    } else if (ticksObtained > 0) {
                        result = HitResult.meh;
                    } else {
                        result = HitResult.miss;
                    }
                } else {
                    result = HitResult.miss;
                }
            }

            switch (result) {
                case HitResult.miss:
                    ++accuracy.nmiss;
                    break;

                case HitResult.meh:
                    ++accuracy.n50;
                    break;

                case HitResult.good:
                    ++accuracy.n100;
                    break;

                case HitResult.great:
                    ++accuracy.n300;
                    break;
            }
        }

        return accuracy;
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
     * Requires `analyze()` to be called first as well as `beatmap` and `difficultyAttributes` to be defined.
     */
    checkFor2Hand(): void {
        if (!this.beatmap || !this.difficultyAttributes || !this.data) {
            return;
        }

        this.playableBeatmap ??= this.constructPlayableBeatmap();

        const twoHandChecker = new TwoHandChecker(
            this.playableBeatmap,
            this.difficultyAttributes,
            this.data,
        );
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

        const sliderCheeseChecker =
            this.difficultyAttributes.mode === "rebalance"
                ? new RebalanceSliderCheeseChecker(
                      this.playableBeatmap,
                      this.data,
                      this.difficultyAttributes,
                  )
                : new SliderCheeseChecker(
                      this.playableBeatmap,
                      this.data,
                      this.difficultyAttributes,
                  );

        this.sliderCheesePenalty = sliderCheeseChecker.check();
        this.hasBeenCheckedForSliderCheesing = true;
    }

    /**
     * Downloads the given score ID's replay.
     */
    private async downloadReplay(): Promise<Buffer | null> {
        if (this.scoreID === undefined) {
            return null;
        }

        const apiRequestBuilder = new DroidAPIRequestBuilder()
            .setRequireAPIkey(false)
            .setEndpoint("upload")
            .addParameter("", `${this.scoreID.toString()}.odr`);

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
                .on(
                    "entry",
                    (entry: {
                        path: string;
                        buffer(): Promise<Buffer>;
                        autodrain(): void;
                    }) => {
                        const fileName = entry.path;

                        if (fileName === "data") {
                            resolve(entry.buffer());
                            return;
                        } else {
                            entry.autodrain();
                        }
                    },
                )
                .on("error", (e) => {
                    setTimeout(() => {
                        reject(e);
                    }, 2000);
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
        // the rest will be a buffer that we need to manually parse.
        let rawObject: unknown[];

        try {
            rawObject = javaDeserialization.parse(this.fixedODR) as unknown[];
        } catch {
            return;
        }

        const resultObject: ReplayInformation = {
            replayVersion: (rawObject[0] as { version: number }).version,
            folderName: rawObject[1] as string,
            fileName: rawObject[2] as string,
            hash: rawObject[3] as string,
            cursorMovement: [],
            hitObjectData: [],
            accuracy: new Accuracy({ n300: 0 }),
            rank: "D",
            convertedMods: new ModMap(),
            hit100k: 0,
            hit300k: 0,
            isFullCombo: false,
            maxCombo: 0,
            playerName: "",
            score: 0,
            time: new Date(0),
        };

        if (resultObject.replayVersion >= 3) {
            const buf = rawObject[4] as Buffer;

            resultObject.time.setTime(Number(buf.readBigUInt64BE(0)));
            resultObject.hit300k = buf.readInt32BE(8);
            resultObject.accuracy.n300 = buf.readInt32BE(12);
            resultObject.hit100k = buf.readInt32BE(16);
            resultObject.accuracy.n100 = buf.readInt32BE(20);
            resultObject.accuracy.n50 = buf.readInt32BE(24);
            resultObject.accuracy.nmiss = buf.readInt32BE(28);
            resultObject.score = buf.readInt32BE(32);
            resultObject.maxCombo = buf.readInt32BE(36);
            resultObject.isFullCombo = resultObject.accuracy.value() === 1;
            resultObject.playerName = rawObject[5] as string;

            if (resultObject.replayVersion >= 7) {
                resultObject.convertedMods = ModUtil.deserializeMods(
                    JSON.parse(rawObject[6] as string) as SerializedMod[],
                );
            } else {
                resultObject.convertedMods = this.convertDroidMods(
                    resultObject.replayVersion,
                    Object.values(
                        (rawObject[6] as { elements: Record<string, string> })
                            .elements,
                    ),
                );

                if (resultObject.replayVersion >= 4) {
                    DroidLegacyModConverter.parseExtraModString(
                        resultObject.convertedMods,
                        (rawObject[7] as string).split("|"),
                    );
                }
            }

            resultObject.rank = this.calculateRank(resultObject);
        }

        if (resultObject.replayVersion <= 6) {
            resultObject.convertedMods.set(ModReplayV6);
        }

        let bufferIndex: number;

        switch (resultObject.replayVersion) {
            case 1:
            case 2:
                bufferIndex = 4;
                break;

            case 3:
            case 7:
                bufferIndex = 7;
                break;

            case 4:
            case 5:
            case 6:
                bufferIndex = 8;
                break;

            default:
                throw new Error(
                    `Unsupported replay version: ${resultObject.replayVersion.toString()}`,
                );
        }

        const replayDataBufferArray: Buffer[] = [];

        while (bufferIndex < rawObject.length) {
            replayDataBufferArray.push(rawObject[bufferIndex++] as Buffer);
        }

        // Merge all cursor movement and hit object data section into one for better control when parsing
        const replayDataBuffer = Buffer.concat(replayDataBufferArray);
        this.bufferOffset = 0;

        this.parseMovementData(resultObject, replayDataBuffer);
        this.parseHitObjectData(resultObject, replayDataBuffer);
        this.parseOldReplayInformation(resultObject);

        switch (resultObject.replayVersion) {
            case 1:
            case 2:
                this.data = new ReplayData(resultObject);
                break;

            default:
                this.data = new ReplayV3Data(resultObject);
        }
    }

    /**
     * Converts replay mods to droid mod string.
     */
    private convertDroidMods(
        replayVersion: number,
        replayMods: string[],
    ): ModMap {
        const replayModsConstants = {
            MOD_AUTO: ModAuto,
            MOD_AUTOPILOT: ModAutopilot,
            MOD_NOFAIL: ModNoFail,
            MOD_EASY: ModEasy,
            MOD_HIDDEN: ModHidden,
            MOD_TRACEABLE: ModTraceable,
            MOD_HARDROCK: ModHardRock,
            MOD_DOUBLETIME: ModDoubleTime,
            MOD_HALFTIME: ModHalfTime,
            MOD_NIGHTCORE: ModNightCore,
            MOD_PRECISE: ModPrecise,
            MOD_SMALLCIRCLE: ModSmallCircle,
            MOD_REALLYEASY: ModReallyEasy,
            MOD_RELAX: ModRelax,
            MOD_PERFECT: ModPerfect,
            MOD_SUDDENDEATH: ModSuddenDeath,
            MOD_SCOREV2: ModScoreV2,
            MOD_FLASHLIGHT: ModFlashlight,
        } as const;

        const map = new ModMap();

        for (const mod of replayMods) {
            for (const property in Object(replayModsConstants)) {
                if (!mod.includes(property)) {
                    continue;
                }

                if (replayVersion <= 3 && mod === "MOD_NIGHTCORE") {
                    // In replay v3, the NightCore mod is bugged. See ModOldNightCore's description.
                    map.set(new ModOldNightCore());
                } else {
                    map.set<Mod>(
                        replayModsConstants[
                            property as keyof typeof replayModsConstants
                        ],
                    );
                }

                break;
            }
        }

        return map;
    }

    private parseMovementData(
        resultObject: ReplayInformation,
        replayDataBuffer: Buffer,
    ) {
        resultObject.cursorMovement.length = 0;

        const size = this.readInt(replayDataBuffer);

        for (let i = 0; i < size; i++) {
            const moveSize = this.readInt(replayDataBuffer);
            const time: number[] = [];
            const x: number[] = [];
            const y: number[] = [];
            const id: MovementType[] = [];

            for (let j = 0; j < moveSize; j++) {
                time[j] = this.readInt(replayDataBuffer);
                id[j] = time[j] & 3;
                time[j] >>= 2;

                if (id[j] !== MovementType.up) {
                    if (resultObject.replayVersion >= 5) {
                        x[j] = this.readFloat(replayDataBuffer);
                        y[j] = this.readFloat(replayDataBuffer);
                    } else {
                        x[j] = this.readShort(replayDataBuffer);
                        y[j] = this.readShort(replayDataBuffer);
                    }
                } else {
                    x[j] = -1;
                    y[j] = -1;
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
    }

    private parseHitObjectData(
        resultObject: ReplayInformation,
        replayDataBuffer: Buffer,
    ) {
        resultObject.hitObjectData.length = 0;

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
    }

    private parseOldReplayInformation(resultObject: ReplayInformation) {
        // Parse max combo, hit results, and accuracy in old replay version
        if (resultObject.replayVersion >= 3) {
            return;
        }

        const objects = this.beatmap?.hitObjects.objects;

        let grantsGekiOrKatu = true;

        resultObject.hit300k = 0;
        resultObject.hit100k = 0;

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
                        ++resultObject.hit100k;
                    }
                    break;
                case HitResult.great:
                    ++resultObject.accuracy.n300;
                    if (grantsGekiOrKatu && isNextNewCombo) {
                        ++resultObject.hit300k;
                    }
                    break;
            }

            if (isNextNewCombo) {
                grantsGekiOrKatu = true;
            }
        }

        resultObject.rank = this.calculateRank(resultObject);
    }

    private calculateRank(resultObject: ReplayInformation): ScoreRank {
        const totalHits =
            resultObject.accuracy.n300 +
            resultObject.accuracy.n100 +
            resultObject.accuracy.n50 +
            resultObject.accuracy.nmiss;

        const isHidden =
            resultObject.convertedMods.has(ModHidden) ||
            resultObject.convertedMods.has(ModFlashlight);

        const hit300Ratio = resultObject.accuracy.n300 / totalHits;

        switch (true) {
            case resultObject.accuracy.value() === 1:
                return isHidden ? "XH" : "X";

            case hit300Ratio > 0.9 &&
                resultObject.accuracy.n50 / totalHits < 0.01 &&
                !resultObject.accuracy.nmiss:
                return isHidden ? "SH" : "S";

            case (hit300Ratio > 0.8 && !resultObject.accuracy.nmiss) ||
                hit300Ratio > 0.9:
                return "A";

            case (hit300Ratio > 0.7 && !resultObject.accuracy.nmiss) ||
                hit300Ratio > 0.8:
                return "B";

            case hit300Ratio > 0.6:
                return "C";

            default:
                return "D";
        }
    }

    private constructPlayableBeatmap(): DroidPlayableBeatmap {
        if (this.beatmap instanceof DroidPlayableBeatmap) {
            return this.beatmap;
        }

        if (!this.beatmap || !this.data) {
            throw new Error("Beatmap and replay data must be defined.");
        }

        const mods = this.data.isReplayV3()
            ? this.data.convertedMods
            : this.difficultyAttributes?.mods;

        return this.beatmap.createDroidPlayableBeatmap(mods);
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
