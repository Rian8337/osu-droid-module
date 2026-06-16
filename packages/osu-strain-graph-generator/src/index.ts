import { Beatmap, MathUtils, Vector2 } from "@rian8337/osu-base";
import { StrainPeaks } from "@rian8337/osu-difficulty-calculator";
import { StrainPeaks as RebalanceStrainPeaks } from "@rian8337/osu-rebalance-difficulty-calculator";
import { loadImage } from "canvas";
import { Chart } from "./Chart";

/**
 * A single strain peak at a specific point in time.
 */
interface Peak {
    readonly time: number;
    readonly value: number;
}

/**
 * Options for initializing the canvas.
 */
export interface CanvasOptions {
    /**
     * The beatmapset ID to get background image from. If omitted, the background will be plain white.
     */
    readonly beatmapsetID?: number;

    /**
     * The width of the canvas. Defaults to 600.
     */
    readonly width?: number;

    /**
     * The height of the canvas. Defaults to 150.
     */
    readonly height?: number;

    /**
     * The color of the graph. Defaults to black.
     */
    readonly color?: string;

    /**
     * Whether to show the time label. Defaults to `false`.
     */
    readonly showTimeLabel?: boolean;

    /**
     * Whether to show the strain axis. Defaults to `false`.
     */
    readonly drawStrainAxis?: boolean;

    /**
     * Whether to show the strain label. Only active when `drawStrainAxis` is set to `true`. Defaults to `false`.
     */
    readonly showStrainLabel?: boolean;
}

/**
 * Creates a sampler function that retrieves the value of the most recent peak at or before a given time.
 *
 * Peaks of different skills can represent sections of different (and possibly variable) lengths, or even
 * one peak per hitobject, so they cannot be assumed to share a common, fixed-width time grid. This walks
 * a single chronologically sorted `peaks` array forward as `time` increases, treating each peak as holding
 * its value until the next peak takes over.
 *
 * @param peaks The peaks to sample from, in chronological order.
 */
function createSampler(peaks: readonly Peak[]): (time: number) => number {
    let index = -1;
    let value = 0;

    return (time: number) => {
        while (index + 1 < peaks.length && peaks[index + 1].time <= time) {
            ++index;
            value = peaks[index].value;
        }

        return value;
    };
}

/**
 * Generates the strain chart of a beatmap and returns the chart as a buffer.
 *
 * @param beatmap The beatmap to generate the strain graph for.
 * @param strainPeaks The strain peaks of the beatmap.
 * @param clockRate The clock rate of the beatmap.
 * @param options The options for the canvas.
 */
export default async function (
    beatmap: Beatmap,
    strainPeaks: StrainPeaks | RebalanceStrainPeaks,
    clockRate: number,
    options?: CanvasOptions,
): Promise<Buffer> {
    const sectionLength = 400;
    const hasFlashlight = strainPeaks.flashlight.length > 0;

    // Each skill's peaks may be sectioned differently (fixed-width sections, variable-length sections,
    // or one peak per hitobject), so they are merged onto the union of their own timestamps rather than
    // a shared, assumed-uniform grid.
    const timestamps = new Set<number>();

    for (const peak of strainPeaks.aimWithSliders) {
        timestamps.add(peak.time);
    }

    for (const peak of strainPeaks.speed) {
        timestamps.add(peak.time);
    }

    for (const peak of strainPeaks.flashlight) {
        timestamps.add(peak.time);
    }

    const sortedTimestamps = [...timestamps].sort((a, b) => a - b);

    const firstObjectStartTime =
        beatmap.hitObjects.objects[0].startTime / clockRate;

    const sampleAim = createSampler(strainPeaks.aimWithSliders);
    const sampleSpeed = createSampler(strainPeaks.speed);
    const sampleFlashlight = createSampler(strainPeaks.flashlight);

    const strainInformations = new Array<{
        readonly time: number;
        readonly strain: number;
    }>(sortedTimestamps.length + 1);

    // Intentionally insert a 0 strain at 400ms less than the beginning
    // of the first object to smoothen the end curve.
    strainInformations[0] = {
        strain: 0,
        time: (firstObjectStartTime - sectionLength) / 1000,
    };

    for (let i = 0; i < sortedTimestamps.length; ++i) {
        const time = sortedTimestamps[i];

        const aimStrain = sampleAim(time);
        const speedStrain = sampleSpeed(time);
        const flashlightStrain = sampleFlashlight(time);

        strainInformations[i + 1] = {
            time: time / 1000,
            strain: hasFlashlight
                ? (aimStrain + speedStrain + flashlightStrain) / 3
                : (aimStrain + speedStrain) / 2,
        };
    }

    const maxTime =
        strainInformations.at(-1)?.time ??
        beatmap.hitObjects.objects.at(-1)!.endTime / 1000 / clockRate;

    const maxStrain = Math.max(
        MathUtils.max(strainInformations.map((v) => v.strain)),
        1,
    );

    const maxXUnits = 10;
    const maxYUnits = 10;

    const unitsPerTickX = Math.ceil(maxTime / maxXUnits / 10) * 10;
    const unitsPerTickY = maxStrain / maxYUnits / 20;

    const chart = new Chart({
        graphWidth: options?.width ?? 600,
        graphHeight: options?.height ?? 150,
        minX: 0,
        minY: 0,
        maxX: Math.ceil(maxTime / unitsPerTickX) * unitsPerTickX,
        maxY: options?.drawStrainAxis
            ? Math.ceil(maxStrain / Math.ceil(unitsPerTickY) / 20) *
              Math.ceil(unitsPerTickY) *
              20
            : maxStrain,
        unitsPerTickX,
        unitsPerTickY: options?.drawStrainAxis
            ? Math.ceil(unitsPerTickY) * 20
            : unitsPerTickY,
        background:
            options?.beatmapsetID !== undefined
                ? await loadImage(
                      `https://assets.ppy.sh/beatmaps/${options.beatmapsetID.toString()}/covers/cover.jpg`,
                  ).catch(() => undefined)
                : undefined,
        xLabel: options?.showTimeLabel ? "Time" : "",
        yLabel: options?.drawStrainAxis
            ? options.showStrainLabel
                ? "Strain"
                : ""
            : undefined,
        pointRadius: 0,
        xValueType: "time",
    });

    chart.drawArea(
        strainInformations.map((v) => new Vector2(v.time, v.strain)),
        options?.color ?? "#000000",
    );

    return chart.getBuffer();
}
