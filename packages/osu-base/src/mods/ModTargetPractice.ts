import { IBeatmap } from "../beatmap/IBeatmap";
import { BankHitSampleInfo } from "../beatmap/hitobjects/BankHitSampleInfo";
import { Circle } from "../beatmap/hitobjects/Circle";
import { HitSampleInfo } from "../beatmap/hitobjects/HitSampleInfo";
import { PlaceableHitObject } from "../beatmap/hitobjects/PlaceableHitObject";
import { Slider } from "../beatmap/hitobjects/Slider";
import { BeatmapDifficulty } from "../beatmap/sections/BeatmapDifficulty";
import { BreakPoint } from "../beatmap/timings/BreakPoint";
import { TimingControlPoint } from "../beatmap/timings/TimingControlPoint";
import { Modes } from "../constants/Modes";
import { Random } from "../math/Random";
import { Vector2 } from "../math/Vector2";
import { HitObjectGenerationUtils } from "../utils/HitObjectGenerationUtils";
import { Playfield } from "../utils/Playfield";
import { Precision } from "../utils/Precision";
import { IModApplicableToBeatmap } from "./IModApplicableToBeatmap";
import { IModApplicableToDifficulty } from "./IModApplicableToDifficulty";
import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { Mod } from "./Mod";
import { ModDepth } from "./ModDepth";
import { ModDifficultyAdjust } from "./ModDifficultyAdjust";
import { ModRandom } from "./ModRandom";
import { ModSpunOut } from "./ModSpunOut";
import { ModStrictTracking } from "./ModStrictTracking";
import { ModSuddenDeath } from "./ModSuddenDeath";

import { BooleanModSetting } from "./settings/BooleanModSetting";
import { NullableIntegerModSetting } from "./settings/NullableIntegerModSetting";

interface TimedSamples {
    readonly time: number;
    readonly samples: HitSampleInfo[];
}

/**
 * Represents the Target Practice mod.
 */
export class ModTargetPractice
    extends Mod
    implements
    IModApplicableToOsu,
    IModApplicableToBeatmap,
    IModApplicableToDifficulty {
    override readonly acronym = "TP";
    override readonly name = "Target Practice";

    readonly osuRanked = false;
    readonly isOsuRelevant = true;
    readonly osuScoreMultiplier = 1;

    /**
     * Jump distance for circles in the last combo.
     */
    private static readonly maxBaseDistance = 333;

    /**
     * The maximum allowed jump distance after multipliers are applied.
     */
    private static readonly distanceCap = 380;

    /**
     * The extent of rotation towards playfield centre when a circle is near the edge.
     */
    private static readonly edgeRotationMultiplier = 0.75;

    /**
     * Number of recent circles to check for overlap.
     */
    private static readonly overlapCheckCount = 5;

    /**
     * Acceptable difference for timing comparisons.
     */
    private static readonly timingPrecision = 1;

    /**
     * Use a custom seed instead of a random one.
     */
    readonly seed = new NullableIntegerModSetting(
        "Seed",
        "seed",
        "Use a custom seed instead of a random one",
        null,
        0,
        2147483647,
    );

    /**
     * Whether a metronome beat should play in the background.
     */
    readonly metronome = new BooleanModSetting(
        "Metronome ticks",
        "metronome",
        "Whether a metronome beat should play in the background",
        true,
    );

    override isCompatibleWith(other: Mod): boolean {
        return (
            !this.isInstanceOfAny(
                other,
                ModRandom,
                ModSpunOut,
                ModStrictTracking,
                ModSuddenDeath,
                ModDepth,
                ModDifficultyAdjust,
            ) && super.isCompatibleWith(other)
        );
    }

    applyToDifficulty(_: Modes, difficulty: BeatmapDifficulty) {
        // Decrease AR to increase preempt time.
        difficulty.ar *= 0.5;
    }

    applyToBeatmap(beatmap: IBeatmap) {
        this.seed.value ??= Math.floor(Math.random() * 2147483647);

        const random = new Random(this.seed.value);

        if (beatmap.hitObjects.objects.length === 0) {
            return;
        }

        const originalHitObjects = [...beatmap.hitObjects.objects].sort(
            (a, b) => a.startTime - b.startTime,
        );

        const beats = this.generateBeats(beatmap, originalHitObjects);
        const newComboBoundaries = this.determineNewComboBoundaries(
            beats,
            originalHitObjects,
        );

        const hitObjects = beats.map((beat, i) => {
            const circle = new Circle({
                startTime: beat,
                position: new Vector2(0, 0),
                newCombo: newComboBoundaries[i],
            });

            circle.applyDefaults(
                beatmap.controlPoints,
                beatmap.difficulty,
                Modes.Osu,
            );

            return circle;
        });

        this.addHitSamples(hitObjects, originalHitObjects);

        let prev: Circle | null = null;

        for (const circle of hitObjects) {
            circle.updateComboInformation(prev);
            prev = circle;
        }

        this.randomizeCirclePos(hitObjects, random);

        beatmap.hitObjects.clear();
        beatmap.hitObjects.add(...hitObjects);
    }

    private generateBeats(
        beatmap: IBeatmap,
        originalHitObjects: PlaceableHitObject[],
    ): number[] {
        const startTime = originalHitObjects[0].startTime;
        const endTime = Math.max(...originalHitObjects.map((o) => o.endTime));

        let beats: number[] = [];

        for (const timingPoint of beatmap.controlPoints.timing.points) {
            if (this.definitelyBigger(timingPoint.time, endTime)) {
                continue;
            }

            beats = beats.concat(
                this.getBeatsForTimingPoint(beatmap, timingPoint, endTime),
            );
        }

        beats = beats.filter((beat) => this.almostBigger(beat, startTime));
        beats = beats.filter(
            (beat) =>
                !this.isInsideBreakPeriod(
                    originalHitObjects,
                    beatmap.events.breaks,
                    beat,
                ),
        );

        for (let i = beats.length - 2; i >= 0; --i) {
            const beat = beats[i];
            const beatLength =
                beatmap.controlPoints.timing.controlPointAt(beat).msPerBeat;

            if (!this.definitelyBigger(beats[i + 1] - beat, beatLength / 2)) {
                beats.splice(i, 1);
            }
        }

        return beats;
    }

    private getBeatsForTimingPoint(
        beatmap: IBeatmap,
        timingPoint: TimingControlPoint,
        mapEndTime: number,
    ): number[] {
        const beats: number[] = [];

        let i = 0;
        let currentTime = timingPoint.time;

        while (
            !this.definitelyBigger(currentTime, mapEndTime) &&
            beatmap.controlPoints.timing.controlPointAt(currentTime) ===
            timingPoint
        ) {
            beats.push(Math.floor(currentTime));
            ++i;
            currentTime = timingPoint.time + i * timingPoint.msPerBeat;
        }

        return beats;
    }

    private isInsideBreakPeriod(
        originalHitObjects: PlaceableHitObject[],
        breaks: readonly BreakPoint[],
        time: number,
    ): boolean {
        return breaks.some((breakPeriod) => {
            const firstObjAfterBreak = originalHitObjects.find((obj) =>
                this.almostBigger(obj.startTime, breakPeriod.endTime),
            );

            return (
                this.almostBigger(time, breakPeriod.startTime) &&
                (!firstObjAfterBreak ||
                    this.definitelyBigger(firstObjAfterBreak.startTime, time))
            );
        });
    }

    private determineNewComboBoundaries(
        beats: number[],
        originalHitObjects: PlaceableHitObject[],
    ): boolean[] {
        let previousGroup = -1;

        return beats.map((beat) => {
            const group = this.getClosestPrecedingComboIndex(
                originalHitObjects,
                beat,
            );

            const isNewCombo = group !== previousGroup;
            previousGroup = group;

            return isNewCombo;
        });
    }

    private getClosestPrecedingComboIndex(
        hitObjects: PlaceableHitObject[],
        time: number,
    ): number {
        let result = 0;

        for (const obj of hitObjects) {
            if (this.almostBigger(time, obj.startTime)) {
                result = obj.comboIndex;
            } else {
                break;
            }
        }

        return result;
    }

    private addHitSamples(
        hitObjects: Circle[],
        originalHitObjects: PlaceableHitObject[],
    ) {
        const additions = [
            BankHitSampleInfo.HIT_WHISTLE,
            BankHitSampleInfo.HIT_FINISH,
            BankHitSampleInfo.HIT_CLAP,
        ];

        const timedSamples: TimedSamples[] = [];

        for (const obj of originalHitObjects) {
            if (obj instanceof Slider) {
                obj.nodeSamples.forEach((nodeSample, i) => {
                    timedSamples.push({
                        time: obj.startTime + i * obj.spanDuration,
                        samples: nodeSample,
                    });
                });
            } else {
                timedSamples.push({
                    time: obj.startTime,
                    samples: obj.samples,
                });
            }
        }

        for (const circle of hitObjects) {
            const exact = timedSamples.find((s) =>
                this.almostEquals(circle.startTime, s.time),
            );

            if (exact) {
                circle.samples = exact.samples;
                continue;
            }

            const closest = this.getClosestObject(
                originalHitObjects,
                circle.startTime,
            );

            circle.samples = closest.samples.filter(
                (s) =>
                    !(
                        s instanceof BankHitSampleInfo &&
                        additions.includes(s.name)
                    ),
            );
        }
    }

    private getClosestObject(
        hitObjects: PlaceableHitObject[],
        time: number,
    ): PlaceableHitObject {
        let precedingIndex = -1;

        for (let i = 0; i < hitObjects.length; ++i) {
            if (hitObjects[i].startTime < time) {
                precedingIndex = i;
            } else {
                break;
            }
        }

        if (precedingIndex === -1) {
            return hitObjects[0];
        }

        if (precedingIndex === hitObjects.length - 1) {
            return hitObjects[precedingIndex];
        }

        const preceding = hitObjects[precedingIndex];
        const succeeding = hitObjects[precedingIndex + 1];

        return succeeding.startTime - time < time - preceding.startTime
            ? succeeding
            : preceding;
    }

    private randomizeCirclePos(hitObjects: Circle[], random: Random) {
        if (hitObjects.length === 0) {
            return;
        }

        const nextSingle = (max = 1) => random.nextDouble() * max;
        const twoPi = Math.PI * 2;

        let direction = twoPi * nextSingle();
        const maxComboIndex = hitObjects[hitObjects.length - 1].comboIndex;

        for (let i = 0; i < hitObjects.length; ++i) {
            const obj = hitObjects[i];
            const lastPos =
                i === 0
                    ? Playfield.baseSize.scale(0.5)
                    : hitObjects[i - 1].position;

            let distance =
                maxComboIndex === 0
                    ? obj.radius
                    : this.mapRange(
                        obj.comboIndex,
                        0,
                        maxComboIndex,
                        obj.radius,
                        ModTargetPractice.maxBaseDistance,
                    );

            if (obj.isNewCombo) {
                distance *= 1.5;
            }

            if (obj.kiai) {
                distance *= 1.2;
            }

            distance = Math.min(ModTargetPractice.distanceCap, distance);

            let tryCount = 0;

            const precedingObjects = hitObjects.slice(
                Math.max(0, i - ModTargetPractice.overlapCheckCount),
                i,
            );

            do {
                if (tryCount > 0) {
                    direction = twoPi * nextSingle();
                }

                let relativePos = new Vector2(
                    distance * Math.cos(direction),
                    distance * Math.sin(direction),
                );

                relativePos = HitObjectGenerationUtils.rotateAwayFromEdge(
                    lastPos,
                    relativePos,
                    ModTargetPractice.edgeRotationMultiplier,
                );

                direction = Math.atan2(relativePos.y, relativePos.x);

                obj.position = lastPos.add(relativePos);
                this.clampToPlayfield(obj);

                ++tryCount;

                if (tryCount % 10 === 0) {
                    distance *= 0.9;
                }
            } while (
                distance >= obj.radius * 2 &&
                this.checkForOverlap(precedingObjects, obj)
            );

            if (obj.isLastInCombo) {
                direction = twoPi * nextSingle();
            } else {
                direction +=
                    (distance / ModTargetPractice.distanceCap) *
                    (nextSingle() * twoPi - Math.PI);
            }
        }
    }

    private checkForOverlap(objects: Circle[], target: Circle): boolean {
        return objects.some(
            (h) => h.position.getDistance(target.position) < target.radius * 2,
        );
    }

    private clampToPlayfield(obj: Circle) {
        const { radius } = obj;

        let { x, y } = obj.position;

        if (y < radius) {
            y = radius;
        } else if (y > Playfield.baseSize.y - radius) {
            y = Playfield.baseSize.y - radius;
        }

        if (x < radius) {
            x = radius;
        } else if (x > Playfield.baseSize.x - radius) {
            x = Playfield.baseSize.x - radius;
        }

        obj.position = new Vector2(x, y);
    }

    private mapRange(
        value: number,
        fromLow: number,
        fromHigh: number,
        toLow: number,
        toHigh: number,
    ): number {
        return (
            ((value - fromLow) * (toHigh - toLow)) / (fromHigh - fromLow) +
            toLow
        );
    }

    private almostBigger(value1: number, value2: number): boolean {
        return value1 > value2 - ModTargetPractice.timingPrecision;
    }

    private definitelyBigger(value1: number, value2: number): boolean {
        return value1 > value2 + ModTargetPractice.timingPrecision;
    }

    private almostEquals(value1: number, value2: number): boolean {
        return Precision.almostEquals(
            value1,
            value2,
            ModTargetPractice.timingPrecision,
        );
    }
}
