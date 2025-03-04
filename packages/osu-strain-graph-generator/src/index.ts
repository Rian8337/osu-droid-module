import { Beatmap, MathUtils, Vector2 } from "@rian8337/osu-base";
import { StrainPeaks } from "@rian8337/osu-difficulty-calculator";
import { StrainPeaks as RebalanceStrainPeaks } from "@rian8337/osu-rebalance-difficulty-calculator";
import { loadImage } from "canvas";
import { Chart } from "./Chart";

/**
 * Generates the strain chart of a beatmap and returns the chart as a buffer.
 *
 * @param beatmap The beatmap to generate the strain graph for.
 * @param strainPeaks The strain peaks of the beatmap.
 * @param clockRate The clock rate of the beatmap.
 * @param beatmapsetID The beatmapset ID to get background image from. If omitted, the background will be plain white.
 * @param color The color of the graph.
 */
export default async function (
    beatmap: Beatmap,
    strainPeaks: StrainPeaks | RebalanceStrainPeaks,
    clockRate: number,
    beatmapsetID?: number,
    color: string = "#000000",
): Promise<Buffer> {
    const sectionLength = 400;
    const currentSectionEnd =
        Math.ceil(beatmap.hitObjects.objects[0].startTime / sectionLength) *
        sectionLength;

    const strainInformations: {
        readonly time: number;
        readonly strain: number;
    }[] = new Array(
        Math.max(
            strainPeaks.aimWithSliders.length,
            strainPeaks.speed.length,
            strainPeaks.flashlight.length,
        ) + 1,
    );

    // Intentionally insert a 0 strain at 400ms less than the beginning
    // of the first object to smoothen the end curve.
    strainInformations[0] = {
        strain: 0,
        time: (currentSectionEnd - sectionLength) / 1000,
    };

    for (let i = 1; i < strainInformations.length; ++i) {
        const aimStrain = strainPeaks.aimWithSliders[i] ?? 0;
        const speedStrain = strainPeaks.speed[i] ?? 0;
        const flashlightStrain = strainPeaks.flashlight[i] ?? 0;

        strainInformations[i] = {
            time: (currentSectionEnd + sectionLength * (i - 1)) / 1000,
            strain:
                strainPeaks.flashlight.length > 0
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
    const unitsPerTickY = Math.ceil(maxStrain / maxYUnits / 20) * 20;

    const chart = new Chart({
        graphWidth: 900,
        graphHeight: 250,
        minX: 0,
        minY: 0,
        maxX: Math.ceil(maxTime / unitsPerTickX) * unitsPerTickX,
        maxY: Math.ceil(maxStrain / unitsPerTickY) * unitsPerTickY,
        unitsPerTickX,
        unitsPerTickY,
        background: await loadImage(
            `https://assets.ppy.sh/beatmaps/${beatmapsetID}/covers/cover.jpg`,
        ).catch(() => undefined),
        xLabel: "Time",
        yLabel: "Strain",
        pointRadius: 0,
        xValueType: "time",
    });

    chart.drawArea(
        strainInformations.map((v) => new Vector2(v.time, v.strain)),
        color,
    );

    return chart.getBuffer();
}
