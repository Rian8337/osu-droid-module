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
                aim: 1.8669020406831642,
                tap: 1.4861690081466008,
                rhythm: 0.5515188197970847,
                reading: 0.07999642874026465,
                total: 3.578930091576813,
            },
            doubleTime: {
                aim: 2.505053566055686,
                tap: 2.2141035566243876,
                rhythm: 0.7025281672223836,
                reading: 1.174717837329988,
                total: 5.0594799959426675,
            },
            flashlight: 1.4876939511397922,
        },
    );
});

describe("Test difficulty calculation sample beatmap 2", () => {
    testDiffCalc("Kenji Ninuma - DISCOPRINCE (peppy) [Normal]", {
        noMod: {
            aim: 0.9042809501142259,
            tap: 0.9150804416694979,
            rhythm: 0.5265188449053216,
            reading: 0,
            total: 1.9140576373445741,
        },
        doubleTime: {
            aim: 1.1903228642058694,
            tap: 1.3374710324874384,
            rhythm: 0.7119226151592367,
            reading: 0,
            total: 2.669573713951402,
        },
        flashlight: 0.3865585214547773,
    });
});

describe("Test difficulty calculation sample beatmap 3", () => {
    testDiffCalc(
        "sphere - HIGH POWERED (TV Size) (Azunyan-) [POWER OVERLOAD EXPERT]",
        {
            noMod: {
                aim: 2.156442852088755,
                tap: 3.107495964185826,
                rhythm: 0.9759452397034242,
                reading: 0.5733430435788995,
                total: 5.742445109626275,
            },
            doubleTime: {
                aim: 2.9233411711934054,
                tap: 4.439212961020259,
                rhythm: 1.1635304560352293,
                reading: 1.4588236270044783,
                total: 8.153585561729152,
            },
            flashlight: 1.7555884989600914,
        },
    );
});

describe("Test difficulty calculation sample beatmap 4", () => {
    testDiffCalc("Ocelot - KAEDE (Hollow Wings) [EX EX]", {
        noMod: {
            aim: 2.528421644156041,
            tap: 1.4622090118933708,
            rhythm: 0.8880426334870366,
            reading: 0.21873693147590892,
            total: 4.515540335896217,
        },
        doubleTime: {
            aim: 3.336615977202467,
            tap: 2.1479463107534054,
            rhythm: 1.171851780179697,
            reading: 2.2460095544032,
            total: 6.440196972439005,
        },
        flashlight: 3.6252901628476533,
    });
});

describe("Test difficulty calculation sample beatmap 5", () => {
    testDiffCalc(
        "m1dlet - Tell Me Why Speedcore Is So Awesome (None1637) [DROID Ultimate PP CS32 x2]",
        {
            noMod: {
                aim: 11.530200863936924,
                tap: 6.067918864797471,
                rhythm: 0.7805023266359234,
                reading: 7.312139878916539,
                total: 21.50032983481538,
            },
            doubleTime: {
                aim: 13.268923568089784,
                tap: 8.55647618227254,
                rhythm: 0.8941621906254504,
                reading: 12.892187211912498,
                total: 28.514058017053113,
            },
            flashlight: 16.988413918534544,
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
            aim: 2.52815504120817,
            tap: 2.629161749803558,
            rhythm: 0.9637354496718581,
            reading: 0.28253706524858635,
            total: 5.428479458485021,
        },
        doubleTime: {
            aim: 3.549916890505705,
            tap: 3.9547748212631593,
            rhythm: 1.173830622055246,
            reading: 2.7581018025311494,
            total: 8.326744381669283,
        },
        flashlight: 3.0822150843000586,
    });
});
