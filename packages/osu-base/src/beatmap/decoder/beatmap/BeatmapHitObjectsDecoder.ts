import { HitSoundType } from "../../../constants/HitSoundType";
import { objectTypes } from "../../../constants/objectTypes";
import { ParserConstants } from "../../../constants/ParserConstants";
import { PathType } from "../../../constants/PathType";
import { SampleBank } from "../../../constants/SampleBank";
import { MathUtils } from "../../../mathutil/MathUtils";
import { Vector2 } from "../../../mathutil/Vector2";
import { Precision } from "../../../utils/Precision";
import { SliderPath } from "../../../utils/SliderPath";
import { Beatmap } from "../../Beatmap";
import { Circle } from "../../hitobjects/Circle";
import { HitObject } from "../../hitobjects/HitObject";
import { HitSampleInfo } from "../../hitobjects/HitSampleInfo";
import { SampleBankInfo } from "../../hitobjects/SampleBankInfo";
import { Slider } from "../../hitobjects/Slider";
import { Spinner } from "../../hitobjects/Spinner";
import { DifficultyControlPoint } from "../../timings/DifficultyControlPoint";
import { TimingControlPoint } from "../../timings/TimingControlPoint";
import { SectionDecoder } from "../SectionDecoder";

/**
 * A decoder for decoding a beatmap's hitobjects section.
 */
export class BeatmapHitObjectsDecoder extends SectionDecoder<Beatmap> {
    private extraComboOffset: number = 0;
    private forceNewCombo: boolean = false;

    protected override decodeInternal(line: string): void {
        // Need to check if the beatmap doesn't have an uninherited timing point.
        // This exists in cases such as /b/2290233 where the beatmap has been
        // edited by the user.
        //
        // In lazer, the default BPM is set to 60 (60000 / 1000).
        if (this.target.controlPoints.timing.points.length === 0) {
            this.target.controlPoints.timing.points.push(
                new TimingControlPoint({
                    time: Number.NEGATIVE_INFINITY,
                    msPerBeat: 1000,
                    timeSignature: 4,
                })
            );
        }

        const s: string[] = line.split(",");

        if (s.length < 4) {
            throw new Error("Ignoring malformed hitobject");
        }

        const time: number = this.target.getOffsetTime(
            this.tryParseFloat(this.setPosition(s[2]))
        );

        const type: number = this.tryParseInt(this.setPosition(s[3]));

        let tempType: number = type;

        let comboOffset: number = (tempType & objectTypes.comboOffset) >> 4;
        tempType &= ~objectTypes.comboOffset;

        let newCombo: boolean = !!(type & objectTypes.newCombo);
        tempType &= ~objectTypes.newCombo;

        const position: Vector2 = new Vector2(
            this.tryParseFloat(
                this.setPosition(s[0]),
                -ParserConstants.MAX_COORDINATE_VALUE,
                ParserConstants.MAX_COORDINATE_VALUE
            ),
            this.tryParseFloat(
                this.setPosition(s[1]),
                -ParserConstants.MAX_COORDINATE_VALUE,
                ParserConstants.MAX_COORDINATE_VALUE
            )
        );

        const soundType: HitSoundType = <HitSoundType>this.tryParseInt(s[4]);

        const bankInfo: SampleBankInfo = new SampleBankInfo();

        let object: HitObject | null = null;

        if (type & objectTypes.circle) {
            newCombo ||= this.forceNewCombo;
            comboOffset += this.extraComboOffset;

            this.forceNewCombo = false;
            this.extraComboOffset = 0;

            object = new Circle({
                startTime: time,
                type: type,
                position: position,
                newCombo: newCombo,
                comboOffset: comboOffset,
            });

            if (s.length > 5) {
                this.readCustomSampleBanks(bankInfo, s[5]);
            }
        } else if (type & objectTypes.slider) {
            if (s.length < 8) {
                throw new Error("Ignoring malformed slider");
            }

            const repetitions: number = Math.max(
                0,
                this.tryParseInt(
                    this.setPosition(s[6]),
                    -ParserConstants.MAX_PARSE_VALUE,
                    ParserConstants.MAX_REPETITIONS_VALUE
                )
            );

            const distance: number = Math.max(
                0,
                this.tryParseFloat(this.setPosition(s[7]))
            );

            const speedMultiplierTimingPoint: DifficultyControlPoint =
                this.target.controlPoints.difficulty.controlPointAt(time)!;
            const msPerBeatTimingPoint: TimingControlPoint =
                this.target.controlPoints.timing.controlPointAt(time)!;

            const points: Vector2[] = [new Vector2(0, 0)];
            const pointSplit: string[] = this.setPosition(s[5]).split("|");
            let pathType: PathType = <PathType>pointSplit.shift()!;

            for (const point of pointSplit) {
                const temp: string[] = point.split(":");
                const vec: Vector2 = new Vector2(
                    this.tryParseFloat(
                        temp[0],
                        -ParserConstants.MAX_COORDINATE_VALUE,
                        ParserConstants.MAX_COORDINATE_VALUE
                    ),
                    this.tryParseFloat(
                        temp[1],
                        -ParserConstants.MAX_COORDINATE_VALUE,
                        ParserConstants.MAX_COORDINATE_VALUE
                    )
                );

                points.push(vec.subtract(position));
            }

            // A special case for old beatmaps where the first
            // control point is in the position of the slider.
            if (points[0].equals(points[1])) {
                points.shift();
            }

            // Edge-case rules (to match stable).
            if (pathType === PathType.PerfectCurve) {
                if (points.length !== 3) {
                    pathType = PathType.Bezier;
                } else if (
                    Precision.almostEqualsNumber(
                        0,
                        (points[1].y - points[0].y) *
                            (points[2].x - points[0].x) -
                            (points[1].x - points[0].x) *
                                (points[2].y - points[0].y)
                    )
                ) {
                    // osu-stable special-cased colinear perfect curves to a linear path
                    pathType = PathType.Linear;
                }
            }

            const path: SliderPath = new SliderPath({
                pathType: pathType,
                controlPoints: points,
                expectedDistance: distance,
            });

            if (s.length > 10) {
                this.readCustomSampleBanks(bankInfo, s[10]);
            }

            // One node for each repeat + the start and end nodes
            const nodes: number = repetitions + 1;

            // Populate node sample bank infos with the default hit object sample bank
            const nodeBankInfos: SampleBankInfo[] = [];
            for (let i = 0; i < nodes; ++i) {
                nodeBankInfos.push(new SampleBankInfo(bankInfo));
            }

            // Read any per-node sample banks
            if (s.length > 9 && s[9]) {
                const sets: string[] = s[9].split("|");

                for (let i = 0; i < Math.min(sets.length, nodes); ++i) {
                    this.readCustomSampleBanks(nodeBankInfos[i], sets[i]);
                }
            }

            // Populate node sound types with the default hit object sound type
            const nodeSoundTypes: HitSoundType[] = [];
            for (let i = 0; i < nodes; ++i) {
                nodeSoundTypes.push(soundType);
            }

            // Read any per-node sound types
            if (s.length > 8 && s[8]) {
                const adds: string[] = s[8].split("|");

                for (let i = 0; i < Math.min(adds.length, nodes); ++i) {
                    nodeSoundTypes[i] = <HitSoundType>parseInt(adds[i]);
                }
            }

            // Generate the final per-node samples
            const nodeSamples: HitSampleInfo[][] = [];
            for (let i = 0; i < nodes; ++i) {
                nodeSamples.push(
                    this.convertSoundType(nodeSoundTypes[i], nodeBankInfos[i])
                );
            }

            newCombo ||= this.forceNewCombo;
            comboOffset += this.extraComboOffset;

            this.forceNewCombo = false;
            this.extraComboOffset = 0;

            object = new Slider({
                position: position,
                startTime: time,
                type: type,
                newCombo: newCombo,
                comboOffset: comboOffset,
                nodeSamples: nodeSamples,
                repetitions: repetitions,
                path: path,
                speedMultiplier: MathUtils.clamp(
                    speedMultiplierTimingPoint.speedMultiplier,
                    ParserConstants.MIN_SPEEDMULTIPLIER_VALUE,
                    ParserConstants.MAX_SPEEDMULTIPLIER_VALUE
                ),
                msPerBeat: msPerBeatTimingPoint.msPerBeat,
                mapSliderVelocity: this.target.difficulty.sliderMultiplier,
                mapTickRate: this.target.difficulty.sliderTickRate,
                // Prior to v8, speed multipliers don't adjust for how many ticks are generated over the same distance.
                // This results in more (or less) ticks being generated in <v8 maps for the same time duration.
                //
                // This additional check is used in case BPM goes very low or very high.
                // When lazer is final, this should be revisited.
                tickDistanceMultiplier: this.isNumberValid(
                    msPerBeatTimingPoint.msPerBeat,
                    ParserConstants.MIN_MSPERBEAT_VALUE,
                    ParserConstants.MAX_MSPERBEAT_VALUE
                )
                    ? this.target.formatVersion < 8
                        ? 1 / speedMultiplierTimingPoint.speedMultiplier
                        : 1
                    : 0,
            });
        } else if (type & objectTypes.spinner) {
            // Spinners don't create the new combo themselves, but force the next non-spinner hitobject to create a new combo.
            // Their combo offset is still added to that next hitobject's combo index.
            this.forceNewCombo ||= this.target.formatVersion <= 8 || newCombo;
            this.extraComboOffset += comboOffset;

            object = new Spinner({
                startTime: time,
                type: type,
                endTime: this.tryParseInt(this.setPosition(s[5])),
            });

            if (s.length > 6) {
                this.readCustomSampleBanks(bankInfo, s[6]);
            }
        }

        if (!object) {
            throw new Error("Ignoring malformed hitobject");
        }

        switch (true) {
            case object instanceof Circle:
                ++this.target.hitObjects.circles;
                break;
            case object instanceof Slider:
                ++this.target.hitObjects.sliders;
                break;
            case object instanceof Spinner:
                ++this.target.hitObjects.spinners;
                break;
        }

        object.samples = this.convertSoundType(soundType, bankInfo);

        this.target.hitObjects.objects.push(object);
    }

    /**
     * Applies stacking to hitobjects for this.map version 6 or above.
     */
    applyStacking(startIndex: number, endIndex: number): void {
        if (this.target.formatVersion < 6) {
            return;
        }

        const stackDistance: number = 3;

        let timePreempt: number = 600;
        const ar: number = this.target.difficulty.ar!;
        if (ar > 5) {
            timePreempt = 1200 + ((450 - 1200) * (ar - 5)) / 5;
        } else if (ar < 5) {
            timePreempt = 1200 - ((1200 - 1800) * (5 - ar)) / 5;
        } else {
            timePreempt = 1200;
        }

        let extendedEndIndex: number = endIndex;
        const stackThreshold: number =
            timePreempt * this.target.general.stackLeniency;

        if (endIndex < this.target.hitObjects.objects.length - 1) {
            for (let i = endIndex; i >= startIndex; --i) {
                let stackBaseIndex: number = i;
                for (
                    let n: number = stackBaseIndex + 1;
                    n < this.target.hitObjects.objects.length;
                    ++n
                ) {
                    const stackBaseObject: HitObject =
                        this.target.hitObjects.objects[stackBaseIndex];
                    if (stackBaseObject instanceof Spinner) {
                        break;
                    }

                    const objectN: HitObject =
                        this.target.hitObjects.objects[n];
                    if (objectN instanceof Spinner) {
                        break;
                    }

                    const endTime: number = stackBaseObject.endTime;

                    if (objectN.startTime - endTime > stackThreshold) {
                        break;
                    }

                    const endPositionDistanceCheck: boolean =
                        stackBaseObject instanceof Slider
                            ? stackBaseObject.endPosition.getDistance(
                                  objectN.position
                              ) < stackDistance
                            : false;

                    if (
                        stackBaseObject.position.getDistance(objectN.position) <
                            stackDistance ||
                        endPositionDistanceCheck
                    ) {
                        stackBaseIndex = n;
                        objectN.stackHeight = 0;
                    }
                }

                if (stackBaseIndex > extendedEndIndex) {
                    extendedEndIndex = stackBaseIndex;
                    if (
                        extendedEndIndex ===
                        this.target.hitObjects.objects.length - 1
                    ) {
                        break;
                    }
                }
            }
        }

        let extendedStartIndex: number = startIndex;
        for (let i = extendedEndIndex; i > startIndex; --i) {
            let n: number = i;

            let objectI: HitObject = this.target.hitObjects.objects[i];
            if (
                objectI.stackHeight !== 0 ||
                objectI.type & objectTypes.spinner
            ) {
                continue;
            }

            if (objectI.type & objectTypes.circle) {
                while (--n >= 0) {
                    const objectN: HitObject =
                        this.target.hitObjects.objects[n];
                    if (objectN instanceof Spinner) {
                        continue;
                    }

                    const endTime: number = objectN.endTime;

                    if (objectI.startTime - endTime > stackThreshold) {
                        break;
                    }

                    if (n < extendedStartIndex) {
                        objectN.stackHeight = 0;
                        extendedStartIndex = n;
                    }

                    const endPositionDistanceCheck: boolean =
                        objectN instanceof Slider
                            ? objectN.endPosition.getDistance(
                                  objectI.position
                              ) < stackDistance
                            : false;

                    if (endPositionDistanceCheck) {
                        const offset: number =
                            objectI.stackHeight - objectN.stackHeight + 1;
                        for (let j = n + 1; j <= i; ++j) {
                            const objectJ: HitObject =
                                this.target.hitObjects.objects[j];
                            if (
                                (<Slider>objectN).endPosition.getDistance(
                                    objectJ.position
                                ) < stackDistance
                            ) {
                                objectJ.stackHeight -= offset;
                            }
                        }
                        break;
                    }

                    if (
                        objectN.position.getDistance(objectI.position) <
                        stackDistance
                    ) {
                        objectN.stackHeight = objectI.stackHeight + 1;
                        objectI = objectN;
                    }
                }
            } else if (objectI instanceof Slider) {
                while (--n >= startIndex) {
                    const objectN: HitObject =
                        this.target.hitObjects.objects[n];
                    if (objectN instanceof Spinner) {
                        continue;
                    }

                    if (
                        objectI.startTime - objectN.startTime >
                        stackThreshold
                    ) {
                        break;
                    }

                    const objectNEndPosition: Vector2 =
                        objectN instanceof Circle
                            ? objectN.position
                            : (<Slider>objectN).endPosition;
                    if (
                        objectNEndPosition.getDistance(objectI.position) <
                        stackDistance
                    ) {
                        objectN.stackHeight = objectI.stackHeight + 1;
                        objectI = objectN;
                    }
                }
            }
        }
    }

    /**
     * Applies stacking to hitobjects for this.map version 5 or below.
     */
    applyStackingOld(): void {
        if (this.target.formatVersion > 5) {
            return;
        }

        const stackDistance: number = 3;
        let timePreempt: number = 600;
        const ar: number = this.target.difficulty.ar!;

        if (ar > 5) {
            timePreempt = 1200 + ((450 - 1200) * (ar - 5)) / 5;
        } else if (ar < 5) {
            timePreempt = 1200 - ((1200 - 1800) * (5 - ar)) / 5;
        } else {
            timePreempt = 1200;
        }

        for (let i = 0; i < this.target.hitObjects.objects.length; ++i) {
            const currentObject: HitObject = this.target.hitObjects.objects[i];

            if (
                currentObject.stackHeight !== 0 &&
                !(currentObject instanceof Slider)
            ) {
                continue;
            }

            let startTime: number = currentObject.endTime;
            let sliderStack: number = 0;

            for (
                let j = i + 1;
                j < this.target.hitObjects.objects.length;
                ++j
            ) {
                const stackThreshold: number =
                    timePreempt * this.target.general.stackLeniency;

                if (
                    this.target.hitObjects.objects[j].startTime -
                        stackThreshold >
                    startTime
                ) {
                    break;
                }

                // The start position of the hitobject, or the position at the end of the path if the hitobject is a slider
                const position2: Vector2 =
                    currentObject instanceof Slider
                        ? currentObject.endPosition
                        : currentObject.position;

                if (
                    this.target.hitObjects.objects[j].position.getDistance(
                        currentObject.position
                    ) < stackDistance
                ) {
                    ++currentObject.stackHeight;
                    startTime = this.target.hitObjects.objects[j].endTime;
                } else if (
                    this.target.hitObjects.objects[j].position.getDistance(
                        position2
                    ) < stackDistance
                ) {
                    // Case for sliders - bump notes down and right, rather than up and left.
                    ++sliderStack;
                    this.target.hitObjects.objects[j].stackHeight -=
                        sliderStack;
                    startTime = this.target.hitObjects.objects[j].endTime;
                }
            }
        }
    }

    /**
     * Converts a sound type to hit samples.
     *
     * @param type The sound type.
     * @param bankInfo The bank
     */
    private convertSoundType(
        type: HitSoundType,
        bankInfo: SampleBankInfo
    ): HitSampleInfo[] {
        if (bankInfo.filename) {
            return [
                new HitSampleInfo(
                    bankInfo.filename,
                    undefined,
                    bankInfo.customSampleBank,
                    bankInfo.volume
                ),
            ];
        }

        const soundTypes: HitSampleInfo[] = [
            new HitSampleInfo(
                HitSampleInfo.HIT_NORMAL,
                bankInfo.normal,
                bankInfo.customSampleBank,
                bankInfo.volume,
                // If the sound type doesn't have the Normal flag set, attach it anyway as a layered sample.
                // None also counts as a normal non-layered sample: https://osu.ppy.sh/help/wiki/osu!_File_Formats/Osu_(file_format)#hitsounds
                type !== HitSoundType.none && !(type & HitSoundType.normal)
            ),
        ];

        if (type & HitSoundType.finish) {
            soundTypes.push(
                new HitSampleInfo(
                    HitSampleInfo.HIT_FINISH,
                    bankInfo.add,
                    bankInfo.customSampleBank,
                    bankInfo.volume
                )
            );
        }

        if (type & HitSoundType.whistle) {
            soundTypes.push(
                new HitSampleInfo(
                    HitSampleInfo.HIT_WHISTLE,
                    bankInfo.add,
                    bankInfo.customSampleBank,
                    bankInfo.volume
                )
            );
        }

        if (type & HitSoundType.clap) {
            soundTypes.push(
                new HitSampleInfo(
                    HitSampleInfo.HIT_CLAP,
                    bankInfo.add,
                    bankInfo.customSampleBank,
                    bankInfo.volume
                )
            );
        }

        return soundTypes;
    }

    /**
     * Populates a sample bank info with custom sample bank information.
     *
     * @param bankInfo The sample bank info to populate.
     * @param str The information.
     */
    private readCustomSampleBanks(bankInfo: SampleBankInfo, str: string): void {
        if (!str) {
            return;
        }

        const s: string[] = str.split(":");

        bankInfo.normal = <SampleBank>parseInt(s[0]);

        const addBank: SampleBank = <SampleBank>parseInt(s[1]);
        bankInfo.add = addBank === SampleBank.none ? bankInfo.normal : addBank;

        if (s.length > 2) {
            bankInfo.customSampleBank = parseInt(s[2]);
        }

        if (s.length > 3) {
            bankInfo.volume = Math.max(0, parseInt(s[3]));
        }

        if (s.length > 4) {
            bankInfo.filename = s[4];
        }
    }
}
