import {
    BeatmapDecoder,
    ModAutopilot,
    ModDoubleTime,
    ModFlashlight,
    ModMap,
    ModNoFail,
    ModRelax,
} from "@rian8337/osu-base";
import { DroidDifficultyCalculator } from "../src";
import { readFileSync } from "fs";
import { join } from "path";

const calculator = new DroidDifficultyCalculator();

const testDiffCalc = (
    name: string,
    ratings: Readonly<{
        noMod: Readonly<{
            aim: number;
            tap: number;
            rhythm: number;
            reading: number;
            total: number;
        }>;
        doubleTime: Readonly<{
            aim: number;
            tap: number;
            rhythm: number;
            reading: number;
            total: number;
        }>;
        flashlight: number;
    }>,
) => {
    const data = readFileSync(
        join(process.cwd(), "tests", "files", "beatmaps", `${name}.osu`),
        { encoding: "utf-8" },
    );

    const beatmap = new BeatmapDecoder().decode(data).result;

    test("No mod difficulty", () => {
        const noModAttributes = calculator.calculate(beatmap);

        expect(noModAttributes.aimDifficulty).toBeCloseTo(ratings.noMod.aim, 5);
        expect(noModAttributes.tapDifficulty).toBeCloseTo(ratings.noMod.tap, 5);

        expect(noModAttributes.rhythmDifficulty).toBeCloseTo(
            ratings.noMod.rhythm,
            5,
        );

        expect(noModAttributes.flashlightDifficulty).toBe(0);

        expect(noModAttributes.readingDifficulty).toBeCloseTo(
            ratings.noMod.reading,
            5,
        );

        expect(noModAttributes.starRating).toBeCloseTo(ratings.noMod.total, 6);

        const str = `${noModAttributes.starRating.toFixed(
            2,
        )} stars (${noModAttributes.aimDifficulty.toFixed(
            2,
        )} aim, ${noModAttributes.tapDifficulty.toFixed(
            2,
        )} tap, ${noModAttributes.rhythmDifficulty.toFixed(
            2,
        )} rhythm, ${noModAttributes.flashlightDifficulty.toFixed(
            2,
        )} flashlight, ${noModAttributes.readingDifficulty.toFixed(2)} reading)`;

        expect(noModAttributes.toString()).toBe(str);
    });

    test("Double Time difficulty", () => {
        const mods = new ModMap();
        mods.set(new ModDoubleTime());

        const doubleTimeAttributes = calculator.calculate(beatmap, mods);

        expect(doubleTimeAttributes.aimDifficulty).toBeCloseTo(
            ratings.doubleTime.aim,
            5,
        );

        expect(doubleTimeAttributes.tapDifficulty).toBeCloseTo(
            ratings.doubleTime.tap,
            5,
        );

        expect(doubleTimeAttributes.rhythmDifficulty).toBeCloseTo(
            ratings.doubleTime.rhythm,
            5,
        );

        expect(doubleTimeAttributes.flashlightDifficulty).toBe(0);

        expect(doubleTimeAttributes.readingDifficulty).toBeCloseTo(
            ratings.doubleTime.reading,
            5,
        );

        expect(doubleTimeAttributes.starRating).toBeCloseTo(
            ratings.doubleTime.total,
            6,
        );
    });

    test("Autopilot aim difficulty calculation", () => {
        const mods = new ModMap();
        mods.set(new ModAutopilot());

        const autopilotAttributes = calculator.calculate(beatmap, mods);

        expect(autopilotAttributes.aimDifficulty).toBe(0);
    });

    test("Relax tap and rhythm difficulty calculation", () => {
        const mods = new ModMap();
        mods.set(new ModRelax());

        const relaxAttributes = calculator.calculate(beatmap, mods);

        expect(relaxAttributes.tapDifficulty).toBe(0);
        expect(relaxAttributes.rhythmDifficulty).toBe(0);
    });

    test("Flashlight difficulty calculation", () => {
        const mods = new ModMap();
        mods.set(new ModFlashlight());

        const flashlightAttributes = calculator.calculate(beatmap, mods);

        expect(flashlightAttributes.flashlightDifficulty).toBeCloseTo(
            ratings.flashlight,
            5,
        );
    });
};

test("Test difficulty adjustment mod retention", () => {
    const retainedMods = calculator.retainDifficultyAdjustmentMods([
        new ModDoubleTime(),
        new ModFlashlight(),
        new ModNoFail(),
    ]);

    expect(retainedMods.length).toBe(2);
    expect(retainedMods[0]).toBeInstanceOf(ModDoubleTime);
    expect(retainedMods[1]).toBeInstanceOf(ModFlashlight);
});

describe("Test difficulty calculation sample beatmap 1", () => {
    testDiffCalc(
        "YOASOBI - Love Letter (ohm002) [Please accept my overflowing emotions.]",
        {
            noMod: {
                aim: 1.9352824715365609,
                tap: 1.4985237599390262,
                rhythm: 0.43242996192307537,
                reading: 0.051455046973281064,
                total: 3.6202908545724517,
            },
            doubleTime: {
                aim: 2.4898776086638144,
                tap: 2.2315338159314306,
                rhythm: 0.553882512868791,
                reading: 1.215478354434324,
                total: 5.019754334436419,
            },
            flashlight: 1.4876939511397922,
        },
    );
});

describe("Test difficulty calculation sample beatmap 2", () => {
    testDiffCalc("Kenji Ninuma - DISCOPRINCE (peppy) [Normal]", {
        noMod: {
            aim: 0.951497117270979,
            tap: 0.9148074304415672,
            rhythm: 0.39757811017327904,
            reading: 0,
            total: 1.9117023097768142,
        },
        doubleTime: {
            aim: 1.1680786206057963,
            tap: 1.3349894722742495,
            rhythm: 0.5342835557032508,
            reading: 0,
            total: 2.605243595581198,
        },
        flashlight: 0.3865585214547773,
    });
});

describe("Test difficulty calculation sample beatmap 3", () => {
    testDiffCalc(
        "sphere - HIGH POWERED (TV Size) (Azunyan-) [POWER OVERLOAD EXPERT]",
        {
            noMod: {
                aim: 2.263625523599051,
                tap: 3.0882142935532335,
                rhythm: 0.7627751603907077,
                reading: 0.5055136154758123,
                total: 5.754712988450507,
            },
            doubleTime: {
                aim: 2.9533454123505387,
                tap: 4.430407623994755,
                rhythm: 0.9166509368118807,
                reading: 1.508217474784236,
                total: 8.14197633561081,
            },
            flashlight: 1.7555884989600914,
        },
    );
});

describe("Test difficulty calculation sample beatmap 4", () => {
    testDiffCalc("Ocelot - KAEDE (Hollow Wings) [EX EX]", {
        noMod: {
            aim: 2.7725354517885132,
            tap: 1.4747551669021883,
            rhythm: 0.6883247873597379,
            reading: 0.21871244836320172,
            total: 4.8378637604922465,
        },
        doubleTime: {
            aim: 3.5423599095898317,
            tap: 2.1673379050102484,
            rhythm: 0.9095002145746335,
            reading: 2.3355397688290496,
            total: 6.715575410394336,
        },
        flashlight: 3.6252901628476533,
    });
});

describe("Test difficulty calculation sample beatmap 5", () => {
    testDiffCalc(
        "m1dlet - Tell Me Why Speedcore Is So Awesome (None1637) [DROID Ultimate PP CS32 x2]",
        {
            noMod: {
                aim: 11.07512546133617,
                tap: 6.161384901733126,
                rhythm: 0.6193387884052116,
                reading: 12.657017564613346,
                total: 25.519148267196176,
            },
            doubleTime: {
                aim: 12.455702484884322,
                tap: 8.70304500687171,
                rhythm: 0.712413163663777,
                reading: 22.15536004936554,
                total: 39.88748554718369,
            },
            flashlight: 16.988413918534544,
        },
    );
});

describe("Test difficulty calculation sample beatmap 6", () => {
    testDiffCalc("negativeOD", {
        noMod: {
            aim: 0.0007243385031477508,
            tap: 0.06982254292132306,
            rhythm: 0,
            reading: 0,
            total: 0.11923750429553022,
        },
        doubleTime: {
            aim: 0.0008994417437532236,
            tap: 0.08551480135040954,
            rhythm: 0,
            reading: 0,
            total: 0.14593889277551367,
        },
        flashlight: 0,
    });
});

describe("Test difficulty calculation sample beatmap 7", () => {
    testDiffCalc("Camellia - crystallized (-ckopoctb-) [Emilia's C9H13NO3]", {
        noMod: {
            aim: 2.6115003683312525,
            tap: 2.6728273724629346,
            rhythm: 0.7696326470309711,
            reading: 0.20578398560542652,
            total: 5.519277655802167,
        },
        doubleTime: {
            aim: 3.4651591010067366,
            tap: 4.02357878650282,
            rhythm: 0.9473855437765667,
            reading: 2.896088084630879,
            total: 8.372206785517523,
        },
        flashlight: 3.0822150843000586,
    });
});
