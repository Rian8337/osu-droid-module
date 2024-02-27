import { BeatmapDecoder, ModDoubleTime, ModRelax } from "@rian8337/osu-base";
import { OsuDifficultyCalculator } from "../src";
import { readFileSync } from "fs";
import { join } from "path";

const testDiffCalc = (
    name: string,
    ratings: Readonly<{
        noMod: Readonly<{
            aim: number;
            speed: number;
            flashlight: number;
            total: number;
        }>;
        doubleTime: Readonly<{
            aim: number;
            speed: number;
            flashlight: number;
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
        const noModRating = new OsuDifficultyCalculator(beatmap).calculate();

        test("Aim difficulty", () => {
            expect(noModRating.attributes.aimDifficulty).toBeCloseTo(
                noModRating.aim,
                5,
            );

            expect(noModRating.aim).toBeCloseTo(ratings.noMod.aim, 5);
        });

        test("Speed difficulty", () => {
            expect(noModRating.attributes.speedDifficulty).toBeCloseTo(
                noModRating.speed,
                5,
            );

            expect(noModRating.speed).toBeCloseTo(ratings.noMod.speed, 5);
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

        test("Total star rating", () => {
            expect(noModRating.total).toBeCloseTo(ratings.noMod.total, 6);
        });

        test("toString()", () => {
            const str = `${noModRating.total.toFixed(
                2,
            )} stars (${noModRating.aim.toFixed(
                2,
            )} aim, ${noModRating.speed.toFixed(
                2,
            )} speed, ${noModRating.flashlight.toFixed(2)} flashlight)`;

            expect(noModRating.toString()).toBe(str);
        });
    });

    describe("Double Time difficulty", () => {
        const doubleTimeRating = new OsuDifficultyCalculator(beatmap).calculate(
            {
                mods: [new ModDoubleTime()],
            },
        );

        test("Aim difficulty", () => {
            expect(doubleTimeRating.aim).toBeCloseTo(ratings.doubleTime.aim, 5);

            doubleTimeRating.calculateAim();

            expect(doubleTimeRating.aim).toBeCloseTo(ratings.doubleTime.aim, 5);
        });

        test("Speed difficulty", () => {
            expect(doubleTimeRating.speed).toBeCloseTo(
                ratings.doubleTime.speed,
                5,
            );

            doubleTimeRating.calculateSpeed();

            expect(doubleTimeRating.speed).toBeCloseTo(
                ratings.doubleTime.speed,
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

        test("Total star rating", () => {
            expect(doubleTimeRating.total).toBeCloseTo(
                ratings.doubleTime.total,
                6,
            );
        });
    });

    test("Relax speed difficulty calculation", () => {
        const relaxRating = new OsuDifficultyCalculator(beatmap).calculate({
            mods: [new ModRelax()],
        });

        expect(relaxRating.speed).toBe(0);

        relaxRating.calculateSpeed();

        expect(relaxRating.speed).toBe(0);
    });
};

describe("Test difficulty calculation sample beatmap 1", () => {
    testDiffCalc(
        "YOASOBI - Love Letter (ohm002) [Please accept my overflowing emotions.]",
        {
            noMod: {
                aim: 2.38329754243596,
                speed: 1.852444804914802,
                flashlight: 1.5631284331567892,
                total: 4.50516851110435,
            },
            doubleTime: {
                aim: 3.2627995309721967,
                speed: 2.643610266224992,
                flashlight: 2.416117806994015,
                total: 6.2483878561131405,
            },
        },
    );
});

describe("Test difficulty calculation sample beatmap 2", () => {
    testDiffCalc("Kenji Ninuma - DISCOPRINCE (peppy) [Normal]", {
        noMod: {
            aim: 1.2905674764533197,
            speed: 1.1738140594624356,
            flashlight: 0.4548840702091824,
            total: 2.581328909130559,
        },
        doubleTime: {
            aim: 1.735080364763565,
            speed: 1.6776992711424359,
            flashlight: 0.6658138602842196,
            total: 3.5663359644015125,
        },
    });
});

describe("Test difficulty calculation sample beatmap 3", () => {
    testDiffCalc(
        "sphere - HIGH POWERED (TV Size) (Azunyan-) [POWER OVERLOAD EXPERT]",
        {
            noMod: {
                aim: 2.998699808952236,
                speed: 3.0163495021546853,
                flashlight: 1.9487844086254231,
                total: 6.28364808504362,
            },
            doubleTime: {
                aim: 4.220274465297037,
                speed: 4.543127503929168,
                flashlight: 2.9067732997621683,
                total: 9.169076094166597,
            },
        },
    );
});

describe("Test difficulty calculation sample beatmap 4", () => {
    testDiffCalc("Ocelot - KAEDE (Hollow Wings) [EX EX]", {
        noMod: {
            aim: 4.43027816349069,
            speed: 1.8158495987631025,
            flashlight: 2.8603654043070934,
            total: 7.6335688890847075,
        },
        doubleTime: {
            aim: 5.8625331362421,
            speed: 2.604564024638431,
            flashlight: 3.7242470586790755,
            total: 10.142162546734784,
        },
    });
});

describe("Test difficulty calculation sample beatmap 5", () => {
    testDiffCalc(
        "m1dlet - Tell Me Why Speedcore Is So Awesome (None1637) [DROID Ultimate PP CS32 x2]",
        {
            noMod: {
                aim: 16.04102965680953,
                speed: 11.00140070367911,
                flashlight: 249.1821066741133,
                total: 29.334871129605816,
            },
            doubleTime: {
                aim: 20.38661513206168,
                speed: 13.198324389756989,
                flashlight: 270.8501512791027,
                total: 36.83801094932713,
            },
        },
    );
});

describe("Test difficulty calculation sample beatmap 6", () => {
    testDiffCalc("negativeOD", {
        noMod: {
            aim: 0,
            speed: 0.06990556852804106,
            flashlight: 0,
            total: 0.1437742937317235,
        },
        doubleTime: {
            aim: 0,
            speed: 0.08561648653643154,
            flashlight: 0,
            total: 0.16732167597199432,
        },
    });
});
