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
                aim: 2.4814071238381215,
                tap: 1.4942543935880108,
                rhythm: 0.7617058040683989,
                flashlight: 1.5206253436039583,
                visual: 0.7808575406851211,
                total: 3.978985422301676,
            },
            doubleTime: {
                aim: 3.3905334356485666,
                tap: 2.1748589225889963,
                rhythm: 0.9032136117024168,
                flashlight: 2.059260991975098,
                visual: 0.9416551460354949,
                total: 5.115114222809041,
            },
        },
    );
});

describe("Test difficulty calculation sample beatmap 2", () => {
    testDiffCalc("Kenji Ninuma - DISCOPRINCE (peppy) [Normal]", {
        noMod: {
            aim: 1.1987600018648465,
            tap: 1.0003000500699684,
            rhythm: 0.6303983925347473,
            flashlight: 0.5655539900280351,
            visual: 0.7365501111399614,
            total: 2.904620099301128,
        },
        doubleTime: {
            aim: 1.6343032570598897,
            tap: 1.3924209859130339,
            rhythm: 0.7847276810553927,
            flashlight: 0.7630253989835782,
            visual: 0.8533696935604126,
            total: 3.444061225930614,
        },
    });
});

describe("Test difficulty calculation sample beatmap 3", () => {
    testDiffCalc(
        "sphere - HIGH POWERED (TV Size) (Azunyan-) [POWER OVERLOAD EXPERT]",
        {
            noMod: {
                aim: 2.935214690378211,
                tap: 3.209740164456088,
                rhythm: 1.2526406165201789,
                flashlight: 1.8166004150316049,
                visual: 0.9529284137332561,
                total: 5.886127017702072,
            },
            doubleTime: {
                aim: 4.0829661751427695,
                tap: 4.383883058019356,
                rhythm: 1.3559464524256253,
                flashlight: 2.498508945253868,
                visual: 1.0832452330439357,
                total: 7.824797158409172,
            },
        },
    );
});

describe("Test difficulty calculation sample beatmap 4", () => {
    testDiffCalc("Ocelot - KAEDE (Hollow Wings) [EX EX]", {
        noMod: {
            aim: 3.0824581750703843,
            tap: 1.406721078102933,
            rhythm: 0.7132455693331773,
            flashlight: 3.036035049248153,
            visual: 1.8491804699383172,
            total: 5.074791032797349,
        },
        doubleTime: {
            aim: 4.294640590160559,
            tap: 1.9819686792340598,
            rhythm: 0.8430284406108397,
            flashlight: 3.657422534623763,
            visual: 2.566147929961863,
            total: 6.39391418097372,
        },
    });
});

describe("Test difficulty calculation sample beatmap 5", () => {
    testDiffCalc(
        "m1dlet - Tell Me Why Speedcore Is So Awesome (None1637) [DROID Ultimate PP CS32 x2]",
        {
            noMod: {
                aim: 1030.3285858976476,
                tap: 5.1903726491946625,
                rhythm: 0.6823361636632594,
                flashlight: 5673.556664655397,
                visual: 4.09114891489215,
                total: 417.07209072930243,
            },
            doubleTime: {
                aim: 1343.0887818792448,
                tap: 7.0112110684502404,
                rhythm: 0.7006890080102589,
                flashlight: 5625.476697521746,
                visual: 5.336536545288567,
                total: 515.5969334630472,
            },
        },
    );
});

describe("Test difficulty calculation sample beatmap 6", () => {
    testDiffCalc("negativeOD", {
        noMod: {
            aim: 0.003031646865113843,
            tap: 0.18279086410430911,
            rhythm: 0,
            flashlight: 0,
            visual: 0,
            total: 0.31681941056355756,
        },
        doubleTime: {
            aim: 0.0037129939499185682,
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
            tap: 2.551418516304382,
            rhythm: 1.46991402878021,
            flashlight: 2.7262670257558708,
            visual: 1.0935623156427097,
            total: 5.452809001269151,
        },
        doubleTime: {
            aim: 4.792493017363569,
            tap: 3.7576127035052007,
            rhythm: 1.6034657232648741,
            flashlight: 3.742818329383441,
            visual: 1.4543444460226884,
            total: 7.469309113134923,
        },
    });
});
