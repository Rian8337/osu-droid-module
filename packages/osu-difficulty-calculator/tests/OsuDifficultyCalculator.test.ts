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
                aim: 2.3831712269307364,
                speed: 1.8524086519172178,
                flashlight: 1.548663672373713,
                total: 4.504975092692032,
            },
            doubleTime: {
                aim: 3.2626224346673154,
                speed: 2.643465024399173,
                flashlight: 2.396326757852515,
                total: 6.248047415050646,
            },
        },
    );
});

describe("Test difficulty calculation sample beatmap 2", () => {
    testDiffCalc("Kenji Ninuma - DISCOPRINCE (peppy) [Normal]", {
        noMod: {
            aim: 1.2904210446224906,
            speed: 1.1740907231360738,
            flashlight: 0.44584339420807667,
            total: 2.581414614962865,
        },
        doubleTime: {
            aim: 1.7350154357475098,
            speed: 1.6788658439315995,
            flashlight: 0.6523706596024608,
            total: 3.5674356226804314,
        },
    });
});

describe("Test difficulty calculation sample beatmap 3", () => {
    testDiffCalc(
        "sphere - HIGH POWERED (TV Size) (Azunyan-) [POWER OVERLOAD EXPERT]",
        {
            noMod: {
                aim: 2.986717180507845,
                speed: 3.0163495021546853,
                flashlight: 1.8872149430292529,
                total: 6.271241451330611,
            },
            doubleTime: {
                aim: 4.198884138559176,
                speed: 4.543117656856761,
                flashlight: 2.8231579152777524,
                total: 9.148733097665335,
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
                aim: 15.788590723339778,
                speed: 11.001302727902472,
                flashlight: 82.4788478356682,
                total: 28.97765105330993,
            },
            doubleTime: {
                aim: 20.09747072556416,
                speed: 13.198213598296716,
                flashlight: 92.68470788110214,
                total: 36.41710510035692,
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
            total: 0.14377244283550372,
        },
        doubleTime: {
            aim: 0,
            speed: 0.08561648653643154,
            flashlight: 0,
            total: 0.16731867974000042,
        },
    });
});

describe("Test difficulty calculation sample beatmap 7", () => {
    testDiffCalc("Camellia - crystallized (-ckopoctb-) [Emilia's C9H13NO3]", {
        noMod: {
            aim: 5.8802524420894535,
            speed: 2.838100886150211,
            flashlight: 4.004691799976666,
            total: 10.233215948476014,
        },
        doubleTime: {
            aim: 7.323620278789302,
            speed: 4.175026798653464,
            flashlight: 5.334676210648524,
            total: 12.968617943014612,
        },
    });
});
