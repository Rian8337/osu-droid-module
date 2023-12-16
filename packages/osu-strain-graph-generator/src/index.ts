import { ModFlashlight, Vector2 } from "@rian8337/osu-base";
import {
    DifficultyAttributes,
    DifficultyCalculator,
    DifficultyHitObject,
} from "@rian8337/osu-difficulty-calculator";
import {
    DifficultyAttributes as RebalanceDifficultyAttributes,
    DifficultyCalculator as RebalanceDifficultyCalculator,
    DifficultyHitObject as RebalanceDifficultyHitObject,
} from "@rian8337/osu-rebalance-difficulty-calculator";
import { loadImage } from "canvas";
import { Chart } from "./Chart";

/**
 * Generates the strain chart of a difficulty calculator and returns the chart as a buffer.
 *
 * @param calculator The difficulty calculator to generate the strain graph for.
 * @param beatmapsetID The beatmapset ID to get background image from. If omitted, the background will be plain white.
 * @param color The color of the graph.
 */
export default async function getStrainChart(
    calculator:
        | DifficultyCalculator<DifficultyHitObject, DifficultyAttributes>
        | RebalanceDifficultyCalculator<
              RebalanceDifficultyHitObject,
              RebalanceDifficultyAttributes
          >,
    beatmapsetID?: number,
    color: string = "#000000",
): Promise<Buffer | null> {
    if (
        [
            calculator.strainPeaks.aimWithSliders.length,
            calculator.strainPeaks.aimWithoutSliders.length,
            calculator.strainPeaks.speed.length,
            calculator.strainPeaks.flashlight.length,
        ].some((v) => v === 0)
    ) {
        return null;
    }

    const sectionLength: number = 400;

    const currentSectionEnd: number =
        Math.ceil(
            calculator.beatmap.hitObjects.objects[0].startTime / sectionLength,
        ) * sectionLength;

    const strainInformations: {
        readonly time: number;
        readonly strain: number;
    }[] = new Array(
        Math.max(
            calculator.strainPeaks.aimWithSliders.length,
            calculator.strainPeaks.speed.length,
            calculator.strainPeaks.flashlight.length,
        ),
    );

    for (let i = 0; i < strainInformations.length; ++i) {
        const aimStrain: number = calculator.strainPeaks.aimWithSliders[i] ?? 0;
        const speedStrain: number = calculator.strainPeaks.speed[i] ?? 0;
        const flashlightStrain: number =
            calculator.strainPeaks.flashlight[i] ?? 0;

        strainInformations[i] = {
            time: (currentSectionEnd + sectionLength * i) / 1000,
            strain: calculator.mods.some((m) => m instanceof ModFlashlight)
                ? (aimStrain + speedStrain + flashlightStrain) / 3
                : (aimStrain + speedStrain) / 2,
        };
    }

    const maxTime: number =
        strainInformations.at(-1)!.time ??
        calculator.objects.at(-1)!.object.endTime / 1000;
    const maxStrain: number = Math.max(
        ...strainInformations.map((v) => {
            return v.strain;
        }),
        1,
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
            `https://assets.ppy.sh/beatmaps/${beatmapsetID}/covers/cover.jpg`,
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
        color,
    );

    return chart.getBuffer();
}
