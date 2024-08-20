import { Modes } from "../../constants/Modes";
import { ObjectTypes } from "../../constants/ObjectTypes";
import { SampleBank } from "../../constants/SampleBank";
import { Vector2 } from "../../math/Vector2";
import { CircleSizeCalculator } from "../../utils/CircleSizeCalculator";
import {
    AR10_MS,
    convertApproachRateToMilliseconds,
} from "../../utils/DifficultyStatisticsCalculator";
import { BeatmapControlPoints } from "../sections/BeatmapControlPoints";
import { BeatmapDifficulty } from "../sections/BeatmapDifficulty";
import { BankHitSampleInfo } from "./BankHitSampleInfo";
import { HitSampleInfo } from "./HitSampleInfo";

/**
 * Represents a hitobject in a beatmap.
 */
export abstract class HitObject {
    /**
     * The base radius of all hitobjects.
     */
    static readonly baseRadius = 64;

    /**
     * A small adjustment to the start time of control points to account for rounding/precision errors.
     */
    protected static readonly controlPointLeniency = 1;

    /**
     * The start time of the hitobject in milliseconds.
     */
    startTime: number;

    /**
     * The bitwise type of the hitobject (circle/slider/spinner).
     */
    readonly type: ObjectTypes;

    /**
     * The position of the hitobject in osu!pixels.
     */
    position: Vector2;

    /**
     * The end position of the hitobject in osu!pixels.
     */
    endPosition: Vector2;

    /**
     * The end time of the hitobject.
     */
    endTime: number;

    /**
     * The duration of the hitobject.
     */
    get duration(): number {
        return this.endTime - this.startTime;
    }

    /**
     * Whether this hitobject represents a new combo.
     */
    readonly isNewCombo: boolean;

    /**
     * How many combo colors to skip, if this hitobject starts a new combo.
     */
    readonly comboOffset: number;

    /**
     * The samples to be played when this hitobject is hit.
     *
     * In the case of sliders, this is the sample of the curve body
     * and can be treated as the default samples for the hitobject.
     */
    samples: HitSampleInfo[] = [];

    /**
     * Any samples which may be used by this hitobject that are non-standard.
     */
    auxiliarySamples: HitSampleInfo[] = [];

    /**
     * The stack height of this hitobject.
     */
    protected _stackHeight = 0;

    /**
     * The stack height of this hitobject.
     */
    get stackHeight(): number {
        return this._stackHeight;
    }

    /**
     * The stack height of this hitobject.
     */
    set stackHeight(value: number) {
        this._stackHeight = value;
    }

    /**
     * The scale of this hitobject.
     */
    protected _scale = 1;

    /**
     * The scale of this hitobject.
     */
    get scale(): number {
        return this._scale;
    }

    /**
     * The scale of this hitobject.
     */
    set scale(value: number) {
        this._scale = value;
    }

    /**
     * The stack offset vector of the hitobject.
     *
     * This is used to calculate offset for stacked positions.
     */
    protected _stackOffset = new Vector2(0);

    /**
     * The stack offset vector of the hitobject.
     *
     * This is used to calculate offset for stacked positions.
     */
    get stackOffset(): Vector2 {
        return this._stackOffset;
    }

    /**
     * The stack offset vector of the hitobject.
     *
     * This is used to calculate offset for stacked positions.
     */
    set stackOffset(value: Vector2) {
        this._stackOffset = value;
    }

    /**
     * The stacked position of this hitobject.
     */
    get stackedPosition(): Vector2 {
        return this.position.add(this.stackOffset);
    }

    /**
     * The stacked end position of this hitobject.
     */
    get stackedEndPosition(): Vector2 {
        return this.endPosition.add(this.stackOffset);
    }

    /**
     * The time at which the approach circle of this hitobject should appear before this hitobject starts.
     */
    timePreempt = 600;

    /**
     * The time at which this hitobject should fade after this hitobject appears with respect to its time preempt.
     */
    timeFadeIn = 400;

    /**
     * The hitobject type (circle, slider, or spinner).
     */
    get typeStr(): string {
        let res = "";

        if (this.type & ObjectTypes.circle) {
            res += "circle | ";
        }

        if (this.type & ObjectTypes.slider) {
            res += "slider | ";
        }

        if (this.type & ObjectTypes.spinner) {
            res += "spinner | ";
        }

        return res.substring(0, Math.max(0, res.length - 3));
    }

    /**
     * The radius of this hitobject,
     */
    get radius(): number {
        return HitObject.baseRadius * this._scale;
    }

    constructor(values: {
        startTime: number;
        position: Vector2;
        newCombo?: boolean;
        comboOffset?: number;
        type?: number;
        endTime?: number;
        endPosition?: Vector2;
    }) {
        this.startTime = values.startTime;
        this.endTime = values.endTime ?? values.startTime;
        this.type = values.type ?? ObjectTypes.circle;
        this.position = values.position;
        this.endPosition = values.endPosition ?? this.position;
        this.isNewCombo = values.newCombo ?? false;
        this.comboOffset = values.comboOffset ?? 0;
    }

    /**
     * Applies default values to this hitobject.
     *
     * @param controlPoints The beatmap control points.
     * @param difficulty The beatmap difficulty settings.
     * @param mode The gamemode to apply defaults for.
     */
    applyDefaults(
        controlPoints: BeatmapControlPoints,
        difficulty: BeatmapDifficulty,
        mode: Modes,
    ) {
        this.timePreempt = convertApproachRateToMilliseconds(difficulty.ar);

        // Preempt time can go below 450ms. Normally, this is achieved via the DT mod which uniformly speeds up all animations game wide regardless of AR.
        // This uniform speedup is hard to match 1:1, however we can at least make AR>10 (via mods) feel good by extending the upper linear function above.
        // Note that this doesn't exactly match the AR>10 visuals as they're classically known, but it feels good.
        // This adjustment is necessary for AR>10, otherwise timePreempt can become smaller leading to hit circles not fully fading in.
        this.timeFadeIn = 400 * Math.min(1, this.timePreempt / AR10_MS);

        let stackOffsetMultiplier: number;

        switch (mode) {
            case Modes.droid:
                this.scale = CircleSizeCalculator.droidCSToDroidScale(
                    difficulty.cs,
                );
                stackOffsetMultiplier = 4;
                break;
            case Modes.osu:
                this.scale = CircleSizeCalculator.standardCSToStandardScale(
                    difficulty.cs,
                    true,
                );
                stackOffsetMultiplier = -6.4;
                break;
        }

        this.stackOffset = new Vector2(
            this.stackHeight * this.scale * stackOffsetMultiplier,
        );
    }

    /**
     * Applies samples to this hitobject.
     *
     * @param controlPoints The beatmap control points.
     */
    applySamples(controlPoints: BeatmapControlPoints) {
        const sampleControlPoint = controlPoints.sample.controlPointAt(
            this.endTime + HitObject.controlPointLeniency,
        );

        this.samples = this.samples.map((v) => sampleControlPoint.applyTo(v));
    }

    /**
     * Creates a hit sample info based on the sample setting of the first `BankHitSampleInfo.HIT_NORMAL` sample in the `samples` array.
     * If no sample is available, sane default settings will be used instead.
     *
     * In the case an existing sample exists, all settings apart from the sample name will be inherited. This includes volume and bank.
     *
     * @param sampleName The name of the sample.
     * @returns The created hit sample info.
     */
    protected createHitSampleInfo(sampleName: string): BankHitSampleInfo {
        const sample = this.samples.find(
            (s) =>
                s instanceof BankHitSampleInfo &&
                s.name === BankHitSampleInfo.HIT_NORMAL,
        ) as BankHitSampleInfo | undefined;

        if (sample) {
            return new BankHitSampleInfo(
                sampleName,
                sample.bank,
                sample.customSampleBank,
                sample.volume,
            );
        }

        return new BankHitSampleInfo(sampleName, SampleBank.none);
    }

    /**
     * Returns the string representative of the class.
     */
    abstract toString(): string;
}
