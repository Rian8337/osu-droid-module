import { SampleBank } from "../../constants/SampleBank";
import { ControlPoint } from "../timings/ControlPoint";
import { ControlPointManager } from "../timings/ControlPointManager";
import { DifficultyControlPoint } from "../timings/DifficultyControlPoint";
import { EffectControlPoint } from "../timings/EffectControlPoint";
import { SampleControlPoint } from "../timings/SampleControlPoint";
import { TimingControlPoint } from "../timings/TimingControlPoint";
import { BaseParser } from "./BaseParser";

/**
 * A parser for parsing a beatmap's timing points section.
 */
export class ControlPointsParser extends BaseParser {
    parse(line: string): void {
        const s: string[] = line.split(",");

        if (s.length < 2) {
            throw new Error("Ignoring malformed timing point");
        }

        const time: number = this.map.getOffsetTime(
            this.tryParseFloat(this.setPosition(s[0]))
        );

        const msPerBeat: number = this.tryParseFloat(this.setPosition(s[1]));

        const timeSignature: number =
            this.tryParseInt(this.setPosition(s[2])) || 4;

        if (timeSignature < 1) {
            throw new RangeError(
                "The numerator of a time signature must be positive"
            );
        }

        const sampleSet: SampleBank = <SampleBank>(
            this.tryParseInt(this.setPosition(s[3]))
        );

        const customSampleBank: number = this.tryParseInt(
            this.setPosition(s[4])
        );

        const sampleVolume: number = this.tryParseInt(this.setPosition(s[5]));

        const effectBitFlags: number = this.tryParseInt(this.setPosition(s[7]));

        if (msPerBeat >= 0) {
            this.addControlPoint(
                new TimingControlPoint({
                    time: time,
                    msPerBeat: msPerBeat,
                    timeSignature: timeSignature || 4,
                }),
                this.map.controlPoints.timing
            );
        }

        this.addControlPoint(
            new DifficultyControlPoint({
                time: time,
                speedMultiplier: msPerBeat < 0 ? 100 / -msPerBeat : 1,
            }),
            this.map.controlPoints.difficulty
        );

        this.addControlPoint(
            new EffectControlPoint({
                time: time,
                effectBitFlags: effectBitFlags,
            }),
            this.map.controlPoints.effect
        );

        this.addControlPoint(
            new SampleControlPoint({
                time: time,
                sampleBank: sampleSet,
                sampleVolume: sampleVolume,
                customSampleBank: customSampleBank,
            }),
            this.map.controlPoints.sample
        );
    }

    /**
     * Adds a control point.
     *
     * @param controlPoint The control point to add.
     */
    private addControlPoint<T extends ControlPoint>(
        controlPoint: T,
        manager: ControlPointManager<T>
    ): void {
        // Remove the last control point if another control point overrides it at the same time.
        while (manager.points.at(-1)?.time === controlPoint.time) {
            manager.points.pop();
        }

        manager.add(controlPoint);
    }
}
