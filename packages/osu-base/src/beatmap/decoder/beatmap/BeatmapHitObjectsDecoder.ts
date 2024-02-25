import { HitSoundType } from "../../../constants/HitSoundType";
import { ObjectTypes } from "../../../constants/ObjectTypes";
import { ParserConstants } from "../../../constants/ParserConstants";
import { PathType } from "../../../constants/PathType";
import { SampleBank } from "../../../constants/SampleBank";
import { Vector2 } from "../../../mathutil/Vector2";
import { Precision } from "../../../utils/Precision";
import { SliderPath } from "../../../utils/SliderPath";
import { Beatmap } from "../../Beatmap";
import { BankHitSampleInfo } from "../../hitobjects/BankHitSampleInfo";
import { Circle } from "../../hitobjects/Circle";
import { FileHitSampleInfo } from "../../hitobjects/FileHitSampleInfo";
import { HitSampleInfo } from "../../hitobjects/HitSampleInfo";
import { PlaceableHitObject } from "../../hitobjects/PlaceableHitObject";
import { SampleBankInfo } from "../../hitobjects/SampleBankInfo";
import { Slider } from "../../hitobjects/Slider";
import { Spinner } from "../../hitobjects/Spinner";
import { SectionDecoder } from "../SectionDecoder";

/**
 * A decoder for decoding a beatmap's hitobjects section.
 */
export class BeatmapHitObjectsDecoder extends SectionDecoder<Beatmap> {
    private extraComboOffset = 0;
    private forceNewCombo = false;

    protected override decodeInternal(line: string): void {
        const s = line.split(",");

        if (s.length < 4) {
            throw new Error("Ignoring malformed hitobject");
        }

        const time = this.target.getOffsetTime(
            this.tryParseFloat(this.setPosition(s[2])),
        );

        const type = this.tryParseInt(this.setPosition(s[3]));

        let tempType = type;

        let comboOffset = (tempType & ObjectTypes.comboOffset) >> 4;
        tempType &= ~ObjectTypes.comboOffset;

        let newCombo = !!(type & ObjectTypes.newCombo);
        tempType &= ~ObjectTypes.newCombo;

        const position = new Vector2(
            this.tryParseFloat(
                this.setPosition(s[0]),
                -ParserConstants.MAX_COORDINATE_VALUE,
                ParserConstants.MAX_COORDINATE_VALUE,
            ),
            this.tryParseFloat(
                this.setPosition(s[1]),
                -ParserConstants.MAX_COORDINATE_VALUE,
                ParserConstants.MAX_COORDINATE_VALUE,
            ),
        );

        const soundType = <HitSoundType>this.tryParseInt(s[4]);
        const bankInfo = new SampleBankInfo();

        let object: PlaceableHitObject | null = null;

        if (type & ObjectTypes.circle) {
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
        } else if (type & ObjectTypes.slider) {
            if (s.length < 8) {
                throw new Error("Ignoring malformed slider");
            }

            const repeatCount = Math.max(
                0,
                // osu!stable treated the first span of the slider as a repeat, but no repeats are happening
                this.tryParseInt(
                    this.setPosition(s[6]),
                    -ParserConstants.MAX_PARSE_VALUE,
                    ParserConstants.MAX_REPETITIONS_VALUE,
                ) - 1,
            );

            const distance = Math.max(
                0,
                this.tryParseFloat(this.setPosition(s[7])),
            );

            const difficultyControlPoint =
                this.target.controlPoints.difficulty.controlPointAt(time);
            const timingControlPoint =
                this.target.controlPoints.timing.controlPointAt(time);

            const points = [new Vector2(0, 0)];
            const pointSplit = this.setPosition(s[5]).split("|");
            let pathType = <PathType>pointSplit.shift()!;

            for (const point of pointSplit) {
                const temp = point.split(":");
                const vec = new Vector2(
                    this.tryParseFloat(
                        temp[0],
                        -ParserConstants.MAX_COORDINATE_VALUE,
                        ParserConstants.MAX_COORDINATE_VALUE,
                    ),
                    this.tryParseFloat(
                        temp[1],
                        -ParserConstants.MAX_COORDINATE_VALUE,
                        ParserConstants.MAX_COORDINATE_VALUE,
                    ),
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
                                (points[2].y - points[0].y),
                    )
                ) {
                    // osu-stable special-cased colinear perfect curves to a linear path
                    pathType = PathType.Linear;
                }
            }

            const path = new SliderPath({
                pathType: pathType,
                controlPoints: points,
                expectedDistance: distance,
            });

            if (s.length > 10) {
                this.readCustomSampleBanks(bankInfo, s[10]);
            }

            // One node for each repeat + the start and end nodes
            const nodes = repeatCount + 2;

            // Populate node sample bank infos with the default hit object sample bank
            const nodeBankInfos: SampleBankInfo[] = [];
            for (let i = 0; i < nodes; ++i) {
                nodeBankInfos.push(new SampleBankInfo(bankInfo));
            }

            // Read any per-node sample banks
            if (s.length > 9 && s[9]) {
                const sets = s[9].split("|");

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
                const adds = s[8].split("|");

                for (let i = 0; i < Math.min(adds.length, nodes); ++i) {
                    nodeSoundTypes[i] = <HitSoundType>parseInt(adds[i]);
                }
            }

            // Generate the final per-node samples
            const nodeSamples: HitSampleInfo[][] = [];
            for (let i = 0; i < nodes; ++i) {
                nodeSamples.push(
                    this.convertSoundType(nodeSoundTypes[i], nodeBankInfos[i]),
                );
            }

            newCombo ||= this.forceNewCombo;
            comboOffset += this.extraComboOffset;

            this.forceNewCombo = false;
            this.extraComboOffset = 0;

            let tickDistanceMultiplier = Number.POSITIVE_INFINITY;

            if (difficultyControlPoint.generateTicks) {
                if (
                    this.isNumberValid(
                        timingControlPoint.msPerBeat,
                        ParserConstants.MIN_MSPERBEAT_VALUE,
                        ParserConstants.MAX_MSPERBEAT_VALUE,
                    )
                ) {
                    // Prior to v8, speed multipliers don't adjust for how many ticks are generated over the same distance.
                    // This results in more (or less) ticks being generated in <v8 maps for the same time duration.
                    //
                    // This additional check is used in case BPM goes very low or very high.
                    // When lazer is final, this should be revisited.
                    tickDistanceMultiplier =
                        this.target.formatVersion < 8
                            ? 1 / difficultyControlPoint.speedMultiplier
                            : 1;
                } else {
                    tickDistanceMultiplier = 1;
                }
            }

            object = new Slider({
                position: position,
                startTime: time,
                type: type,
                newCombo: newCombo,
                comboOffset: comboOffset,
                nodeSamples: nodeSamples,
                repeatCount: repeatCount,
                path: path,
                tickDistanceMultiplier: tickDistanceMultiplier,
            });
        } else if (type & ObjectTypes.spinner) {
            // Spinners don't create the new combo themselves, but force the next non-spinner hitobject to create a new combo.
            // Their combo offset is still added to that next hitobject's combo index.
            this.forceNewCombo ||= this.target.formatVersion <= 8 || newCombo;
            this.extraComboOffset += comboOffset;

            object = new Spinner({
                startTime: time,
                type: type,
                endTime: this.target.getOffsetTime(
                    this.tryParseInt(this.setPosition(s[5])),
                ),
            });

            if (s.length > 6) {
                this.readCustomSampleBanks(bankInfo, s[6]);
            }
        }

        if (!object) {
            throw new Error("Ignoring malformed hitobject");
        }

        if (object.samples.length === 0) {
            object.samples = this.convertSoundType(soundType, bankInfo);
        }

        this.target.hitObjects.add(object);
    }

    /**
     * Converts a sound type to hit samples.
     *
     * @param type The sound type.
     * @param bankInfo The bank
     */
    private convertSoundType(
        type: HitSoundType,
        bankInfo: SampleBankInfo,
    ): HitSampleInfo[] {
        const soundTypes: HitSampleInfo[] = [];

        if (bankInfo.filename) {
            soundTypes.push(
                new FileHitSampleInfo(bankInfo.filename, bankInfo.volume),
            );
        } else {
            soundTypes.push(
                new BankHitSampleInfo(
                    BankHitSampleInfo.HIT_NORMAL,
                    bankInfo.normal,
                    bankInfo.customSampleBank,
                    bankInfo.volume,
                    // If the sound type doesn't have the Normal flag set, attach it anyway as a layered sample.
                    // None also counts as a normal non-layered sample: https://osu.ppy.sh/help/wiki/osu!_File_Formats/Osu_(file_format)#hitsounds
                    type !== HitSoundType.none && !(type & HitSoundType.normal),
                ),
            );
        }

        const addBankSample = (name: string) => {
            soundTypes.push(
                new BankHitSampleInfo(
                    name,
                    bankInfo.add,
                    bankInfo.customSampleBank,
                    bankInfo.volume,
                ),
            );
        };

        if (type & HitSoundType.finish) {
            addBankSample(BankHitSampleInfo.HIT_FINISH);
        }

        if (type & HitSoundType.whistle) {
            addBankSample(BankHitSampleInfo.HIT_WHISTLE);
        }

        if (type & HitSoundType.clap) {
            addBankSample(BankHitSampleInfo.HIT_CLAP);
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

        const s = str.split(":");

        bankInfo.normal = <SampleBank>parseInt(s[0]);

        const addBank = <SampleBank>parseInt(s[1]);
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
