import {
    BeatmapDecoder,
    ModDoubleTime,
    ModFlashlight,
    ModMap,
    ModNoFail,
} from "@rian8337/osu-base";
import { OsuDifficultyCalculator } from "../src";
import { readFileSync } from "fs";
import { join } from "path";

const calculator = new OsuDifficultyCalculator();

const testDiffCalc = (
    name: string,
    ratings: Readonly<{
        noMod: Readonly<{
            aim: number;
            speed: number;
            reading: number;
            total: number;
        }>;
        doubleTime: Readonly<{
            aim: number;
            speed: number;
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

        expect(noModAttributes.speedDifficulty).toBeCloseTo(
            ratings.noMod.speed,
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
        )} aim, ${noModAttributes.speedDifficulty.toFixed(2)} speed, 0.00 flashlight, ${noModAttributes.readingDifficulty.toFixed(2)} reading)`;

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

        expect(doubleTimeAttributes.speedDifficulty).toBeCloseTo(
            ratings.doubleTime.speed,
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
                aim: 2.6655429627881415,
                speed: 1.5558378312129728,
                reading: 0.6804000772219321,
                total: 4.5888049394889405,
            },
            doubleTime: {
                aim: 3.653487445264038,
                speed: 2.332542633766703,
                reading: 1.5041338408655736,
                total: 6.482076824683676,
            },
            flashlight: 1.5766361804020608,
        },
    );
});

describe("Test difficulty calculation sample beatmap 2", () => {
    testDiffCalc("Kenji Ninuma - DISCOPRINCE (peppy) [Normal]", {
        noMod: {
            aim: 1.4190670130483418,
            speed: 0.9192998820240483,
            reading: 0.5704105992919944,
            total: 2.4764584996026047,
        },
        doubleTime: {
            aim: 1.9232650460073197,
            speed: 1.3285713879007781,
            reading: 0.533617959409663,
            total: 3.400772697399644,
        },
        flashlight: 0.40181332763095984,
    });
});

describe("Test difficulty calculation sample beatmap 3", () => {
    testDiffCalc(
        "sphere - HIGH POWERED (TV Size) (Azunyan-) [POWER OVERLOAD EXPERT]",
        {
            noMod: {
                aim: 3.231892982238859,
                speed: 3.0168678195085143,
                reading: 1.1168957162597657,
                total: 6.392839903563847,
            },
            doubleTime: {
                aim: 4.481867722166033,
                speed: 4.563139915195542,
                reading: 2.017870316561915,
                total: 9.320270279067664,
            },
            flashlight: 1.826929496301562,
        },
    );
});

describe("Test difficulty calculation sample beatmap 4", () => {
    testDiffCalc("Ocelot - KAEDE (Hollow Wings) [EX EX]", {
        noMod: {
            aim: 5.006621635741502,
            speed: 1.4625906665260229,
            reading: 0.8633962387295139,
            total: 8.307893141838873,
        },
        doubleTime: {
            aim: 6.157880172787667,
            speed: 2.149936903867648,
            reading: 2.998908136626036,
            total: 10.547246735953834,
        },
        flashlight: 2.9220600698216836,
    });
});

describe("Test difficulty calculation sample beatmap 5", () => {
    testDiffCalc(
        "m1dlet - Tell Me Why Speedcore Is So Awesome (None1637) [DROID Ultimate PP CS32 x2]",
        {
            noMod: {
                aim: 39.203663503427286,
                speed: 9.631040597775122,
                reading: 18.900442500116856,
                total: 67.15149876845763,
            },
            doubleTime: {
                aim: 45.27074728689797,
                speed: 11.749047206807864,
                reading: 42.5148860918535,
                total: 90.27999729855884,
            },
            flashlight: 38.8798121476072,
        },
    );
});

describe("Test difficulty calculation sample beatmap 6", () => {
    testDiffCalc("negativeOD", {
        noMod: {
            aim: 0,
            speed: 0.0691669176702273,
            reading: 0,
            total: 0.11485819160265451,
        },
        doubleTime: {
            aim: 0,
            speed: 0.08471182768657518,
            reading: 0,
            total: 0.14057596880718465,
        },
        flashlight: 0,
    });
});

describe("Test difficulty calculation sample beatmap 7", () => {
    testDiffCalc("Camellia - crystallized (-ckopoctb-) [Emilia's C9H13NO3]", {
        noMod: {
            aim: 5.474066316438504,
            speed: 2.6687327865298576,
            reading: 1.4074990575249817,
            total: 9.316849627751857,
        },
        doubleTime: {
            aim: 6.6510488903298635,
            speed: 3.995028322900933,
            reading: 4.115759231202349,
            total: 12.165010934940593,
        },
        flashlight: 4.075576247071868,
    });
});
