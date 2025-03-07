import { SliderPath } from "../../utils/SliderPath";
import { Vector2 } from "../../math/Vector2";
import { HitObject } from "./HitObject";
import { SliderHead } from "./sliderObjects/SliderHead";
import { SliderRepeat } from "./sliderObjects/SliderRepeat";
import { SliderTick } from "./sliderObjects/SliderTick";
import { SliderTail } from "./sliderObjects/SliderTail";
import { HitSampleInfo } from "./HitSampleInfo";
import { SliderNestedHitObject } from "./sliderObjects/SliderNestedHitObject";
import { BankHitSampleInfo } from "./BankHitSampleInfo";
import { Modes } from "../../constants/Modes";
import { BeatmapDifficulty } from "../sections/BeatmapDifficulty";
import { BeatmapControlPoints } from "../sections/BeatmapControlPoints";
import { MathUtils } from "../../math/MathUtils";
import { Cached } from "../../utils/Cached";
import { HitWindow } from "../../utils/HitWindow";
import { EmptyHitWindow } from "../../utils/EmptyHitWindow";
import { SequenceHitSampleInfo } from "./SequenceHitSampleInfo";
import { TimedHitSampleInfo } from "./TimedHitSampleInfo";
import { FileHitSampleInfo } from "./FileHitSampleInfo";

/**
 * Represents a slider in a beatmap.
 */
export class Slider extends HitObject {
    private static readonly baseNormalSlideSample = new BankHitSampleInfo(
        "sliderslide",
    );

    private static readonly baseWhistleSlideSample = new BankHitSampleInfo(
        "sliderwhistle",
    );

    private static readonly baseTickSample = new BankHitSampleInfo(
        "slidertick",
    );

    override get position(): Vector2 {
        return super.position;
    }

    override set position(value: Vector2) {
        super.position = value;

        this.updateNestedPositions();
    }

    override get endTime(): number {
        return (
            this.startTime + (this.spanCount * this.distance) / this.velocity
        );
    }

    private readonly endPositionCache: Cached<Vector2>;

    override get endPosition(): Vector2 {
        if (!this.endPositionCache.isValid) {
            this.endPositionCache.value = this.position.add(
                this.curvePositionAt(1),
            );
        }

        return this.endPositionCache.value;
    }

    /**
     * The nested hitobjects of the slider. Consists of headcircle (sliderhead), slider ticks, repeat points, and tailcircle (sliderend).
     */
    readonly nestedHitObjects: SliderNestedHitObject[] = [];

    /**
     * The slider's path.
     */
    private _path: SliderPath;

    /**
     * The slider's path.
     */
    get path(): SliderPath {
        return this._path;
    }

    /**
     * The slider's path.
     */
    set path(value: SliderPath) {
        this._path = value;

        this.updateNestedPositions();
    }

    /**
     * The slider's velocity.
     */
    private _velocity = 0;

    /**
     * The slider's velocity.
     */
    get velocity(): number {
        return this._velocity;
    }

    /**
     * The distance of this slider.
     */
    get distance(): number {
        return this.path.expectedDistance;
    }

    /**
     * The amount of times this slider repeats.
     */
    private _repeatCount: number;

    /**
     * The amount of times this slider repeats.
     */
    get repeatCount(): number {
        return this._repeatCount;
    }

    /**
     * The amount of times this slider repeats.
     */
    set repeatCount(value: number) {
        this._repeatCount = Math.max(0, value);

        this.updateNestedPositions();
    }

    /**
     * The amount of times the length of this slider spans.
     */
    get spanCount(): number {
        return this._repeatCount + 1;
    }

    /**
     * The spacing between slider ticks of this slider.
     */
    private _tickDistance = 0;

    /**
     * The spacing between slider ticks of this slider.
     */
    get tickDistance(): number {
        return this._tickDistance;
    }

    /**
     * An extra multiplier that affects the number of slider ticks generated by this slider.
     * An increase in this value increases `tickDistance`, which reduces the number of ticks generated.
     */
    readonly tickDistanceMultiplier: number;

    /**
     * Whether slider ticks should be generated by this object.
     *
     * This exists for backwards compatibility with maps that abuse NaN slider velocity behavior on osu!stable (e.g. /b/2628991).
     */
    generateTicks = true;

    /**
     * The position of the cursor at the point of completion of this slider if it was hit
     * with as few movements as possible. This is set and used by difficulty calculation.
     */
    lazyEndPosition?: Vector2;

    /**
     * The distance travelled by the cursor upon completion of this slider if it was hit
     * with as few movements as possible. This is set and used by difficulty calculation.
     */
    lazyTravelDistance = 0;

    /**
     * The time taken by the cursor upon completion of this slider if it was hit with
     * as few movements as possible. This is set and used by difficulty calculation.
     */
    lazyTravelTime = 0;

    /**
     * The length of one span of this slider.
     */
    get spanDuration(): number {
        return this.duration / this.spanCount;
    }

    /**
     * The slider's head.
     */
    private _head: SliderHead;

    /**
     * The slider's head.
     */
    get head(): SliderHead {
        return this._head;
    }

    /**
     * The slider's tail.
     */
    private _tail: SliderTail;

    /**
     * The slider's tail.
     */
    get tail(): SliderTail {
        return this._tail;
    }

    /**
     * The samples to be played when each node of this slider is hit.
     *
     * - 0: The first node.
     * - 1: The first repeat.
     * - 2: The second repeat.
     * - ...
     * - `n - 1`: The last repeat.
     * - `n`: The last node.
     */
    readonly nodeSamples: HitSampleInfo[][];

    /**
     * The amount of slider ticks in this slider.
     *
     * This iterates through all nested objects and should be stored locally or used sparingly.
     */
    get ticks(): number {
        return this.nestedHitObjects.filter((v) => v instanceof SliderTick)
            .length;
    }

    override get stackHeight(): number {
        return this._stackHeight;
    }

    override set stackHeight(value: number) {
        super.stackHeight = value;

        for (const nestedObject of this.nestedHitObjects) {
            nestedObject.stackHeight = value;
        }
    }

    override get scale(): number {
        return this._scale;
    }

    override set scale(value: number) {
        super.scale = value;

        for (const nestedObject of this.nestedHitObjects) {
            nestedObject.scale = value;
        }
    }

    static readonly legacyLastTickOffset = 36;

    constructor(values: {
        startTime: number;
        type: number;
        position: Vector2;
        repeatCount: number;
        path: SliderPath;
        newCombo?: boolean;
        comboOffset?: number;
        nodeSamples: HitSampleInfo[][];
        tickDistanceMultiplier: number;
    }) {
        super(values);

        this._path = values.path;
        this.nodeSamples = values.nodeSamples;
        this._repeatCount = values.repeatCount;
        this.endPositionCache = new Cached(
            this.position.add(this.curvePositionAt(1)),
        );
        this.tickDistanceMultiplier = values.tickDistanceMultiplier;

        this._head = new SliderHead({
            position: this._position,
            startTime: this.startTime,
        });

        this._tail = new SliderTail({
            sliderStartTime: this.startTime,
            sliderSpanDuration: this.spanDuration,
            position: this.endPosition,
            startTime: this.endTime,
            spanIndex: this.spanCount - 1,
            spanStartTime: this.startTime + this.spanDuration * this.spanCount,
        });
    }

    override applyDefaults(
        controlPoints: BeatmapControlPoints,
        difficulty: BeatmapDifficulty,
        mode: Modes,
    ): void {
        super.applyDefaults(controlPoints, difficulty, mode);

        const timingPoint = controlPoints.timing.controlPointAt(this.startTime);
        const difficultyPoint = controlPoints.difficulty.controlPointAt(
            this.startTime,
        );

        const sliderVelocityAsBeatLength =
            -100 / difficultyPoint.speedMultiplier;
        const bpmMultiplier =
            sliderVelocityAsBeatLength < 0
                ? MathUtils.clamp(
                      Math.fround(-sliderVelocityAsBeatLength),
                      10,
                      1000,
                  ) / 100
                : 1;

        this._velocity =
            (100 * difficulty.sliderMultiplier) /
            (timingPoint.msPerBeat * bpmMultiplier);

        // WARNING: this is intentionally not computed as `BASE_SCORING_DISTANCE * difficulty.sliderMultiplier`
        // for backwards compatibility reasons (intentionally introducing floating point errors to match osu!stable).
        const scoringDistance = this.velocity * timingPoint.msPerBeat;

        this.generateTicks = difficultyPoint.generateTicks;
        this._tickDistance = this.generateTicks
            ? (scoringDistance / difficulty.sliderTickRate) *
              this.tickDistanceMultiplier
            : Number.POSITIVE_INFINITY;

        this.createNestedHitObjects(controlPoints);

        this.nestedHitObjects.forEach((v) =>
            v.applyDefaults(controlPoints, difficulty, mode),
        );
    }

    override applySamples(controlPoints: BeatmapControlPoints): void {
        super.applySamples(controlPoints);

        this.nodeSamples.forEach((nodeSample, i) => {
            const time =
                this.startTime +
                i * this.spanDuration +
                HitObject.controlPointLeniency;

            const nodeSamplePoint = controlPoints.sample.controlPointAt(time);

            this.nodeSamples[i] = nodeSample.map((v) =>
                nodeSamplePoint.applyTo(v),
            );
        });

        // Create sliding samples
        this.createSlidingSamples(controlPoints);
        this.updateNestedSamples(controlPoints);
    }

    /**
     * Computes the position on this slider relative to how much of the slider has been completed.
     *
     * @param progress `[0, 1]` where 0 is the start time of this slider and 1 is the end time of this slider.
     * @returns The position on this slider at the given progress.
     */
    curvePositionAt(progress: number): Vector2 {
        return this.path.positionAt(this.progressAt(progress));
    }

    /**
     * Computes the progress along this slider relative to how much of the slider has been completed.
     *
     * @param progress `[0, 1]` where 0 is the start time of this slider and 1 is the end time of this slider.
     * @returns `[0, 1]` where 0 is the beginning of this slider and 1 is the end of this slider.
     */
    progressAt(progress: number): number {
        let p = (progress * this.spanCount) % 1;

        if (this.spanAt(progress) % 2 === 1) {
            p = 1 - p;
        }

        return p;
    }

    /**
     * Determines which span of this slider the progress point is on.
     *
     * @param progress `[0, 1]` where 0 is the start time of this slider and 1 is the end time of this slider.
     * @returns `[0, spanCount)` where 0 is the first run.
     */
    spanAt(progress: number): number {
        return Math.floor(progress * this.spanCount);
    }

    protected override createHitWindow(): HitWindow | null {
        return new EmptyHitWindow();
    }

    private createNestedHitObjects(controlPoints: BeatmapControlPoints): void {
        this.nestedHitObjects.length = 0;

        this._head = new SliderHead({
            position: this.position,
            startTime: this.startTime,
        });

        this.nestedHitObjects.push(this.head);

        // A very lenient maximum length of a slider for ticks to be generated.
        // This exists for edge cases such as /b/1573664 where the beatmap has been edited by the user, and should never be reached in normal usage.
        const maxLength = 100000;
        const length = Math.min(maxLength, this.path.expectedDistance);

        const tickDistance = MathUtils.clamp(this.tickDistance, 0, length);
        const minDistanceFromEnd = this.velocity * 10;

        for (let span = 0; span < this.spanCount; ++span) {
            const spanStartTime = this.startTime + span * this.spanDuration;

            if (tickDistance !== 0 && this.generateTicks) {
                const reversed = span % 2 === 1;
                const sliderTicks: SliderTick[] = [];

                for (let d = tickDistance; d <= length; d += tickDistance) {
                    if (d >= length - minDistanceFromEnd) {
                        break;
                    }

                    // Always generate ticks from the start of the path rather than the span to ensure that ticks in repeat spans are positioned identically to those in non-repeat spans
                    const distanceProgress = d / length;
                    const timeProgress = reversed
                        ? 1 - distanceProgress
                        : distanceProgress;

                    const sliderTickPosition = this.position.add(
                        this.path.positionAt(distanceProgress),
                    );

                    const sliderTick = new SliderTick({
                        startTime:
                            spanStartTime + timeProgress * this.spanDuration,
                        position: sliderTickPosition,
                        spanIndex: span,
                        spanStartTime: spanStartTime,
                    });

                    // Inherit the slider's preempt and fade in times for now. They may be overridden
                    // in applyDefaults later.
                    sliderTick.timePreempt = this.timePreempt;
                    sliderTick.timeFadeIn = this.timeFadeIn;

                    sliderTicks.push(sliderTick);
                }

                // For repeat spans, ticks are returned in reverse-StartTime order.
                if (reversed) {
                    sliderTicks.reverse();
                }

                this.nestedHitObjects.push(...sliderTicks);
            }

            if (span < this.spanCount - 1) {
                const repeatPosition = this.position.add(
                    this.path.positionAt((span + 1) % 2),
                );

                const repeatPoint = new SliderRepeat({
                    sliderStartTime: this.startTime,
                    sliderSpanDuration: this.spanDuration,
                    position: repeatPosition,
                    startTime: spanStartTime + this.spanDuration,
                    spanIndex: span,
                    spanStartTime: spanStartTime,
                });

                this.nestedHitObjects.push(repeatPoint);
            }
        }

        this._tail = new SliderTail({
            sliderStartTime: this.startTime,
            sliderSpanDuration: this.spanDuration,
            position: this.endPosition,
            startTime: this.endTime,
            spanIndex: this.spanCount - 1,
            spanStartTime: this.startTime + this.spanDuration * this.spanCount,
        });

        this.nestedHitObjects.push(this.tail);
        this.nestedHitObjects.sort((a, b) => a.startTime - b.startTime);

        this.updateNestedSamples(controlPoints);
    }

    private updateNestedPositions(): void {
        this.endPositionCache.invalidate();

        this.head.position = this.position;
        this.tail.position = this.endPosition;
    }

    private createSlidingSamples(controlPoints: BeatmapControlPoints): void {
        this.auxiliarySamples.length = 0;

        const bankSamples = this.samples.filter(
            (v): v is BankHitSampleInfo => v instanceof BankHitSampleInfo,
        );

        const normalSample = bankSamples.find(
            (v) => v.name === BankHitSampleInfo.HIT_NORMAL,
        );

        const whistleSample = bankSamples.find(
            (v) => v.name === BankHitSampleInfo.HIT_WHISTLE,
        );

        if (!normalSample && !whistleSample) {
            return;
        }

        const samplePoints = controlPoints.sample.between(
            this.startTime + Slider.controlPointLeniency,
            this.endTime + Slider.controlPointLeniency,
        );

        if (normalSample) {
            this.auxiliarySamples.push(
                new SequenceHitSampleInfo(
                    samplePoints.map(
                        (s) =>
                            new TimedHitSampleInfo(
                                s.time,
                                s.applyTo(Slider.baseNormalSlideSample),
                            ),
                    ),
                ),
            );
        }

        if (whistleSample) {
            this.auxiliarySamples.push(
                new SequenceHitSampleInfo(
                    samplePoints.map(
                        (s) =>
                            new TimedHitSampleInfo(
                                s.time,
                                s.applyTo(Slider.baseWhistleSlideSample),
                            ),
                    ),
                ),
            );
        }
    }

    private updateNestedSamples(controlPoints: BeatmapControlPoints): void {
        // Ensure that the list of node samples is at least as long as the number of nodes.
        while (this.nodeSamples.length < this.repeatCount + 2) {
            this.nodeSamples.push(
                this.samples.map((s) => {
                    if (s instanceof BankHitSampleInfo) {
                        return new BankHitSampleInfo(
                            s.name,
                            s.bank,
                            s.customSampleBank,
                            s.volume,
                            s.isLayered,
                        );
                    } else if (s instanceof FileHitSampleInfo) {
                        return new FileHitSampleInfo(s.filename, s.volume);
                    } else {
                        throw new TypeError("Unknown type of hit sample info.");
                    }
                }),
            );
        }

        for (const nestedObject of this.nestedHitObjects) {
            nestedObject.samples.length = 0;

            if (nestedObject instanceof SliderHead) {
                nestedObject.samples.push(...this.nodeSamples[0]);
            } else if (nestedObject instanceof SliderRepeat) {
                nestedObject.samples.push(
                    ...this.nodeSamples[nestedObject.spanIndex + 1],
                );
            } else if (nestedObject instanceof SliderTail) {
                nestedObject.samples.push(...this.nodeSamples[this.spanCount]);
            } else {
                const time =
                    nestedObject.startTime + Slider.controlPointLeniency;

                const tickSamplePoint =
                    controlPoints.sample.controlPointAt(time);

                nestedObject.samples.push(
                    tickSamplePoint.applyTo(Slider.baseTickSample),
                );
            }
        }

        const bankSamples = this.samples.filter(
            (v) => v instanceof BankHitSampleInfo,
        ) as BankHitSampleInfo[];
        const normalSample =
            bankSamples.find((v) => v.name === BankHitSampleInfo.HIT_NORMAL) ??
            bankSamples.at(0);

        const sampleList: BankHitSampleInfo[] = [];

        if (normalSample) {
            sampleList.push(
                new BankHitSampleInfo(
                    "slidertick",
                    normalSample.bank,
                    normalSample.customSampleBank,
                    normalSample.volume,
                    normalSample.isLayered,
                ),
            );
        }

        const getSample = (index: number) =>
            this.nodeSamples.at(index) ?? this.samples;

        this.nestedHitObjects.forEach((v) => {
            switch (true) {
                case v instanceof SliderHead:
                    v.samples.push(...getSample(0));
                    break;
                case v instanceof SliderRepeat:
                    v.samples.push(...getSample(v.spanIndex + 1));
                    break;
                case v instanceof SliderTail:
                    v.samples.push(...getSample(this.spanCount));
                    break;
                default:
                    v.samples.push(...sampleList);
            }
        });
    }

    override toString(): string {
        return `Position: [${this.position.x}, ${this.position.y}], distance: ${
            this.path.expectedDistance
        }, repeat count: ${this.repeatCount}, slider ticks: ${
            this.nestedHitObjects.filter((v) => v instanceof SliderTick).length
        }`;
    }
}
