import { BeatmapDecoder, ModDoubleTime, ModRelax } from "@rian8337/osu-base";
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
                aim: 2.48083469830998,
                tap: 1.4997744292829895,
                rhythm: 0.8775324539140502,
                flashlight: 1.5126940694050908,
                visual: 0.7897655464962676,
                total: 3.9870440469724513,
            },
            doubleTime: {
                aim: 3.3895561791654765,
                tap: 2.1836296933331045,
                rhythm: 1.061749550191306,
                flashlight: 2.048675179144453,
                visual: 0.9481486873318752,
                total: 5.12308777363443,
            },
        },
    );
});

describe("Test difficulty calculation sample beatmap 2", () => {
    testDiffCalc("Kenji Ninuma - DISCOPRINCE (peppy) [Normal]", {
        noMod: {
            aim: 1.198649993986791,
            tap: 1.0006709597268135,
            rhythm: 0.6432345193454881,
            flashlight: 0.5629715277931123,
            visual: 0.8112020843588915,
            total: 3.0004346043658674,
        },
        doubleTime: {
            aim: 1.6342063674324199,
            tap: 1.407530447303691,
            rhythm: 0.8216298705157962,
            flashlight: 0.7594014091713717,
            visual: 0.9700786686644048,
            total: 3.565552483549834,
        },
    });
});

describe("Test difficulty calculation sample beatmap 3", () => {
    testDiffCalc(
        "sphere - HIGH POWERED (TV Size) (Azunyan-) [POWER OVERLOAD EXPERT]",
        {
            noMod: {
                aim: 2.933370658575117,
                tap: 3.176599290019633,
                rhythm: 1.384266453689203,
                flashlight: 1.798861591751984,
                visual: 0.9674000951634251,
                total: 5.849315082890564,
            },
            doubleTime: {
                aim: 4.079371778408476,
                tap: 4.354213960888814,
                rhythm: 1.5415612896827433,
                flashlight: 2.4755279370371395,
                visual: 1.0953903130504397,
                total: 7.787003276913678,
            },
        },
    );
});

describe("Test difficulty calculation sample beatmap 4", () => {
    testDiffCalc("Ocelot - KAEDE (Hollow Wings) [EX EX]", {
        noMod: {
            aim: 3.0825793202606593,
            tap: 1.4273929472848053,
            rhythm: 0.8279224718488427,
            flashlight: 3.03592629780223,
            visual: 2.9109762504029613,
            total: 5.826613368256815,
        },
        doubleTime: {
            aim: 4.294869838727079,
            tap: 2.03038057135962,
            rhythm: 1.0127723646589712,
            flashlight: 3.6572283558311085,
            visual: 3.8319715099145686,
            total: 7.087611215337846,
        },
    });
});

describe("Test difficulty calculation sample beatmap 5", () => {
    testDiffCalc(
        "m1dlet - Tell Me Why Speedcore Is So Awesome (None1637) [DROID Ultimate PP CS32 x2]",
        {
            noMod: {
                aim: 1030.3284205015611,
                tap: 5.1903726491946625,
                rhythm: 0.6421118550985445,
                flashlight: 5673.4928532851945,
                visual: 4.0911109237976895,
                total: 417.07203716904263,
            },
            doubleTime: {
                aim: 1343.0887818792448,
                tap: 7.0112110684502404,
                rhythm: 0.6558919035917352,
                flashlight: 5625.405394124359,
                visual: 5.336521121058455,
                total: 515.5969334630472,
            },
        },
    );
});

describe("Test difficulty calculation sample beatmap 6", () => {
    testDiffCalc("negativeOD", {
        noMod: {
            aim: 0.001479378256495523,
            tap: 0.18279086410430911,
            rhythm: 0,
            flashlight: 0,
            visual: 0,
            total: 0.31681941056355756,
        },
        doubleTime: {
            aim: 0.0018118609324911225,
            tap: 0.22387217334898948,
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
            aim: 3.3694281304042724,
            tap: 2.603733100355841,
            rhythm: 1.6715609435020071,
            flashlight: 2.7255412959558445,
            visual: 1.0971005974437773,
            total: 5.499578933920545,
        },
        doubleTime: {
            aim: 4.792493017363569,
            tap: 3.820070915791649,
            rhythm: 1.8191003351103172,
            flashlight: 3.741854998394197,
            visual: 1.460394734752147,
            total: 7.534644415504766,
        },
    });
});
