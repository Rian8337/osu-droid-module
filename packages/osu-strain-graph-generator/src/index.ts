import { ModFlashlight, Vector2 } from "@rian8337/osu-base";
import { StarRating } from "@rian8337/osu-difficulty-calculator";
import { StarRating as RebalanceStarRating } from "@rian8337/osu-rebalance-difficulty-calculator";
import { loadImage } from "canvas";
import { Chart } from "./Chart";

/**
 * Generates the strain chart of beatmap beatmap and returns the chart as a buffer.
 *
 * @param beatmap The beatmap to generate the strain graph for.
 * @param beatmapsetID The beatmapset ID to get background image from. If omitted, the background will be plain white.
 * @param color The color of the graph.
 */
export default async function getStrainChart(
    beatmap: StarRating | RebalanceStarRating,
    beatmapsetID?: number,
    color: string = "#000000"
): Promise<Buffer | null> {
    if (
        [
            beatmap.strainPeaks.aimWithSliders.length,
            beatmap.strainPeaks.aimWithoutSliders.length,
            beatmap.strainPeaks.speed.length,
            beatmap.strainPeaks.flashlight.length,
        ].some((v) => v === 0)
    ) {
        return null;
    }

    const sectionLength: number = 400;

    const currentSectionEnd: number =
        Math.ceil(beatmap.map.objects[0].startTime / sectionLength) *
        sectionLength;

    const strainInformations: {
        readonly time: number;
        readonly strain: number;
    }[] = new Array(
        Math.max(
            beatmap.strainPeaks.aimWithSliders.length,
            beatmap.strainPeaks.speed.length,
            beatmap.strainPeaks.flashlight.length
        )
    );

    for (let i = 0; i < strainInformations.length; ++i) {
        const aimStrain: number = beatmap.strainPeaks.aimWithSliders[i] ?? 0;
        const speedStrain: number = beatmap.strainPeaks.speed[i] ?? 0;
        const flashlightStrain: number = beatmap.strainPeaks.flashlight[i] ?? 0;

        strainInformations[i] = {
            time: (currentSectionEnd + sectionLength * i) / 1000,
            strain: beatmap.mods.some((m) => m instanceof ModFlashlight)
                ? (aimStrain + speedStrain + flashlightStrain) / 3
                : (aimStrain + speedStrain) / 2,
        };
    }

    const maxTime: number =
        strainInformations.at(-1)!.time ??
        beatmap.objects.at(-1)!.object.endTime / 1000;
    const maxStrain: number = Math.max(
        ...strainInformations.map((v) => {
            return v.strain;
        }),
        1
    );

    const maxXUnits: number = 10;
    const maxYUnits: number = 10;

    const unitsPerTickX: number = Math.ceil(maxTime / maxXUnits / 10) * 10;
    const unitsPerTickY: number = Math.ceil(maxStrain / maxYUnits / 20) * 20;

    const chart: Chart = new Chart({
        graphWidth: 900,
        graphHeight: 250,
        minX: 0,
        minY: 0,
        maxX: Math.ceil(maxTime / unitsPerTickX) * unitsPerTickX,
        maxY: Math.ceil(maxStrain / unitsPerTickY) * unitsPerTickY,
        unitsPerTickX,
        unitsPerTickY,
        background: await loadImage(
            `https://assets.ppy.sh/beatmaps/${beatmapsetID}/covers/cover.jpg`
        ).catch(() => {
            return undefined;
        }),
        xLabel: "Time",
        yLabel: "Strain",
        pointRadius: 0,
        xValueType: "time",
    });

    chart.drawArea(
        strainInformations.map((v) => new Vector2(v.time, v.strain)),
        color
    );

    return chart.getBuffer();
}
