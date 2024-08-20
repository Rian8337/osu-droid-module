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
                aim: 1.6825714324626204,
                tap: 1.4612795228220286,
                rhythm: 0.8775324539140502,
                flashlight: 1.0768541869499926,
                visual: 0.7584148611159292,
                total: 3.426010497511612,
            },
            doubleTime: {
                aim: 2.302570830820509,
                tap: 2.1273421374145047,
                rhythm: 1.061749550191306,
                flashlight: 1.4594077223201483,
                visual: 0.8373769480326888,
                total: 4.362198647923089,
            },
        },
    );
});

describe("Test difficulty calculation sample beatmap 2", () => {
    testDiffCalc("Kenji Ninuma - DISCOPRINCE (peppy) [Normal]", {
        noMod: {
            aim: 0.6691780588074752,
            tap: 0.9382398553356395,
            rhythm: 0.6432345193454881,
            flashlight: 0.40070168251577015,
            visual: 0.7319415895505924,
            total: 2.7036353647500047,
        },
        doubleTime: {
            aim: 0.8922666672256294,
            tap: 1.3164221939602245,
            rhythm: 0.8216298705157962,
            flashlight: 0.5405863733524422,
            visual: 0.8419666329548225,
            total: 3.1071497724347643,
        },
    });
});

describe("Test difficulty calculation sample beatmap 3", () => {
    testDiffCalc(
        "sphere - HIGH POWERED (TV Size) (Azunyan-) [POWER OVERLOAD EXPERT]",
        {
            noMod: {
                aim: 2.1935612663709514,
                tap: 2.958940053403069,
                rhythm: 1.384266453689203,
                flashlight: 1.2574479748042426,
                visual: 0.9333004559329422,
                total: 5.307192365760113,
            },
            doubleTime: {
                aim: 3.0189150147694326,
                tap: 4.090119861240831,
                rhythm: 1.5415612896827433,
                flashlight: 1.731788254853995,
                visual: 1.0409961492456798,
                total: 7.0955084640773025,
            },
        },
    );
});

describe("Test difficulty calculation sample beatmap 4", () => {
    testDiffCalc("Ocelot - KAEDE (Hollow Wings) [EX EX]", {
        noMod: {
            aim: 1.9064724152865014,
            tap: 1.3865673056485874,
            rhythm: 0.8279224718488427,
            flashlight: 2.1553758687137177,
            visual: 1.3503650762213735,
            total: 4.042561435880305,
        },
        doubleTime: {
            aim: 2.5809661054717195,
            tap: 1.9734030126862225,
            rhythm: 1.0127723646589712,
            flashlight: 2.689994979232379,
            visual: 1.917870017409948,
            total: 5.084252201303852,
        },
    });
});

describe("Test difficulty calculation sample beatmap 5", () => {
    testDiffCalc(
        "m1dlet - Tell Me Why Speedcore Is So Awesome (None1637) [DROID Ultimate PP CS32 x2]",
        {
            noMod: {
                aim: 778.4433761091974,
                tap: 4.90856372494513,
                rhythm: 0.6421118550985445,
                flashlight: 3703.698711607957,
                visual: 4.090301153616621,
                total: 333.28661576216854,
            },
            doubleTime: {
                aim: 1011.1310819431757,
                tap: 6.663312891062501,
                rhythm: 0.6558919035917352,
                flashlight: 3671.990179048114,
                visual: 5.335231970255708,
                total: 410.84438622195194,
            },
        },
    );
});

describe("Test difficulty calculation sample beatmap 6", () => {
    testDiffCalc("negativeOD", {
        noMod: {
            aim: 0,
            tap: 0.16460907135106717,
            rhythm: 0,
            flashlight: 0,
            visual: 0,
            total: 0.2873604890319924,
        },
        doubleTime: {
            aim: 0,
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
            aim: 2.2502829672543414,
            tap: 2.5577588363692443,
            rhythm: 1.6715609435020071,
            flashlight: 1.9311103705027264,
            visual: 0.9266346662023048,
            total: 4.834094496869102,
        },
        doubleTime: {
            aim: 3.1442454772208768,
            tap: 3.7561166919788325,
            rhythm: 1.8191003351103172,
            flashlight: 2.6370303839894826,
            visual: 1.0671799234660355,
            total: 6.685070462668823,
        },
    });
});
