import { Modes } from "../../constants/Modes";
import { ObjectTypes } from "../../constants/ObjectTypes";
import { SampleBank } from "../../constants/SampleBank";
import { Vector2 } from "../../math/Vector2";
import { CircleSizeCalculator } from "../../utils/CircleSizeCalculator";
import { DroidHitWindow } from "../DroidHitWindow";
import { HitWindow } from "../HitWindow";
import { OsuHitWindow } from "../OsuHitWindow";
import { BeatmapControlPoints } from "../sections/BeatmapControlPoints";
import { BeatmapDifficulty } from "../sections/BeatmapDifficulty";
import { BankHitSampleInfo } from "./BankHitSampleInfo";
import { HitSampleInfo } from "./HitSampleInfo";
import { SequenceHitSampleInfo } from "./SequenceHitSampleInfo";

/**
 * Represents a hitobject in a beatmap.
 */
export abstract class HitObject {
    /**
     * The base radius of all hitobjects.
     */
    static readonly baseRadius = 64;

    /**
     * Maximum preempt time at AR=0.
     */
    static readonly preemptMax = 1800;

    /**
     * Median preempt time at AR=5.
     */
    static readonly preemptMid = 1200;

    /**
     * Minimum preempt time at AR=10.
     */
    static readonly preemptMin = 450;

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

    protected _position: Vector2;

    /**
     * The position of the hitobject in osu!pixels.
     */
    get position(): Vector2 {
        return this._position;
    }

    set position(value: Vector2) {
        this._position = value;
    }

    /**
     * The end position of the hitobject in osu!pixels.
     */
    get endPosition(): Vector2 {
        return this.position;
    }

    /**
     * The end time of the hitobject.
     */
    get endTime(): number {
        return this.startTime;
    }

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
     * When starting a new combo, the offset of the new combo relative to the current one.
     *
     * This is generally a setting provided by a beatmap creator to choreograph interesting color patterns
     * which can only be achieved by skipping combo colors with per-hitobject level.
     *
     * It is exposed via `comboIndexWithOffsets`.
     */
    readonly comboOffset: number;

    private _indexInCurrentCombo = 0;

    /**
     * The index of this hitobject in the current combo.
     */
    get indexInCurrentCombo(): number {
        return this._indexInCurrentCombo;
    }

    private _comboIndex = 0;

    /**
     * The index of this hitobject's combo in relation to the beatmap.
     *
     * In other words, this is incremented by 1 each time an `isNewCombo` is reached.
     */
    get comboIndex(): number {
        return this._comboIndex;
    }

    private _comboIndexWithOffsets = 0;

    /**
     * The index of this hitobject's combo in relation to the beatmap, with all aggregates applied.
     */
    get comboIndexWithOffsets(): number {
        return this._comboIndexWithOffsets;
    }

    /**
     * Whether this is the last hitobject in the current combo.
     */
    isLastInCombo = false;

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
    auxiliarySamples: SequenceHitSampleInfo[] = [];

    private _kiai = false;

    /**
     * Whether this hitobject is in kiai time.
     */
    get kiai(): boolean {
        return this._kiai;
    }

    /**
     * The hit window of this hitobject.
     */
    hitWindow: HitWindow | null = null;

    private _stackHeight = 0;

    /**
     * The stack height of this hitobject.
     */
    get stackHeight(): number {
        return this._stackHeight;
    }

    set stackHeight(value: number) {
        this._stackHeight = value;
    }

    private _scale = 1;

    /**
     * The osu!standard scale of this hitobject.
     */
    get scale(): number {
        return this._scale;
    }

    set scale(value: number) {
        this._scale = value;
    }

    private _stackOffsetMultiplier = 0;

    /**
     * The multiplier for the stack offset of this hitobject.
     *
     * This determines how much hitobjects are stacked - and to which direction.
     */
    get stackOffsetMultiplier(): number {
        return this._stackOffsetMultiplier;
    }

    set stackOffsetMultiplier(value: number) {
        this._stackOffsetMultiplier = value;
    }

    /**
     * The stack offset vector of this hitobject.
     */
    get stackOffset(): Vector2 {
        return new Vector2(
            this.stackHeight * this.scale * this.stackOffsetMultiplier,
        );
    }

    /**
     * The stacked position of this hitobject.
     */
    get stackedPosition(): Vector2 {
        return this.evaluateStackedPosition(this.position);
    }

    /**
     * The stacked end position of this hitobject.
     */
    get stackedEndPosition(): Vector2 {
        return this.evaluateStackedPosition(this.endPosition);
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
     * The radius of this hitobject in osu!pixels.
     */
    get radius(): number {
        return HitObject.baseRadius * this.scale;
    }

    constructor(values: {
        startTime: number;
        position: Vector2;
        newCombo?: boolean;
        comboOffset?: number;
        type?: number;
        endPosition?: Vector2;
    }) {
        this.startTime = values.startTime;
        this.type = values.type ?? ObjectTypes.circle;
        this._position = values.position;
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
        this._kiai = controlPoints.effect.controlPointAt(
            this.startTime + HitObject.controlPointLeniency,
        ).isKiai;

        this.hitWindow ??= this.createHitWindow(mode);

        if (this.hitWindow) {
            this.hitWindow.overallDifficulty = difficulty.od;
        }

        this.timePreempt = BeatmapDifficulty.difficultyRange(
            difficulty.ar,
            HitObject.preemptMax,
            HitObject.preemptMid,
            HitObject.preemptMin,
        );

        // Preempt time can go below 450ms. Normally, this is achieved via the DT mod which uniformly speeds up all animations game wide regardless of AR.
        // This uniform speedup is hard to match 1:1, however we can at least make AR>10 (via mods) feel good by extending the upper linear function above.
        // Note that this doesn't exactly match the AR>10 visuals as they're classically known, but it feels good.
        // This adjustment is necessary for AR>10, otherwise timePreempt can become smaller leading to hit circles not fully fading in.
        this.timeFadeIn =
            400 * Math.min(1, this.timePreempt / HitObject.preemptMin);

        switch (mode) {
            case Modes.droid:
                this.scale = CircleSizeCalculator.droidCSToDroidScale(
                    difficulty.cs,
                );
                this.stackOffsetMultiplier = -4;
                break;

            case Modes.osu:
                this.scale = CircleSizeCalculator.standardCSToStandardScale(
                    difficulty.cs,
                    true,
                );
                this.stackOffsetMultiplier = -6.4;
                break;
        }
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
     * Given the previous hitobject in the beatmap, update relevant combo information.
     *
     * @param prev The previous hitobject in the beatmap.
     */
    updateComboInformation(prev?: HitObject | null) {
        this._comboIndex = prev?.comboIndex ?? 0;
        this._comboIndexWithOffsets = prev?.comboIndexWithOffsets ?? 0;
        this._indexInCurrentCombo = prev ? prev.indexInCurrentCombo + 1 : 0;

        if (this.isNewCombo || !prev || prev.type & ObjectTypes.spinner) {
            this._indexInCurrentCombo = 0;
            ++this._comboIndex;

            if (!(this.type & ObjectTypes.spinner)) {
                // Spinners do not affect combo color offsets.
                this._comboIndexWithOffsets += this.comboOffset + 1;
            }

            if (prev) {
                prev.isLastInCombo = true;
            }
        }
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
     * Creates the hit window of this hitobject.
     *
     * A `null` return means that this hitobject has no hit window and timing errors should not be displayed to the user.
     *
     * This will only be called if this hitobject's hit window has not been set externally.
     *
     * @param mode The gamemode to create the hit window for.
     * @returns The created hit window.
     */
    protected createHitWindow(mode: Modes): HitWindow | null {
        switch (mode) {
            case Modes.droid:
                return new DroidHitWindow();

            case Modes.osu:
                return new OsuHitWindow();
        }
    }

    /**
     * Returns the string representative of the class.
     */
    abstract toString(): string;

    /**
     * Evaluates the stacked position of the specified position.
     *
     * @param position The position to evaluate.
     * @returns The stacked position.
     */
    private evaluateStackedPosition(position: Vector2): Vector2 {
        if ((this.type & ObjectTypes.spinner) > 0 || this.stackHeight === 0) {
            return position;
        }

        return position.add(this.stackOffset);
    }
}
