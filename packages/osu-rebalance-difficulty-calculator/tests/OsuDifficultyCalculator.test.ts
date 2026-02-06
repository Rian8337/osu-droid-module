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
                aim: 2.6605032569714453,
                speed: 1.5507279473681441,
                reading: 0.6804000772219321,
                total: 4.579107972693239,
            },
            doubleTime: {
                aim: 3.6861421272422077,
                speed: 2.3278266010410165,
                reading: 1.5047628343996413,
                total: 6.52554260333155,
            },
            flashlight: 1.5766361804020608,
        },
    );
});

describe("Test difficulty calculation sample beatmap 2", () => {
    testDiffCalc("Kenji Ninuma - DISCOPRINCE (peppy) [Normal]", {
        noMod: {
            aim: 1.4446486196152482,
            speed: 0.9167973609823578,
            reading: 0.5704105992919944,
            total: 2.510439437250874,
        },
        doubleTime: {
            aim: 1.9631975825001295,
            speed: 1.3288830736102792,
            reading: 0.533816009210783,
            total: 3.4557535392476244,
        },
        flashlight: 0.40181332763095984,
    });
});

describe("Test difficulty calculation sample beatmap 3", () => {
    testDiffCalc(
        "sphere - HIGH POWERED (TV Size) (Azunyan-) [POWER OVERLOAD EXPERT]",
        {
            noMod: {
                aim: 3.1738903168680768,
                speed: 3.01939003427114,
                reading: 1.1168957162597657,
                total: 6.333118007986633,
            },
            doubleTime: {
                aim: 4.494709470350447,
                speed: 4.567508673868043,
                reading: 2.018714142654528,
                total: 9.337421411325511,
            },
            flashlight: 1.826929496301562,
        },
    );
});

describe("Test difficulty calculation sample beatmap 4", () => {
    testDiffCalc("Ocelot - KAEDE (Hollow Wings) [EX EX]", {
        noMod: {
            aim: 4.7755504185405595,
            speed: 1.4629570255618676,
            reading: 0.8633962387295139,
            total: 7.9285939697688645,
        },
        doubleTime: {
            aim: 6.318928800353123,
            speed: 2.152411486535928,
            reading: 3.0002809693326076,
            total: 10.796005119183677,
        },
        flashlight: 2.9220600698216836,
    });
});

describe("Test difficulty calculation sample beatmap 5", () => {
    testDiffCalc(
        "m1dlet - Tell Me Why Speedcore Is So Awesome (None1637) [DROID Ultimate PP CS32 x2]",
        {
            noMod: {
                aim: 23.408212524871427,
                speed: 9.561668778634884,
                reading: 11.996247345640619,
                total: 40.73215932116298,
            },
            doubleTime: {
                aim: 26.851833698771802,
                speed: 11.664823555193516,
                reading: 18.069275693334628,
                total: 48.71643046803441,
            },
            flashlight: 103.34120127714696,
        },
    );
});

describe("Test difficulty calculation sample beatmap 6", () => {
    testDiffCalc("negativeOD", {
        noMod: {
            aim: 0.00022875875787401747,
            speed: 0.06867109107914335,
            reading: 0,
            total: 0.11403865513672035,
        },
        doubleTime: {
            aim: 0.0002807140750258713,
            speed: 0.08410456661204553,
            reading: 0,
            total: 0.13957064949346734,
        },
        flashlight: 0,
    });
});

describe("Test difficulty calculation sample beatmap 7", () => {
    testDiffCalc("Camellia - crystallized (-ckopoctb-) [Emilia's C9H13NO3]", {
        noMod: {
            aim: 6.585048339668194,
            speed: 2.664221517932985,
            reading: 1.4074990575249817,
            total: 11.073067975961765,
        },
        doubleTime: {
            aim: 7.726322134850559,
            speed: 3.9905380385331943,
            reading: 4.117643333224669,
            total: 13.65111071555709,
        },
        flashlight: 4.075576247071868,
    });
});
