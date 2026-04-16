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
                aim: 2.6114725850996474,
                speed: 1.5594303200510715,
                reading: 0.6705964087940639,
                total: 4.542316301917326,
            },
            doubleTime: {
                aim: 3.6064672638067568,
                speed: 2.337673672371777,
                reading: 1.4772685355001338,
                total: 6.424810826522821,
            },
            flashlight: 1.5766361804020608,
        },
    );
});

describe("Test difficulty calculation sample beatmap 2", () => {
    testDiffCalc("Kenji Ninuma - DISCOPRINCE (peppy) [Normal]", {
        noMod: {
            aim: 1.3736195826045985,
            speed: 0.9290863290257275,
            reading: 0.5704105992919944,
            total: 2.468934237154349,
        },
        doubleTime: {
            aim: 1.8743235435039352,
            speed: 1.3436134272768423,
            reading: 0.533617959409663,
            total: 3.383402432141701,
        },
        flashlight: 0.40181332763095984,
    });
});

describe("Test difficulty calculation sample beatmap 3", () => {
    testDiffCalc(
        "sphere - HIGH POWERED (TV Size) (Azunyan-) [POWER OVERLOAD EXPERT]",
        {
            noMod: {
                aim: 3.2091026434760734,
                speed: 3.0594757299311444,
                reading: 1.1144274808831478,
                total: 6.410381540095467,
            },
            doubleTime: {
                aim: 4.479899204298769,
                speed: 4.621840264530277,
                reading: 1.9881301028600875,
                total: 9.348400310182821,
            },
            flashlight: 1.826929496301562,
        },
    );
});

describe("Test difficulty calculation sample beatmap 4", () => {
    testDiffCalc("Ocelot - KAEDE (Hollow Wings) [EX EX]", {
        noMod: {
            aim: 4.837440853571309,
            speed: 1.4636175043551052,
            reading: 0.8560009989150408,
            total: 8.028886996754835,
        },
        doubleTime: {
            aim: 6.06116548516089,
            speed: 2.150435802695784,
            reading: 2.971914185119748,
            total: 10.363111201335965,
        },
        flashlight: 2.9220600698216836,
    });
});

describe("Test difficulty calculation sample beatmap 5", () => {
    testDiffCalc(
        "m1dlet - Tell Me Why Speedcore Is So Awesome (None1637) [DROID Ultimate PP CS32 x2]",
        {
            noMod: {
                aim: 41.056551731235686,
                speed: 9.325775471086825,
                reading: 18.9001841876879,
                total: 69.3727051956009,
            },
            doubleTime: {
                aim: 47.52989705017005,
                speed: 11.385125029348524,
                reading: 42.51208639693599,
                total: 92.03765005175751,
            },
            flashlight: 38.8798121476072,
        },
    );
});

describe("Test difficulty calculation sample beatmap 6", () => {
    testDiffCalc("negativeOD", {
        noMod: {
            aim: 0,
            speed: 0.0726997248963158,
            reading: 0,
            total: 0.11984652300612499,
        },
        doubleTime: {
            aim: 0,
            speed: 0.08903861521834222,
            reading: 0,
            total: 0.1467814144058657,
        },
        flashlight: 0,
    });
});

describe("Test difficulty calculation sample beatmap 7", () => {
    testDiffCalc("Camellia - crystallized (-ckopoctb-) [Emilia's C9H13NO3]", {
        noMod: {
            aim: 5.270193420336883,
            speed: 2.649323006275907,
            reading: 1.3617170625915516,
            total: 8.978973514924276,
        },
        doubleTime: {
            aim: 6.594935216106845,
            speed: 3.962385339790621,
            reading: 3.994017812978627,
            total: 11.979209485664372,
        },
        flashlight: 4.075576247071868,
    });
});
