import {
    BeatmapDecoder,
    ModDoubleTime,
    ModFlashlight,
    ModNoFail,
} from "@rian8337/osu-base";
import { OsuDifficultyCalculator } from "../src";
import { readFileSync } from "fs";
import { join } from "path";

const testDiffCalc = (
    name: string,
    ratings: Readonly<{
        noMod: Readonly<{
            aim: number;
            speed: number;
            total: number;
        }>;
        doubleTime: Readonly<{
            aim: number;
            speed: number;
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

            expect(noModRating.flashlight).toBeCloseTo(0, 5);
        });

        test("Total star rating", () => {
            expect(noModRating.total).toBeCloseTo(ratings.noMod.total, 6);
        });

        test("toString()", () => {
            const str = `${noModRating.total.toFixed(
                2,
            )} stars (${noModRating.aim.toFixed(
                2,
            )} aim, ${noModRating.speed.toFixed(2)} speed, 0.00 flashlight)`;

            expect(noModRating.toString()).toBe(str);
        });
    });

    describe("Double Time difficulty", () => {
        const doubleTimeRating = new OsuDifficultyCalculator(beatmap).calculate(
            [new ModDoubleTime()],
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
            expect(doubleTimeRating.flashlight).toBeCloseTo(0, 5);

            doubleTimeRating.calculateFlashlight();

            expect(doubleTimeRating.flashlight).toBeCloseTo(0, 5);
        });

        test("Total star rating", () => {
            expect(doubleTimeRating.total).toBeCloseTo(
                ratings.doubleTime.total,
                6,
            );
        });
    });

    test("Flashlight difficulty calculation", () => {
        const flashlightRating = new OsuDifficultyCalculator(beatmap).calculate(
            [new ModFlashlight()],
        );

        expect(flashlightRating.flashlight).toBeCloseTo(ratings.flashlight, 5);
    });
};

test("Test difficulty adjustment mod retention", () => {
    expect(
        OsuDifficultyCalculator.retainDifficultyAdjustmentMods([
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
                aim: 2.4138397272657683,
                speed: 1.8084710110906674,
                total: 4.528123239334526,
            },
            doubleTime: {
                aim: 3.302783746706723,
                speed: 2.5835912678500765,
                total: 6.272855745901558,
            },
            flashlight: 1.5634530448756425,
        },
    );
});

describe("Test difficulty calculation sample beatmap 2", () => {
    testDiffCalc("Kenji Ninuma - DISCOPRINCE (peppy) [Normal]", {
        noMod: {
            aim: 1.3111830334440504,
            speed: 1.1414688505980326,
            total: 2.5843197325261604,
        },
        doubleTime: {
            aim: 1.760748199411534,
            speed: 1.6171130073142919,
            total: 3.5465329658356777,
        },
        flashlight: 0.4481142857693752,
    });
});

describe("Test difficulty calculation sample beatmap 3", () => {
    testDiffCalc(
        "sphere - HIGH POWERED (TV Size) (Azunyan-) [POWER OVERLOAD EXPERT]",
        {
            noMod: {
                aim: 2.9794927363481527,
                speed: 2.9621888502043547,
                total: 6.22509956659178,
            },
            doubleTime: {
                aim: 4.198935906225187,
                speed: 4.462577303545644,
                total: 9.084355616164613,
            },
            flashlight: 1.8107836909794937,
        },
    );
});

describe("Test difficulty calculation sample beatmap 4", () => {
    testDiffCalc("Ocelot - KAEDE (Hollow Wings) [EX EX]", {
        noMod: {
            aim: 4.723569044160621,
            speed: 1.7846106211861659,
            total: 8.133635016435269,
        },
        doubleTime: {
            aim: 6.196941415353111,
            speed: 2.5540474991806223,
            total: 10.70625796278084,
        },
        flashlight: 2.8727042397788516,
    });
});

describe("Test difficulty calculation sample beatmap 5", () => {
    testDiffCalc(
        "m1dlet - Tell Me Why Speedcore Is So Awesome (None1637) [DROID Ultimate PP CS32 x2]",
        {
            noMod: {
                aim: 16.21637045892468,
                speed: 9.578003280614077,
                total: 28.935206048942668,
            },
            doubleTime: {
                aim: 20.619888577652286,
                speed: 11.405325273266,
                total: 36.46383078378835,
            },
            flashlight: 111.66679764219036,
        },
    );
});

describe("Test difficulty calculation sample beatmap 6", () => {
    testDiffCalc("negativeOD", {
        noMod: {
            aim: 0,
            speed: 0.07063390963044149,
            total: 0.14510878648741266,
        },
        doubleTime: {
            aim: 0,
            speed: 0.08650851856622022,
            total: 0.1692665247011561,
        },
        flashlight: 0,
    });
});

describe("Test difficulty calculation sample beatmap 7", () => {
    testDiffCalc("Camellia - crystallized (-ckopoctb-) [Emilia's C9H13NO3]", {
        noMod: {
            aim: 5.9489921364315705,
            speed: 2.7422688498592276,
            total: 10.346882663977693,
        },
        doubleTime: {
            aim: 7.406710776984752,
            speed: 4.022456277294713,
            total: 13.074529781729249,
        },
        flashlight: 4.004691799976666,
    });
});
