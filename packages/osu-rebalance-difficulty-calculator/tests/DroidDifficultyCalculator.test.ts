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
                aim: 2.5699437082044176,
                tap: 1.4928164438079188,
                rhythm: 0.8031331688998974,
                visual: 0.7809831991279115,
                total: 4.043832846918755,
            },
            doubleTime: {
                aim: 3.514018967231544,
                tap: 2.174771069380805,
                rhythm: 0.9518967299370099,
                visual: 0.9395990244505574,
                total: 5.199725680531692,
            },
            flashlight: 1.607766518307496,
        },
    );
});

describe("Test difficulty calculation sample beatmap 2", () => {
    testDiffCalc("Kenji Ninuma - DISCOPRINCE (peppy) [Normal]", {
        noMod: {
            aim: 1.187883822214656,
            tap: 0.9920702742360272,
            rhythm: 0.6013744914648519,
            visual: 0.7342340416938831,
            total: 2.8934637532283443,
        },
        doubleTime: {
            aim: 1.6257023674613005,
            tap: 1.3850570311596002,
            rhythm: 0.747004165876224,
            visual: 0.8473317674989617,
            total: 3.4294737255078522,
        },
        flashlight: 0.45975898744747334,
    });
});

describe("Test difficulty calculation sample beatmap 3", () => {
    testDiffCalc(
        "sphere - HIGH POWERED (TV Size) (Azunyan-) [POWER OVERLOAD EXPERT]",
        {
            noMod: {
                aim: 2.972058300389381,
                tap: 3.2460702528715935,
                rhythm: 1.2221930759823814,
                visual: 0.9493658854538004,
                total: 5.943908085667447,
            },
            doubleTime: {
                aim: 4.126354347265696,
                tap: 4.43060943693035,
                rhythm: 1.3559657861736483,
                visual: 1.081656916976236,
                total: 7.900481750290572,
            },
            flashlight: 1.8982402716945184,
        },
    );
});

describe("Test difficulty calculation sample beatmap 4", () => {
    testDiffCalc("Ocelot - KAEDE (Hollow Wings) [EX EX]", {
        noMod: {
            aim: 3.096510189538707,
            tap: 1.4238603180539844,
            rhythm: 0.769858663314623,
            visual: 1.8591931776429031,
            total: 5.094310232725817,
        },
        doubleTime: {
            aim: 4.3187762951978526,
            tap: 2.020446888319116,
            rhythm: 0.9250861198491117,
            visual: 2.6111599522692974,
            total: 6.444192831189481,
        },
        flashlight: 3.8165575397856912,
    });
});

describe("Test difficulty calculation sample beatmap 5", () => {
    testDiffCalc(
        "m1dlet - Tell Me Why Speedcore Is So Awesome (None1637) [DROID Ultimate PP CS32 x2]",
        {
            noMod: {
                aim: 1009.0042463544902,
                tap: 5.199552122609969,
                rhythm: 0.8248580204506412,
                visual: 3.1248059028282156,
                total: 410.1524078248066,
            },
            doubleTime: {
                aim: 1289.637269796588,
                tap: 7.025787699952003,
                rhythm: 0.8642772486876512,
                visual: 3.994183818533306,
                total: 499.1156650429074,
            },
            flashlight: 15033.81712590927,
        },
    );
});

describe("Test difficulty calculation sample beatmap 6", () => {
    testDiffCalc("negativeOD", {
        noMod: {
            aim: 0.0030957996476121486,
            tap: 0.18279086410430911,
            rhythm: 0,
            visual: 0,
            total: 0.31681941056355756,
        },
        doubleTime: {
            aim: 0.003791564741268867,
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
            aim: 3.405067008697685,
            tap: 2.550916964695351,
            rhythm: 1.418201134972145,
            visual: 1.0808536939429827,
            total: 5.4683490115449995,
        },
        doubleTime: {
            aim: 4.846240268882784,
            tap: 3.761356990940646,
            rhythm: 1.5751331337758137,
            visual: 1.448143124588364,
            total: 7.4988540461137045,
        },
        flashlight: 3.333131303242997,
    });
});
