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
                tap: 1.4928164476498595,
                rhythm: 0.8031331688998974,
                flashlight: 1.607766518307496,
                visual: 0.7809831991279115,
                total: 3.9783373443953787,
            },
            doubleTime: {
                aim: 3.3905334356485666,
                tap: 2.174771124649896,
                rhythm: 0.9518967299370099,
                flashlight: 2.3487372782931093,
                visual: 0.9395990244505574,
                total: 5.1142210559828785,
            },
        },
    );
});

describe("Test difficulty calculation sample beatmap 2", () => {
    testDiffCalc("Kenji Ninuma - DISCOPRINCE (peppy) [Normal]", {
        noMod: {
            aim: 1.1987600018648465,
            tap: 0.9920702742360272,
            rhythm: 0.6013744914648519,
            flashlight: 0.4669687177434637,
            visual: 0.7342340416938831,
            total: 2.898313570937048,
        },
        doubleTime: {
            aim: 1.6343032570598897,
            tap: 1.3850570311596004,
            rhythm: 0.747004165876224,
            flashlight: 0.6789987004024027,
            visual: 0.8473317674989617,
            total: 3.433849968741649,
        },
    });
});

describe("Test difficulty calculation sample beatmap 3", () => {
    testDiffCalc(
        "sphere - HIGH POWERED (TV Size) (Azunyan-) [POWER OVERLOAD EXPERT]",
        {
            noMod: {
                aim: 2.935214690378211,
                tap: 3.246070253875823,
                rhythm: 1.2221930759823814,
                flashlight: 2.00802659788292,
                visual: 0.9493658854538004,
                total: 5.929801310489859,
            },
            doubleTime: {
                aim: 4.0829661751427695,
                tap: 4.430609863752036,
                rhythm: 1.355971886925319,
                flashlight: 2.990861729021546,
                visual: 1.081656916976236,
                total: 7.885653225218015,
            },
        },
    );
});

describe("Test difficulty calculation sample beatmap 4", () => {
    testDiffCalc("Ocelot - KAEDE (Hollow Wings) [EX EX]", {
        noMod: {
            aim: 3.0828687026842343,
            tap: 1.4238603180542158,
            rhythm: 0.769858663314623,
            flashlight: 3.8165975619507537,
            visual: 1.8591931776429031,
            total: 5.086227105655489,
        },
        doubleTime: {
            aim: 4.29541628796024,
            tap: 2.0204468975030356,
            rhythm: 0.9250861198491117,
            flashlight: 4.816843778970552,
            visual: 2.6111599522692974,
            total: 6.430262079711225,
        },
    });
});

describe("Test difficulty calculation sample beatmap 5", () => {
    testDiffCalc(
        "m1dlet - Tell Me Why Speedcore Is So Awesome (None1637) [DROID Ultimate PP CS32 x2]",
        {
            noMod: {
                aim: 978.6149511002018,
                tap: 5.199552102376902,
                rhythm: 0.8248580204506412,
                flashlight: 45672.16009584284,
                visual: 3.1248059028282156,
                total: 400.2403958330793,
            },
            doubleTime: {
                aim: 1248.4505218990535,
                tap: 7.025787073128167,
                rhythm: 0.8642772486876512,
                flashlight: 45243.26309077285,
                visual: 3.994183818533306,
                total: 486.3229067345882,
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
            tap: 2.5509169744576488,
            rhythm: 1.418201134972145,
            flashlight: 3.333131303242997,
            visual: 1.0808536939429827,
            total: 5.447426892622433,
        },
        doubleTime: {
            aim: 4.792493017363569,
            tap: 3.7613654162936587,
            rhythm: 1.5751527560057175,
            flashlight: 4.95328222027386,
            visual: 1.448143124588364,
            total: 7.471679559723264,
        },
    });
});
