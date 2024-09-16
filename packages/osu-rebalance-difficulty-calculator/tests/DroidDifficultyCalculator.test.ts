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
                aim: 2.183483933711282,
                tap: 1.4532306721542643,
                rhythm: 0.7617058040683989,
                flashlight: 1.5206253436039583,
                visual: 0.7808575406851211,
                total: 3.7467745642007766,
            },
            doubleTime: {
                aim: 2.9980845142279073,
                tap: 2.1144863797015456,
                rhythm: 0.9032136117024168,
                flashlight: 2.059260991975098,
                visual: 0.9416551460354949,
                total: 4.811277819162172,
            },
        },
    );
});

describe("Test difficulty calculation sample beatmap 2", () => {
    testDiffCalc("Kenji Ninuma - DISCOPRINCE (peppy) [Normal]", {
        noMod: {
            aim: 0.9939922323039344,
            tap: 0.9376927801435487,
            rhythm: 0.6303983925347473,
            flashlight: 0.5655539900280351,
            visual: 0.7365501111399614,
            total: 2.7979993060916835,
        },
        doubleTime: {
            aim: 1.356653786330484,
            tap: 1.3027242062661357,
            rhythm: 0.7847276810553927,
            flashlight: 0.7630253989835782,
            visual: 0.8533696935604126,
            total: 3.261805910905972,
        },
    });
});

describe("Test difficulty calculation sample beatmap 3", () => {
    testDiffCalc(
        "sphere - HIGH POWERED (TV Size) (Azunyan-) [POWER OVERLOAD EXPERT]",
        {
            noMod: {
                aim: 2.6479021001929195,
                tap: 2.9909094083638226,
                rhythm: 1.2526406165201789,
                flashlight: 1.8166004150316049,
                visual: 0.9529284137332561,
                total: 5.509163642056518,
            },
            doubleTime: {
                aim: 3.6919058707977688,
                tap: 4.118676657609141,
                rhythm: 1.3559464524256253,
                flashlight: 2.498508945253868,
                visual: 1.0832452330439357,
                total: 7.344765788723424,
            },
        },
    );
});

describe("Test difficulty calculation sample beatmap 4", () => {
    testDiffCalc("Ocelot - KAEDE (Hollow Wings) [EX EX]", {
        noMod: {
            aim: 2.7602593344655855,
            tap: 1.367667100667766,
            rhythm: 0.7132455693331773,
            flashlight: 3.036035049248153,
            visual: 1.8491804699383172,
            total: 4.881886726536875,
        },
        doubleTime: {
            aim: 3.852605714473806,
            tap: 1.9275115728321794,
            rhythm: 0.8430284406108397,
            flashlight: 3.657422534623763,
            visual: 2.566147929961863,
            total: 6.11912472732163,
        },
    });
});

describe("Test difficulty calculation sample beatmap 5", () => {
    testDiffCalc(
        "m1dlet - Tell Me Why Speedcore Is So Awesome (None1637) [DROID Ultimate PP CS32 x2]",
        {
            noMod: {
                aim: 965.5505553330325,
                tap: 4.908605708885889,
                rhythm: 0.6823361636632594,
                flashlight: 5673.556664655397,
                visual: 4.091146244278765,
                total: 395.9603475888213,
            },
            doubleTime: {
                aim: 1257.1591970080917,
                tap: 6.663376207162514,
                rhythm: 0.7006890080102589,
                flashlight: 5625.476697521746,
                visual: 5.336536545288567,
                total: 489.03475586727575,
            },
        },
    );
});

describe("Test difficulty calculation sample beatmap 6", () => {
    testDiffCalc("negativeOD", {
        noMod: {
            aim: 0.0027309002298384925,
            tap: 0.16460907135106717,
            rhythm: 0,
            flashlight: 0,
            visual: 0,
            total: 0.2873604890319924,
        },
        doubleTime: {
            aim: 0.003344656050776806,
            tap: 0.20160411592175168,
            rhythm: 0,
            flashlight: 0,
            visual: 0,
            total: 0.3473075351546969,
        },
    });
});

describe("Test difficulty calculation sample beatmap 7", () => {
    testDiffCalc("Camellia - crystallized (-ckopoctb-) [Emilia's C9H13NO3]", {
        noMod: {
            aim: 3.002290014580639,
            tap: 2.5084797101170144,
            rhythm: 1.46991402878021,
            flashlight: 2.7262670257558708,
            visual: 1.0935623156427097,
            total: 5.2092794757583825,
        },
        doubleTime: {
            aim: 4.295842123488076,
            tap: 3.6976499471752486,
            rhythm: 1.6034657232648741,
            flashlight: 3.742818329383441,
            visual: 1.4543444460226884,
            total: 7.166574688618557,
        },
    });
});
