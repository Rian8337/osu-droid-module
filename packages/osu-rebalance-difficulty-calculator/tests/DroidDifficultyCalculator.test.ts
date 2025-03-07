import {
    BeatmapDecoder,
    ModAutopilot,
    ModDoubleTime,
    ModRelax,
} from "@rian8337/osu-base";
import { DroidDifficultyCalculator } from "../src";
import { readFileSync } from "fs";
import { join } from "path";

const testDiffCalc = (
    name: string,
    ratings: Readonly<{
        noMod: Readonly<{
            aim: number;
            tap: number;
            rhythm: number;
            flashlight: number;
            visual: number;
            total: number;
        }>;
        doubleTime: Readonly<{
            aim: number;
            tap: number;
            rhythm: number;
            flashlight: number;
            visual: number;
            total: number;
        }>;
    }>,
) => {
    const data = readFileSync(
        join(process.cwd(), "tests", "files", "beatmaps", `${name}.osu`),
        { encoding: "utf-8" },
    );

    const beatmap = new BeatmapDecoder().decode(data).result;

    describe("No mod difficulty", () => {
        const noModRating = new DroidDifficultyCalculator(beatmap).calculate();

        test("Aim difficulty", () => {
            expect(noModRating.attributes.aimDifficulty).toBeCloseTo(
                noModRating.aim,
                5,
            );

            expect(noModRating.aim).toBeCloseTo(ratings.noMod.aim, 5);
        });

        test("Tap difficulty", () => {
            expect(noModRating.attributes.tapDifficulty).toBeCloseTo(
                noModRating.tap,
                5,
            );

            expect(noModRating.tap).toBeCloseTo(ratings.noMod.tap, 5);
        });

        test("Rhythm difficulty", () => {
            expect(noModRating.attributes.rhythmDifficulty).toBeCloseTo(
                noModRating.rhythm,
                5,
            );

            expect(noModRating.rhythm).toBeCloseTo(ratings.noMod.rhythm, 5);
        });

        test("Flashlight difficulty", () => {
            expect(noModRating.attributes.flashlightDifficulty).toBeCloseTo(
                noModRating.flashlight,
                5,
            );

            expect(noModRating.flashlight).toBeCloseTo(
                ratings.noMod.flashlight,
                5,
            );
        });

        test("Visual difficulty", () => {
            expect(noModRating.attributes.visualDifficulty).toBeCloseTo(
                noModRating.visual,
                5,
            );

            expect(noModRating.visual).toBeCloseTo(ratings.noMod.visual, 5);
        });

        test("Total star rating", () => {
            expect(noModRating.total).toBeCloseTo(ratings.noMod.total, 6);
        });

        test("toString()", () => {
            const str = `${noModRating.total.toFixed(
                2,
            )} stars (${noModRating.aim.toFixed(
                2,
            )} aim, ${noModRating.tap.toFixed(
                2,
            )} tap, ${noModRating.rhythm.toFixed(
                2,
            )} rhythm, ${noModRating.flashlight.toFixed(
                2,
            )} flashlight, ${noModRating.visual.toFixed(2)} visual)`;

            expect(noModRating.toString()).toBe(str);
        });
    });

    describe("Double Time difficulty", () => {
        const doubleTimeRating = new DroidDifficultyCalculator(
            beatmap,
        ).calculate({
            mods: [new ModDoubleTime()],
        });

        test("Aim difficulty", () => {
            expect(doubleTimeRating.aim).toBeCloseTo(ratings.doubleTime.aim, 5);

            doubleTimeRating.calculateAim();

            expect(doubleTimeRating.aim).toBeCloseTo(ratings.doubleTime.aim, 5);
        });

        test("Tap difficulty", () => {
            expect(doubleTimeRating.tap).toBeCloseTo(ratings.doubleTime.tap, 5);

            doubleTimeRating.calculateTap();

            expect(doubleTimeRating.tap).toBeCloseTo(ratings.doubleTime.tap, 5);
        });

        test("Rhythm difficulty", () => {
            expect(doubleTimeRating.rhythm).toBeCloseTo(
                ratings.doubleTime.rhythm,
                5,
            );

            doubleTimeRating.calculateRhythm();

            expect(doubleTimeRating.rhythm).toBeCloseTo(
                ratings.doubleTime.rhythm,
                5,
            );
        });

        test("Flashlight difficulty", () => {
            expect(doubleTimeRating.flashlight).toBeCloseTo(
                ratings.doubleTime.flashlight,
                5,
            );

            doubleTimeRating.calculateFlashlight();

            expect(doubleTimeRating.flashlight).toBeCloseTo(
                ratings.doubleTime.flashlight,
                5,
            );
        });

        test("Visual difficulty", () => {
            expect(doubleTimeRating.visual).toBeCloseTo(
                ratings.doubleTime.visual,
                5,
            );

            doubleTimeRating.calculateVisual();

            expect(doubleTimeRating.visual).toBeCloseTo(
                ratings.doubleTime.visual,
                5,
            );
        });

        test("Total star rating", () => {
            expect(doubleTimeRating.total).toBeCloseTo(
                ratings.doubleTime.total,
                6,
            );
        });
    });

    test("Autopilot aim difficulty calculation", () => {
        const autopilotRating = new DroidDifficultyCalculator(
            beatmap,
        ).calculate({
            mods: [new ModAutopilot()],
        });

        expect(autopilotRating.aim).toBe(0);
    });

    describe("Relax tap and rhythm difficulty calculation", () => {
        const relaxRating = new DroidDifficultyCalculator(beatmap).calculate({
            mods: [new ModRelax()],
        });

        test("Tap difficulty", () => {
            expect(relaxRating.tap).toBe(0);

            relaxRating.calculateTap();

            expect(relaxRating.tap).toBe(0);
        });

        test("Rhythm difficulty", () => {
            expect(relaxRating.rhythm).toBe(0);

            relaxRating.calculateRhythm();

            expect(relaxRating.rhythm).toBe(0);
        });
    });
};

describe("Test difficulty calculation sample beatmap 1", () => {
    testDiffCalc(
        "YOASOBI - Love Letter (ohm002) [Please accept my overflowing emotions.]",
        {
            noMod: {
                aim: 2.5699437082044176,
                tap: 1.4928164438079188,
                rhythm: 0.8031331688998974,
                flashlight: 1.607766518307496,
                visual: 0.7809831991279115,
                total: 4.043832846918755,
            },
            doubleTime: {
                aim: 3.514018967231544,
                tap: 2.174771069380805,
                rhythm: 0.9518967299370099,
                flashlight: 2.3487372782931093,
                visual: 0.9395990244505574,
                total: 5.199725680531692,
            },
        },
    );
});

describe("Test difficulty calculation sample beatmap 2", () => {
    testDiffCalc("Kenji Ninuma - DISCOPRINCE (peppy) [Normal]", {
        noMod: {
            aim: 1.187883822214656,
            tap: 0.9920702742360272,
            rhythm: 0.6013744914648519,
            flashlight: 0.45975898744747334,
            visual: 0.7342340416938831,
            total: 2.8934637532283443,
        },
        doubleTime: {
            aim: 1.6257023674613005,
            tap: 1.3850570311596002,
            rhythm: 0.747004165876224,
            flashlight: 0.6681150535256252,
            visual: 0.8473317674989617,
            total: 3.4294737255078522,
        },
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
                flashlight: 1.8982402716945184,
                visual: 0.9493658854538004,
                total: 5.943908085667447,
            },
            doubleTime: {
                aim: 4.126354347265696,
                tap: 4.43060943693035,
                rhythm: 1.3559657861736483,
                flashlight: 2.7848409588539473,
                visual: 1.081656916976236,
                total: 7.900481750290572,
            },
        },
    );
});

describe("Test difficulty calculation sample beatmap 4", () => {
    testDiffCalc("Ocelot - KAEDE (Hollow Wings) [EX EX]", {
        noMod: {
            aim: 3.096510189538707,
            tap: 1.4238603180539844,
            rhythm: 0.769858663314623,
            flashlight: 3.8165575397856912,
            visual: 1.8591931776429031,
            total: 5.094310232725817,
        },
        doubleTime: {
            aim: 4.3187762951978526,
            tap: 2.020446888319116,
            rhythm: 0.9250861198491117,
            flashlight: 4.816765113755093,
            visual: 2.6111599522692974,
            total: 6.444192831189481,
        },
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
                flashlight: 15033.81712590927,
                visual: 3.1248059028282156,
                total: 410.1524078248066,
            },
            doubleTime: {
                aim: 1289.637269796588,
                tap: 7.025787699952003,
                rhythm: 0.8642772486876512,
                flashlight: 15944.802407723833,
                visual: 3.994183818533306,
                total: 499.1156650429074,
            },
        },
    );
});

describe("Test difficulty calculation sample beatmap 6", () => {
    testDiffCalc("negativeOD", {
        noMod: {
            aim: 0.0030957996476121486,
            tap: 0.18279086410430911,
            rhythm: 0,
            flashlight: 0,
            visual: 0,
            total: 0.31681941056355756,
        },
        doubleTime: {
            aim: 0.003791564741268867,
            tap: 0.2238721733489895,
            rhythm: 0,
            flashlight: 0,
            visual: 0,
            total: 0.3833987248977269,
        },
    });
});

describe("Test difficulty calculation sample beatmap 7", () => {
    testDiffCalc("Camellia - crystallized (-ckopoctb-) [Emilia's C9H13NO3]", {
        noMod: {
            aim: 3.405067008697685,
            tap: 2.550916964695351,
            rhythm: 1.418201134972145,
            flashlight: 3.333131303242997,
            visual: 1.0808536939429827,
            total: 5.4683490115449995,
        },
        doubleTime: {
            aim: 4.846240268882784,
            tap: 3.761356990940646,
            rhythm: 1.5751331337758137,
            flashlight: 4.95328222027386,
            visual: 1.448143124588364,
            total: 7.4988540461137045,
        },
    });
});
