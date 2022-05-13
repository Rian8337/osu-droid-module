import Collection from "@discordjs/collection";
import { EffectFlags } from "../../constants/EffectFlags";
import { DifficultyControlPoint } from "../timings/DifficultyControlPoint";
import { EffectControlPoint } from "../timings/EffectControlPoint";
import { SampleControlPoint } from "../timings/SampleControlPoint";
import { TimingControlPoint } from "../timings/TimingControlPoint";
import { BeatmapBaseEncoder } from "./BeatmapBaseEncoder";

/**
 * An encoder for encoding a beatmap's timing points section.
 */
export class BeatmapControlPointsEncoder extends BeatmapBaseEncoder {
    private readonly controlPointGroups: Collection<
        number,
        {
            timing?: TimingControlPoint;
            difficulty?: DifficultyControlPoint;
            effect?: EffectControlPoint;
            sample?: SampleControlPoint;
        }
    > = new Collection();

    protected override encodeInternal(): void {
        if (
            this.map.controlPoints.timing.points.length === 0 &&
            this.map.controlPoints.difficulty.points.length === 0 &&
            this.map.controlPoints.effect.points.length === 0 &&
            this.map.controlPoints.sample.points.length === 0
        ) {
            return;
        }

        this.writeLine("[TimingPoints]");

        // Since control points are scattered, we group them by time first.
        this.collectTimingControlPointInfo();
        this.collectDifficultyControlPointInfo();
        this.collectEffectControlPointInfo();
        this.collectSampleControlPointInfo();

        this.controlPointGroups.sort((_, __, a, b) => a - b);

        for (const [time, group] of this.controlPointGroups) {
            // If the group contains a timing control point, it needs to be output separately.
            if (group.timing) {
                this.write(`${group.timing.time},`);
                this.write(`${group.timing.msPerBeat},`);
                this.outputControlPointGroup(time, group, true);
            }

            // Output any remaining effects as secondary non-timing control point.
            this.write(`${time},`);

            const difficultyPoint: DifficultyControlPoint =
                group.difficulty ??
                this.map.controlPoints.difficulty.controlPointAt(time);

            this.write(`${-100 / difficultyPoint.speedMultiplier},`);
            this.outputControlPointGroup(time, group, false);
        }
    }

    protected override reset(): void {
        super.reset();

        this.controlPointGroups.clear();
    }

    private collectTimingControlPointInfo(): void {
        for (const t of this.map.controlPoints.timing.points) {
            const group = this.controlPointGroups.get(t.time) ?? {};

            group.timing ??= t;

            this.controlPointGroups.set(t.time, group);
        }
    }

    private collectDifficultyControlPointInfo(): void {
        for (const t of this.map.controlPoints.difficulty.points) {
            const group = this.controlPointGroups.get(t.time) ?? {};

            group.difficulty ??= t;

            this.controlPointGroups.set(t.time, group);
        }
    }

    private collectEffectControlPointInfo(): void {
        for (const t of this.map.controlPoints.effect.points) {
            const group = this.controlPointGroups.get(t.time) ?? {};

            group.effect ??= t;

            this.controlPointGroups.set(t.time, group);
        }
    }

    private collectSampleControlPointInfo(): void {
        for (const t of this.map.controlPoints.sample.points) {
            const group = this.controlPointGroups.get(t.time) ?? {};

            group.sample ??= t;

            this.controlPointGroups.set(t.time, group);
        }
    }

    private outputControlPointGroup(
        time: number,
        group: {
            timing?: TimingControlPoint;
            difficulty?: DifficultyControlPoint;
            effect?: EffectControlPoint;
            sample?: SampleControlPoint;
        },
        isTimingPoint: boolean
    ): void {
        const samplePoint: SampleControlPoint =
            group.sample ?? this.map.controlPoints.sample.controlPointAt(time);

        const effectPoint: EffectControlPoint =
            group.effect ?? this.map.controlPoints.effect.controlPointAt(time);

        // Convert effect flags.
        let effectFlags: EffectFlags = EffectFlags.none;
        if (effectPoint.isKiai) {
            effectFlags |= EffectFlags.kiai;
        }
        if (effectPoint.omitFirstBarLine) {
            effectFlags |= EffectFlags.omitFirstBarLine;
        }

        this.write(
            `${
                (
                    group.timing ??
                    this.map.controlPoints.timing.controlPointAt(time)
                ).timeSignature
            },`
        );
        this.write(`${samplePoint.sampleBank.toString()},`);
        this.write(`${samplePoint.customSampleBank.toString()},`);
        this.write(`${samplePoint.sampleVolume.toString()},`);
        this.write(`${isTimingPoint ? "1" : "0"},`);
        this.write(effectFlags.toString());
        this.writeLine();
    }
}
