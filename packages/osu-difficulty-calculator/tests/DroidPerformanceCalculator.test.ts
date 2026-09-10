import { Accuracy, BeatmapDecoder } from "@rian8337/osu-base";
import { readFileSync } from "fs";
import { join } from "path";
import { DroidDifficultyCalculator, DroidPerformanceCalculator } from "../src";

const calculator = new DroidDifficultyCalculator();
const beatmapPath = join(process.cwd(), "tests", "files", "beatmaps");

test("Test performance calculation with no successful hits does not return NaN", () => {
    const data = readFileSync(
        join(beatmapPath, "Kenji Ninuma - DISCOPRINCE (peppy) [Normal].osu"),
        { encoding: "utf-8" },
    );

    const beatmap = new BeatmapDecoder().decode(data).result;
    const timedAttributes = calculator.calculateTimed(beatmap);

    for (const entry of timedAttributes) {
        const performance = new DroidPerformanceCalculator(entry.attributes).calculate({
            combo: 0,
            accPercent: new Accuracy({ n300: 0, n100: 0, n50: 0, nmiss: 0 }),
            sliderEndsDropped: 0,
            sliderTicksMissed: 0,
        });

        expect(performance.total).not.toBeNaN();
        expect(performance.tap).not.toBeNaN();
        expect(performance.total).toBe(0);
    }
});
