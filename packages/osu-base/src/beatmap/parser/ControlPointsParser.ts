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

        let timeSignature: number = 4;
        if (s.length >= 3) {
            timeSignature = this.tryParseInt(this.setPosition(s[2]));
        }

        if (timeSignature < 1) {
            throw new RangeError(
                "The numerator of a time signature must be positive"
            );
        }

        let sampleSet: SampleBank = this.map.general.sampleBank;
        if (s.length >= 4) {
            sampleSet = <SampleBank>this.tryParseInt(this.setPosition(s[3]));
        }

        let customSampleBank: number = 0;
        if (s.length >= 5) {
            customSampleBank = this.tryParseInt(this.setPosition(s[4]));
        }

        let sampleVolume: number = this.map.general.sampleVolume;
        if (s.length >= 6) {
            sampleVolume = this.tryParseInt(this.setPosition(s[5]));
        }

        let kiaiMode: boolean = false;

        if (s.length >= 8) {
            const effectBitFlags: number = this.tryParseInt(
                this.setPosition(s[7])
            );
            kiaiMode = !!(effectBitFlags & (1 << 0));
        }

        if (msPerBeat >= 0) {
            this.addControlPoint(
                new TimingControlPoint({
                    time: time,
                    msPerBeat: msPerBeat,
                    timeSignature: timeSignature,
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
                isKiai: kiaiMode,
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
