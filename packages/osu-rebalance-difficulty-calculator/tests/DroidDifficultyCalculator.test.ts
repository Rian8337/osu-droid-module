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
                aim: 1.8715299640756766,
                tap: 1.4844528026911636,
                rhythm: 0.5515188197970847,
                reading: 0.07695011080513633,
                total: 3.5262824498868386,
            },
            doubleTime: {
                aim: 2.5373338491483928,
                tap: 2.2105799827253394,
                rhythm: 0.7025281672223836,
                reading: 1.220502215317136,
                total: 5.05637316655713,
            },
            flashlight: 1.4876939511397922,
        },
    );
});

describe("Test difficulty calculation sample beatmap 2", () => {
    testDiffCalc("Kenji Ninuma - DISCOPRINCE (peppy) [Normal]", {
        noMod: {
            aim: 0.9072091215477349,
            tap: 0.9062174990785213,
            rhythm: 0.5265188449053216,
            reading: 0,
            total: 1.857329805596871,
        },
        doubleTime: {
            aim: 1.2093514663586358,
            tap: 1.3224540822504838,
            rhythm: 0.7119226151592367,
            reading: 0,
            total: 2.6257044311204503,
        },
        flashlight: 0.3865585214547773,
    });
});

describe("Test difficulty calculation sample beatmap 3", () => {
    testDiffCalc(
        "sphere - HIGH POWERED (TV Size) (Azunyan-) [POWER OVERLOAD EXPERT]",
        {
            noMod: {
                aim: 2.1718618801403493,
                tap: 3.0592163340556846,
                rhythm: 0.9759452397034242,
                reading: 0.5689463434296888,
                total: 5.657183017584052,
            },
            doubleTime: {
                aim: 2.9649083539931143,
                tap: 4.388806631114691,
                rhythm: 1.1635304560352293,
                reading: 1.5129849051878843,
                total: 8.089467673252525,
            },
            flashlight: 1.7555884989600914,
        },
    );
});

describe("Test difficulty calculation sample beatmap 4", () => {
    testDiffCalc("Ocelot - KAEDE (Hollow Wings) [EX EX]", {
        noMod: {
            aim: 2.4646259291196584,
            tap: 1.4609073938742911,
            rhythm: 0.8880426334870366,
            reading: 0.2116746922113603,
            total: 4.35509897007513,
        },
        doubleTime: {
            aim: 3.299530574902253,
            tap: 2.1469868636598517,
            rhythm: 1.171851780179697,
            reading: 2.336874818880868,
            total: 6.396299362185382,
        },
        flashlight: 3.6252901628476533,
    });
});

describe("Test difficulty calculation sample beatmap 5", () => {
    testDiffCalc(
        "m1dlet - Tell Me Why Speedcore Is So Awesome (None1637) [DROID Ultimate PP CS32 x2]",
        {
            noMod: {
                aim: 10.767126260196578,
                tap: 6.103530241128051,
                rhythm: 0.7805023266359234,
                reading: 13.81734027737448,
                total: 26.68217284818592,
            },
            doubleTime: {
                aim: 12.20515647502543,
                tap: 8.621324464634275,
                rhythm: 0.8941621906254504,
                reading: 22.894311806768414,
                total: 40.90048908380549,
            },
            flashlight: 16.988413918534544,
        },
    );
});

describe("Test difficulty calculation sample beatmap 6", () => {
    testDiffCalc("negativeOD", {
        noMod: {
            aim: 0,
            tap: 0.0691669176702273,
            rhythm: 0,
            reading: 0,
            total: 0.11812294120240799,
        },
        doubleTime: {
            aim: 0,
            tap: 0.08471182768657518,
            rhythm: 0,
            reading: 0,
            total: 0.14457172506535307,
        },
        flashlight: 0,
    });
});

describe("Test difficulty calculation sample beatmap 7", () => {
    testDiffCalc("Camellia - crystallized (-ckopoctb-) [Emilia's C9H13NO3]", {
        noMod: {
            aim: 2.516391456826571,
            tap: 2.6477298460210603,
            rhythm: 0.9637354496718581,
            reading: 0.2728928326054576,
            total: 5.3972076195967285,
        },
        doubleTime: {
            aim: 3.502991634220339,
            tap: 3.9857978673063172,
            rhythm: 1.173830622055246,
            reading: 2.8994140331487106,
            total: 8.36233273299285,
        },
        flashlight: 3.0822150843000586,
    });
});
