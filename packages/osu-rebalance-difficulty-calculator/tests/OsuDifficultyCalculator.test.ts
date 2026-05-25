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
                aim: 2.5689872536692917,
                speed: 1.5650343060239142,
                reading: 0.6702350973356827,
                total: 4.483159625122342,
            },
            doubleTime: {
                aim: 3.569361269388201,
                speed: 2.3491617611521516,
                reading: 1.4409897712614064,
                total: 6.37340149975597,
            },
            flashlight: 1.5722400542344732,
        },
    );
});

describe("Test difficulty calculation sample beatmap 2", () => {
    testDiffCalc("Kenji Ninuma - DISCOPRINCE (peppy) [Normal]", {
        noMod: {
            aim: 1.3319101471227266,
            speed: 0.928124837622926,
            reading: 0.5701519561896039,
            total: 2.412473299872564,
        },
        doubleTime: {
            aim: 1.830692069431946,
            speed: 1.3341969647348997,
            reading: 0.5194550645756784,
            total: 3.3183117387198546,
        },
        flashlight: 0.40294315243317463,
    });
});

describe("Test difficulty calculation sample beatmap 3", () => {
    testDiffCalc(
        "sphere - HIGH POWERED (TV Size) (Azunyan-) [POWER OVERLOAD EXPERT]",
        {
            noMod: {
                aim: 3.200421505952102,
                speed: 3.040644949386902,
                reading: 1.1146534306276505,
                total: 6.383343009145884,
            },
            doubleTime: {
                aim: 4.4671486363646435,
                speed: 4.5937671362271235,
                reading: 1.9402397911003972,
                total: 9.300332456954033,
            },
            flashlight: 1.8218354786297233,
        },
    );
});

describe("Test difficulty calculation sample beatmap 4", () => {
    testDiffCalc("Ocelot - KAEDE (Hollow Wings) [EX EX]", {
        noMod: {
            aim: 4.772519573539153,
            speed: 1.4344004281432805,
            reading: 0.8565696748812119,
            total: 7.920518805969656,
        },
        doubleTime: {
            aim: 5.988083538375544,
            speed: 2.100325253798781,
            reading: 2.922859715899272,
            total: 10.230945327745713,
        },
        flashlight: 2.8932705985641896,
    });
});

describe("Test difficulty calculation sample beatmap 5", () => {
    testDiffCalc(
        "m1dlet - Tell Me Why Speedcore Is So Awesome (None1637) [DROID Ultimate PP CS32 x2]",
        {
            noMod: {
                aim: 41.10036107861498,
                speed: 9.399846680595523,
                reading: 10.37986271865157,
                total: 68.12877529080409,
            },
            doubleTime: {
                aim: 47.49008349358262,
                speed: 11.410750203861472,
                reading: 24.063884300123828,
                total: 80.91673257603793,
            },
            flashlight: 38.49675046934792,
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
            aim: 5.250396829330823,
            speed: 2.623024402978355,
            reading: 1.362267402352303,
            total: 8.94053008250001,
        },
        doubleTime: {
            aim: 6.593398661714693,
            speed: 3.927855375324828,
            reading: 3.927511736058231,
            total: 11.935883522812809,
        },
        flashlight: 4.035421807252305,
    });
});
