import { EffectFlags } from "../../../constants/EffectFlags";
import { SampleBank } from "../../../constants/SampleBank";
import { Beatmap } from "../../Beatmap";
import { DifficultyControlPoint } from "../../timings/DifficultyControlPoint";
import { EffectControlPoint } from "../../timings/EffectControlPoint";
import { SampleControlPoint } from "../../timings/SampleControlPoint";
import { TimingControlPoint } from "../../timings/TimingControlPoint";
import { SectionDecoder } from "../SectionDecoder";

/**
 * A decoder for decoding a beatmap's timing points section.
 */
export class BeatmapControlPointsDecoder extends SectionDecoder<Beatmap> {
    protected override decodeInternal(line: string): void {
        const s: string[] = line.split(",");

        if (s.length < 2) {
            throw new Error("Ignoring malformed timing point");
        }

        const time: number = this.target.getOffsetTime(
            this.tryParseFloat(this.setPosition(s[0]))
        );

        // msPerBeat is allowed to be NaN to handle an edge case in which some
        // beatmaps use NaN slider velocity to disable slider tick generation.
        const msPerBeat: number = this.tryParseFloat(
            this.setPosition(s[1]),
            undefined,
            undefined,
            true
        );

        let timeSignature: number = 4;
        if (s.length >= 3) {
            timeSignature = this.tryParseInt(this.setPosition(s[2]));
        }

        if (timeSignature < 1) {
            throw new RangeError(
                "The numerator of a time signature must be positive"
            );
        }

        let sampleSet: SampleBank = this.target.general.sampleBank;
        if (s.length >= 4) {
            sampleSet = <SampleBank>this.tryParseInt(this.setPosition(s[3]));
        }

        let customSampleBank: number = 0;
        if (s.length >= 5) {
            customSampleBank = this.tryParseInt(this.setPosition(s[4]));
        }

        let sampleVolume: number = this.target.general.sampleVolume;
        if (s.length >= 6) {
            sampleVolume = this.tryParseInt(this.setPosition(s[5]));
        }

        let kiaiMode: boolean = false;
        let omitFirstBarSignature: boolean = false;

        if (s.length >= 8) {
            const effectBitFlags: number = this.tryParseInt(
                this.setPosition(s[7])
            );
            kiaiMode = !!(effectBitFlags & EffectFlags.kiai);
            omitFirstBarSignature = !!(
                effectBitFlags & EffectFlags.omitFirstBarLine
            );
        }

        let timingChange: boolean = true;
        if (s.length >= 7) {
            timingChange = s[6] === "1";
        }

        if (timingChange) {
            if (Number.isNaN(msPerBeat)) {
                throw new Error(
                    "Beat length cannot be NaN in a timing control point"
                );
            }

            this.target.controlPoints.timing.add(
                new TimingControlPoint({
                    time: time,
                    msPerBeat: msPerBeat,
                    timeSignature: timeSignature,
                })
            );
        }

        this.target.controlPoints.difficulty.add(
            new DifficultyControlPoint({
                time: time,
                // If msPerBeat is NaN, speedMultiplier should still be 1 because all comparisons against NaN are false.
                speedMultiplier: msPerBeat < 0 ? 100 / -msPerBeat : 1,
                generateTicks: !Number.isNaN(msPerBeat),
            })
        );

        this.target.controlPoints.effect.add(
            new EffectControlPoint({
                time: time,
                isKiai: kiaiMode,
                omitFirstBarLine: omitFirstBarSignature,
            })
        );

        this.target.controlPoints.sample.add(
            new SampleControlPoint({
                time: time,
                sampleBank: sampleSet,
                sampleVolume: sampleVolume,
                customSampleBank: customSampleBank,
            })
        );
    }
}
