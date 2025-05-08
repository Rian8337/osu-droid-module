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
            visual: number;
            total: number;
        }>;
        doubleTime: Readonly<{
            aim: number;
            tap: number;
            rhythm: number;
            visual: number;
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

        expect(noModAttributes.visualDifficulty).toBeCloseTo(
            ratings.noMod.visual,
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
        )} flashlight, ${noModAttributes.visualDifficulty.toFixed(2)} visual)`;

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

        expect(doubleTimeAttributes.visualDifficulty).toBeCloseTo(
            ratings.doubleTime.visual,
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
    expect(
        calculator.retainDifficultyAdjustmentMods([
            new ModDoubleTime(),
            new ModFlashlight(),
            new ModNoFail(),
        ]),
    ).toEqual([new ModDoubleTime(), new ModFlashlight()]);
});

describe("Test difficulty calculation sample beatmap 1", () => {
    testDiffCalc(
        "YOASOBI - Love Letter (ohm002) [Please accept my overflowing emotions.]",
        {
            noMod: {
                aim: 2.4533882247503285,
                tap: 1.4928164438079188,
                rhythm: 0.8031331688998974,
                visual: 0.8056919696481293,
                total: 3.9739193596109117,
            },
            doubleTime: {
                aim: 3.352664048745984,
                tap: 2.174771069380805,
                rhythm: 0.9518967299370099,
                visual: 0.9321730649994123,
                total: 5.085332475166924,
            },
            flashlight: 1.490578314794079,
        },
    );
});

describe("Test difficulty calculation sample beatmap 2", () => {
    testDiffCalc("Kenji Ninuma - DISCOPRINCE (peppy) [Normal]", {
        noMod: {
            aim: 1.0156258494693364,
            tap: 0.9920702742360272,
            rhythm: 0.6013744914648519,
            visual: 0.7700925377855574,
            total: 2.8734260426419054,
        },
        doubleTime: {
            aim: 1.3850055438718738,
            tap: 1.3850570311596002,
            rhythm: 0.747004165876224,
            visual: 0.8814906278127569,
            total: 3.353694993945759,
        },
        flashlight: 0.4330837924356968,
    });
});

describe("Test difficulty calculation sample beatmap 3", () => {
    testDiffCalc(
        "sphere - HIGH POWERED (TV Size) (Azunyan-) [POWER OVERLOAD EXPERT]",
        {
            noMod: {
                aim: 2.8889734706900896,
                tap: 3.2460702528715935,
                rhythm: 1.2221930759823814,
                visual: 0.9861154014534257,
                total: 5.923212823457477,
            },
            doubleTime: {
                aim: 3.9947211166061423,
                tap: 4.43060943693035,
                rhythm: 1.3559657861736483,
                visual: 1.1149698495470286,
                total: 7.861661036745638,
            },
            flashlight: 1.754605863698652,
        },
    );
});

describe("Test difficulty calculation sample beatmap 4", () => {
    testDiffCalc("Ocelot - KAEDE (Hollow Wings) [EX EX]", {
        noMod: {
            aim: 2.8135886417637566,
            tap: 1.4238603180539844,
            rhythm: 0.769858663314623,
            visual: 1.810075069658755,
            total: 4.896767599318206,
        },
        doubleTime: {
            aim: 3.8851434718692888,
            tap: 2.020446888319116,
            rhythm: 0.9250861198491117,
            visual: 2.545373229647811,
            total: 6.158432071086121,
        },
        flashlight: 3.620236868634939,
    });
});

describe("Test difficulty calculation sample beatmap 5", () => {
    testDiffCalc(
        "m1dlet - Tell Me Why Speedcore Is So Awesome (None1637) [DROID Ultimate PP CS32 x2]",
        {
            noMod: {
                aim: 834.48414551169,
                tap: 5.199552122609969,
                rhythm: 0.8248580204506412,
                visual: 3.306116214675675,
                total: 352.34586819121074,
            },
            doubleTime: {
                aim: 1064.8875681606687,
                tap: 7.025787699952003,
                rhythm: 0.8642772486876512,
                visual: 4.225882745598057,
                total: 428.2264283225006,
            },
            flashlight: 10698.39147471976,
        },
    );
});

describe("Test difficulty calculation sample beatmap 6", () => {
    testDiffCalc("negativeOD", {
        noMod: {
            aim: 0.0015287267173370246,
            tap: 0.18279086410430911,
            rhythm: 0,
            visual: 0,
            total: 0.31681941056355756,
        },
        doubleTime: {
            aim: 0.0018723002068178204,
            tap: 0.2238721733489895,
            rhythm: 0,
            visual: 0,
            total: 0.3833987248977269,
        },
        flashlight: 0,
    });
});

describe("Test difficulty calculation sample beatmap 7", () => {
    testDiffCalc("Camellia - crystallized (-ckopoctb-) [Emilia's C9H13NO3]", {
        noMod: {
            aim: 3.152677205072982,
            tap: 2.550916964695351,
            rhythm: 1.418201134972145,
            visual: 1.072408663631654,
            total: 5.320786915364622,
        },
        doubleTime: {
            aim: 4.467633488346375,
            tap: 3.761356990940646,
            rhythm: 1.5751331337758137,
            visual: 1.408735037445593,
            total: 7.303924193870012,
        },
        flashlight: 3.0936094621972687,
    });
});
