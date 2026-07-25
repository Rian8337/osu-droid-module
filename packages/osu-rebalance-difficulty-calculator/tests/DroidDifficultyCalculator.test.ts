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
                aim: 1.892396885004713,
                tap: 1.523197220169645,
                rhythm: 0.7648930259509951,
                reading: 0.0801694219632239,
                total: 3.640819699109652,
            },
            doubleTime: {
                aim: 2.540869079244984,
                tap: 2.2866608785305176,
                rhythm: 1.0186082465714876,
                reading: 1.1748089945535194,
                total: 5.164584654188667,
            },
            flashlight: 0.8073829372170443,
        },
    );
});

describe("Test difficulty calculation sample beatmap 2", () => {
    testDiffCalc("Kenji Ninuma - DISCOPRINCE (peppy) [Normal]", {
        noMod: {
            aim: 0.8802800266264081,
            tap: 0.9143348593854751,
            rhythm: 0.51446861377641,
            reading: 0,
            total: 1.8887280503958481,
        },
        doubleTime: {
            aim: 1.1694862806841304,
            tap: 1.3287590185169131,
            rhythm: 0.7033778674402899,
            reading: 0,
            total: 2.6403912272117793,
        },
        flashlight: 0.22358412263778715,
    });
});

describe("Test difficulty calculation sample beatmap 3", () => {
    testDiffCalc(
        "sphere - HIGH POWERED (TV Size) (Azunyan-) [POWER OVERLOAD EXPERT]",
        {
            noMod: {
                aim: 2.178443748086503,
                tap: 3.125634383128691,
                rhythm: 1.0546345194593594,
                reading: 0.5738700056952152,
                total: 5.781665117357153,
            },
            doubleTime: {
                aim: 2.956285566861552,
                tap: 4.464959357172511,
                rhythm: 1.273468835320142,
                reading: 1.4596168862660335,
                total: 8.208869163261364,
            },
            flashlight: 0.9099003657206869,
        },
    );
});

describe("Test difficulty calculation sample beatmap 4", () => {
    testDiffCalc("Ocelot - KAEDE (Hollow Wings) [EX EX]", {
        noMod: {
            aim: 2.5343260273167103,
            tap: 1.356328606593966,
            rhythm: 0.6341246500251077,
            reading: 0.21875988701529403,
            total: 4.481969788313377,
        },
        doubleTime: {
            aim: 3.3469176248284023,
            tap: 1.9698517854660764,
            rhythm: 0.8527918655249367,
            reading: 2.246397329905675,
            total: 6.377631615679052,
        },
        flashlight: 1.6763999920857215,
    });
});

describe("Test difficulty calculation sample beatmap 5", () => {
    testDiffCalc(
        "m1dlet - Tell Me Why Speedcore Is So Awesome (None1637) [DROID Ultimate PP CS32 x2]",
        {
            noMod: {
                aim: 22.638519380664086,
                tap: 6.815477850075668,
                rhythm: 1.970157660146092,
                reading: 7.312210999910238,
                total: 39.10401396167931,
            },
            doubleTime: {
                aim: 26.309520159268583,
                tap: 9.590277444447102,
                rhythm: 2.1655754384925676,
                reading: 12.89238230530667,
                total: 46.57101555521465,
            },
            flashlight: 7.263081776209047,
        },
    );
});

describe("Test difficulty calculation sample beatmap 6", () => {
    testDiffCalc("negativeOD", {
        noMod: {
            aim: 0,
            tap: 0.0726997248963158,
            rhythm: 0,
            reading: 0,
            total: 0.12398238685404692,
        },
        doubleTime: {
            aim: 0,
            tap: 0.08903861521834222,
            rhythm: 0,
            reading: 0,
            total: 0.15184679244238197,
        },
        flashlight: 0,
    });
});

describe("Test difficulty calculation sample beatmap 7", () => {
    testDiffCalc("Camellia - crystallized (-ckopoctb-) [Emilia's C9H13NO3]", {
        noMod: {
            aim: 2.6044967410184277,
            tap: 2.630905446448467,
            rhythm: 1.146111495813188,
            reading: 0.2825371457099409,
            total: 5.5083764805784545,
        },
        doubleTime: {
            aim: 3.667705143986748,
            tap: 3.9607136622628496,
            rhythm: 1.4443327102626575,
            reading: 2.7582210649479144,
            total: 8.431754540200908,
        },
        flashlight: 1.5780232019042453,
    });
});
