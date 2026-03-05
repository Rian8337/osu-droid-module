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
                aim: 2.5824632309996494,
                speed: 1.5705854389293772,
                reading: 0.6804000772219321,
                total: 4.4738019878848325,
            },
            doubleTime: {
                aim: 3.560211711871645,
                speed: 2.3546525369034317,
                reading: 1.5041338408655736,
                total: 6.364568925209209,
            },
            flashlight: 1.5766361804020608,
        },
    );
});

describe("Test difficulty calculation sample beatmap 2", () => {
    testDiffCalc("Kenji Ninuma - DISCOPRINCE (peppy) [Normal]", {
        noMod: {
            aim: 1.3545995981859618,
            speed: 0.9280138197891796,
            reading: 0.5704105992919944,
            total: 2.394382004806121,
        },
        doubleTime: {
            aim: 1.7963122551424109,
            speed: 1.341164763160667,
            reading: 0.533617959409663,
            total: 3.239992047580693,
        },
        flashlight: 0.40181332763095984,
    });
});

describe("Test difficulty calculation sample beatmap 3", () => {
    testDiffCalc(
        "sphere - HIGH POWERED (TV Size) (Azunyan-) [POWER OVERLOAD EXPERT]",
        {
            noMod: {
                aim: 3.077517521944219,
                speed: 3.045464362311217,
                reading: 1.1168957162597657,
                total: 6.258990843608936,
            },
            doubleTime: {
                aim: 4.25133831038391,
                speed: 4.606393393208672,
                reading: 2.017870316561915,
                total: 9.149978688538601,
            },
            flashlight: 1.826929496301562,
        },
    );
});

describe("Test difficulty calculation sample beatmap 4", () => {
    testDiffCalc("Ocelot - KAEDE (Hollow Wings) [EX EX]", {
        noMod: {
            aim: 5.047636668737227,
            speed: 1.476454395101631,
            reading: 0.8633962387295139,
            total: 8.376660252936064,
        },
        doubleTime: {
            aim: 6.16642935319632,
            speed: 2.1703159083096093,
            reading: 2.998908136626036,
            total: 10.563184197077032,
        },
        flashlight: 2.9220600698216836,
    });
});

describe("Test difficulty calculation sample beatmap 5", () => {
    testDiffCalc(
        "m1dlet - Tell Me Why Speedcore Is So Awesome (None1637) [DROID Ultimate PP CS32 x2]",
        {
            noMod: {
                aim: 35.729260685783295,
                speed: 9.722332123014603,
                reading: 18.900442500116856,
                total: 61.78885951559006,
            },
            doubleTime: {
                aim: 41.48087656429544,
                speed: 11.860415072899931,
                reading: 42.5148860918535,
                total: 86.3025304327886,
            },
            flashlight: 38.8798121476072,
        },
    );
});

describe("Test difficulty calculation sample beatmap 6", () => {
    testDiffCalc("negativeOD", {
        noMod: {
            aim: 0.00022306571905439645,
            speed: 0.06982254292132306,
            reading: 0,
            total: 0.11594194976173826,
        },
        doubleTime: {
            aim: 0.00028294859351353177,
            speed: 0.08551480135040954,
            reading: 0,
            total: 0.1419053499520167,
        },
        flashlight: 0,
    });
});

describe("Test difficulty calculation sample beatmap 7", () => {
    testDiffCalc("Camellia - crystallized (-ckopoctb-) [Emilia's C9H13NO3]", {
        noMod: {
            aim: 5.401414693709097,
            speed: 2.694029397427256,
            reading: 1.4074990575249817,
            total: 9.211998674585956,
        },
        doubleTime: {
            aim: 6.470293488556011,
            speed: 4.032896736523532,
            reading: 4.115759231202349,
            total: 11.944621914000583,
        },
        flashlight: 4.075576247071868,
    });
});
