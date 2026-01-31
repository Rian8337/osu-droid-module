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
                aim: 1.7481175850714206,
                tap: 1.3795225945259129,
                rhythm: 0.39371704156755577,
                reading: 0.051455046973281064,
                total: 3.283548612587232,
            },
            doubleTime: {
                aim: 2.2591977618186045,
                tap: 2.0469108529290376,
                rhythm: 0.5168195439569531,
                reading: 1.215478354434324,
                total: 4.597035394247302,
            },
            flashlight: 1.4876939511397922,
        },
    );
});

describe("Test difficulty calculation sample beatmap 2", () => {
    testDiffCalc("Kenji Ninuma - DISCOPRINCE (peppy) [Normal]", {
        noMod: {
            aim: 0.9140793497014832,
            tap: 0.851082697022819,
            rhythm: 0.3724493359640691,
            reading: 0,
            total: 1.8051154239443443,
        },
        doubleTime: {
            aim: 1.1612476757943326,
            tap: 1.2361402889429618,
            rhythm: 0.5283133386549904,
            reading: 0,
            total: 2.4792405154635815,
        },
        flashlight: 0.3865585214547773,
    });
});

describe("Test difficulty calculation sample beatmap 3", () => {
    testDiffCalc(
        "sphere - HIGH POWERED (TV Size) (Azunyan-) [POWER OVERLOAD EXPERT]",
        {
            noMod: {
                aim: 2.0156106445425777,
                tap: 2.90253408929693,
                rhythm: 0.7382560324923976,
                reading: 0.5055136154758123,
                total: 5.33756253905226,
            },
            doubleTime: {
                aim: 2.632751491633747,
                tap: 4.1610998823298,
                rhythm: 0.8968796094207413,
                reading: 1.508217474784236,
                total: 7.583517523028303,
            },
            flashlight: 1.7555884989600914,
        },
    );
});

describe("Test difficulty calculation sample beatmap 4", () => {
    testDiffCalc("Ocelot - KAEDE (Hollow Wings) [EX EX]", {
        noMod: {
            aim: 2.2707489851769282,
            tap: 1.2957323540949206,
            rhythm: 0.5091982200698142,
            reading: 0.21871244836320172,
            total: 3.9832542519063874,
        },
        doubleTime: {
            aim: 2.9611293802133978,
            tap: 1.8888174768919697,
            rhythm: 0.6835825526201235,
            reading: 2.3355397688290496,
            total: 5.868250669331294,
        },
        flashlight: 3.6252901628476533,
    });
});

describe("Test difficulty calculation sample beatmap 5", () => {
    testDiffCalc(
        "m1dlet - Tell Me Why Speedcore Is So Awesome (None1637) [DROID Ultimate PP CS32 x2]",
        {
            noMod: {
                aim: 161.67573157125864,
                tap: 5.743785781590784,
                rhythm: 0.5051573177209973,
                reading: 83.08707130587017,
                total: 285.95503809790455,
            },
            doubleTime: {
                aim: 184.55200590144355,
                tap: 8.11301528630909,
                rhythm: 0.5898304012855785,
                reading: 485.43526451524326,
                total: 838.2003995932197,
            },
            flashlight: 10690.031709655059,
        },
    );
});

describe("Test difficulty calculation sample beatmap 6", () => {
    testDiffCalc("negativeOD", {
        noMod: {
            aim: 0.0003375259166051087,
            tap: 0.06509464263670245,
            rhythm: 0,
            reading: 0,
            total: 0.1112027751910281,
        },
        doubleTime: {
            aim: 0.0004067885647592128,
            tap: 0.0797243297243696,
            rhythm: 0,
            reading: 0,
            total: 0.1360815596047001,
        },
        flashlight: 0,
    });
});

describe("Test difficulty calculation sample beatmap 7", () => {
    testDiffCalc("Camellia - crystallized (-ckopoctb-) [Emilia's C9H13NO3]", {
        noMod: {
            aim: 2.3067327433615734,
            tap: 2.5013096758132067,
            rhythm: 0.8122391748915385,
            reading: 0.20578398560542652,
            total: 5.028330215878978,
        },
        doubleTime: {
            aim: 3.0517907246908553,
            tap: 3.7527532315028784,
            rhythm: 0.978777380174301,
            reading: 2.896088084630879,
            total: 7.786695143004745,
        },
        flashlight: 3.0822150843000586,
    });
});
