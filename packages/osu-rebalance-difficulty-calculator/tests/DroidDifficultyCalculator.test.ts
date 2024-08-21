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
                aim: 2.147467272877935,
                tap: 1.4557678281564461,
                rhythm: 0.8720482221976501,
                flashlight: 1.5206253436039583,
                visual: 0.7825064616921343,
                total: 3.725094638031805,
            },
            doubleTime: {
                aim: 2.9412409402230115,
                tap: 2.1204177841890277,
                rhythm: 1.0038231003463483,
                flashlight: 2.059260991975098,
                visual: 0.9414259712063862,
                total: 4.779335779660442,
            },
        },
    );
});

describe("Test difficulty calculation sample beatmap 2", () => {
    testDiffCalc("Kenji Ninuma - DISCOPRINCE (peppy) [Normal]", {
        noMod: {
            aim: 0.9871593405384249,
            tap: 0.9418975036193886,
            rhythm: 0.6884277690569106,
            flashlight: 0.5655539900280351,
            visual: 0.7395173624963256,
            total: 2.801383816609464,
        },
        doubleTime: {
            aim: 1.3480720742787926,
            tap: 1.3142952504540375,
            rhythm: 0.8333072566144986,
            flashlight: 0.7630253989835782,
            visual: 0.8637704847340718,
            total: 3.2763737680863287,
        },
    });
});

describe("Test difficulty calculation sample beatmap 3", () => {
    testDiffCalc(
        "sphere - HIGH POWERED (TV Size) (Azunyan-) [POWER OVERLOAD EXPERT]",
        {
            noMod: {
                aim: 2.581818475162043,
                tap: 2.9389945022183013,
                rhythm: 1.394835322348397,
                flashlight: 1.8166004150316049,
                visual: 0.9676328437781921,
                total: 5.426556064441548,
            },
            doubleTime: {
                aim: 3.5944610329711235,
                tap: 4.077246528127733,
                rhythm: 1.5556293726348631,
                flashlight: 2.498508945253868,
                visual: 1.1021959370900067,
                total: 7.261588756931489,
            },
        },
    );
});

describe("Test difficulty calculation sample beatmap 4", () => {
    testDiffCalc("Ocelot - KAEDE (Hollow Wings) [EX EX]", {
        noMod: {
            aim: 2.7197511288247007,
            tap: 1.380151211951743,
            rhythm: 0.8694116596333932,
            flashlight: 3.036035049248153,
            visual: 1.8743654645106966,
            total: 4.8825800044378544,
        },
        doubleTime: {
            aim: 3.785513626237527,
            tap: 1.9583941344943798,
            rhythm: 0.9970801477489458,
            flashlight: 3.657422534623763,
            visual: 2.613690695558845,
            total: 6.120215842777564,
        },
    });
});

describe("Test difficulty calculation sample beatmap 5", () => {
    testDiffCalc(
        "m1dlet - Tell Me Why Speedcore Is So Awesome (None1637) [DROID Ultimate PP CS32 x2]",
        {
            noMod: {
                aim: 965.5468379713335,
                tap: 4.908651677701668,
                rhythm: 0.7086853403951214,
                flashlight: 5673.556664655397,
                visual: 4.091146244278765,
                total: 395.9591280671344,
            },
            doubleTime: {
                aim: 1257.1539471019244,
                tap: 6.6634755043271126,
                rhythm: 0.7458588044278142,
                flashlight: 5625.476697521746,
                visual: 5.336536545288567,
                total: 489.0331221631071,
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
            aim: 2.9198227132911176,
            tap: 2.53810042848491,
            rhythm: 1.6731942261919266,
            flashlight: 2.7262670257558708,
            visual: 1.0891171915057154,
            total: 5.191681639649285,
        },
        doubleTime: {
            aim: 4.1666624521278,
            tap: 3.7478297128567797,
            rhythm: 1.8635843218916288,
            flashlight: 3.742818329383441,
            visual: 1.4690431402661581,
            total: 7.167019287163169,
        },
    });
});
