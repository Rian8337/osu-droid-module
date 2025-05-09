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
                aim: 2.411367049859269,
                tap: 1.4928164438079188,
                rhythm: 0.8031331688998974,
                visual: 0.7613073517895537,
                total: 3.9146923122394863,
            },
            doubleTime: {
                aim: 3.2952402456470438,
                tap: 2.174771069380805,
                rhythm: 0.9518967299370099,
                visual: 0.8808207531647475,
                total: 5.025440685614527,
            },
            flashlight: 1.3899714456042234,
        },
    );
});

describe("Test difficulty calculation sample beatmap 2", () => {
    testDiffCalc("Kenji Ninuma - DISCOPRINCE (peppy) [Normal]", {
        noMod: {
            aim: 0.9982303997749552,
            tap: 0.9920702742360272,
            rhythm: 0.6013744914648519,
            visual: 0.7276690505311416,
            total: 2.809226293094444,
        },
        doubleTime: {
            aim: 1.3612834278215085,
            tap: 1.3850570311596002,
            rhythm: 0.747004165876224,
            visual: 0.8329303515095537,
            total: 3.293218703428113,
        },
        flashlight: 0.40385271881723717,
    });
});

describe("Test difficulty calculation sample beatmap 3", () => {
    testDiffCalc(
        "sphere - HIGH POWERED (TV Size) (Azunyan-) [POWER OVERLOAD EXPERT]",
        {
            noMod: {
                aim: 2.839491673132407,
                tap: 3.2460702528715935,
                rhythm: 1.2221930759823814,
                visual: 0.9317914700915665,
                total: 5.8890637536417145,
            },
            doubleTime: {
                aim: 3.9263002800713958,
                tap: 4.43060943693035,
                rhythm: 1.3559657861736483,
                visual: 1.0535474790130501,
                total: 7.829131594277214,
            },
            flashlight: 1.6361784044656411,
        },
    );
});

describe("Test difficulty calculation sample beatmap 4", () => {
    testDiffCalc("Ocelot - KAEDE (Hollow Wings) [EX EX]", {
        noMod: {
            aim: 2.765398021463912,
            tap: 1.4238603180539844,
            rhythm: 0.769858663314623,
            visual: 1.7103601745267794,
            total: 4.795946120623612,
        },
        doubleTime: {
            aim: 3.8185994607497724,
            tap: 2.020446888319116,
            rhythm: 0.9250861198491117,
            visual: 2.4051516283890737,
            total: 6.042707550266732,
        },
        flashlight: 3.375888286970938,
    });
});

describe("Test difficulty calculation sample beatmap 5", () => {
    testDiffCalc(
        "m1dlet - Tell Me Why Speedcore Is So Awesome (None1637) [DROID Ultimate PP CS32 x2]",
        {
            noMod: {
                aim: 820.1912570610937,
                tap: 5.199552122609969,
                rhythm: 0.8248580204506412,
                visual: 3.1239861819678816,
                total: 347.5099067500225,
            },
            doubleTime: {
                aim: 1046.6483729572483,
                tap: 7.025787699952003,
                rhythm: 0.8642772486876512,
                visual: 3.9930838623468903,
                total: 422.34895508174975,
            },
            flashlight: 9976.301490613356,
        },
    );
});

describe("Test difficulty calculation sample beatmap 6", () => {
    testDiffCalc("negativeOD", {
        noMod: {
            aim: 0.0015025429718939682,
            tap: 0.18279086410430911,
            rhythm: 0,
            visual: 0,
            total: 0.31681941056355756,
        },
        doubleTime: {
            aim: 0.0018402317988726142,
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
            aim: 3.0986787392480677,
            tap: 2.550916964695351,
            rhythm: 1.418201134972145,
            visual: 1.0133309385001694,
            total: 5.267154808896753,
        },
        doubleTime: {
            aim: 4.391112697112015,
            tap: 3.761356990940646,
            rhythm: 1.5751331337758137,
            visual: 1.331129490094394,
            total: 7.249689305888569,
        },
        flashlight: 2.8848056983166863,
    });
});
