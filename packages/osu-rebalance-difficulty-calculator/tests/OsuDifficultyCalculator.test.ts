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
                aim: 2.3936339701696183,
                speed: 1.8047306252798359,
                flashlight: 1.5634530448756425,
                total: 4.498120304689002,
            },
            doubleTime: {
                aim: 3.276950383293742,
                speed: 2.5722569782182236,
                flashlight: 2.416522950209294,
                total: 6.230405181289721,
            },
        },
    );
});

describe("Test difficulty calculation sample beatmap 2", () => {
    testDiffCalc("Kenji Ninuma - DISCOPRINCE (peppy) [Normal]", {
        noMod: {
            aim: 1.2961647034962065,
            speed: 1.1367415701545696,
            flashlight: 0.4549452241175434,
            total: 2.5620226573068945,
        },
        doubleTime: {
            aim: 1.74260545656731,
            speed: 1.6108474050210544,
            flashlight: 0.6658612072738427,
            total: 3.5198086760252423,
        },
    });
});

describe("Test difficulty calculation sample beatmap 3", () => {
    testDiffCalc(
        "sphere - HIGH POWERED (TV Size) (Azunyan-) [POWER OVERLOAD EXPERT]",
        {
            noMod: {
                aim: 3.011705253433369,
                speed: 2.9390177959157677,
                flashlight: 1.9493277808469929,
                total: 6.235599672413122,
            },
            doubleTime: {
                aim: 4.2385779130411905,
                speed: 4.427543992799371,
                flashlight: 2.9074624323391167,
                total: 9.08442935394418,
            },
        },
    );
});

describe("Test difficulty calculation sample beatmap 4", () => {
    testDiffCalc("Ocelot - KAEDE (Hollow Wings) [EX EX]", {
        noMod: {
            aim: 4.4494924031152285,
            speed: 1.783689841991648,
            flashlight: 2.8603654043070934,
            total: 7.681057568488618,
        },
        doubleTime: {
            aim: 5.887959105522048,
            speed: 2.5524190587673803,
            flashlight: 3.7242470586790755,
            total: 10.200681821569491,
        },
    });
});

describe("Test difficulty calculation sample beatmap 5", () => {
    testDiffCalc(
        "m1dlet - Tell Me Why Speedcore Is So Awesome (None1637) [DROID Ultimate PP CS32 x2]",
        {
            noMod: {
                aim: 16.110600048617034,
                speed: 9.523913505173267,
                flashlight: 111.66679764219036,
                total: 28.75029635389631,
            },
            doubleTime: {
                aim: 20.47503244894906,
                speed: 11.34039592307657,
                flashlight: 126.07681557521249,
                total: 36.21373621493313,
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
            total: 0.1441920859453264,
        },
        doubleTime: {
            aim: 0,
            speed: 0.08561648653643154,
            flashlight: 0,
            total: 0.1678072676457166,
        },
    });
});

describe("Test difficulty calculation sample beatmap 7", () => {
    testDiffCalc("Camellia - crystallized (-ckopoctb-) [Emilia's C9H13NO3]", {
        noMod: {
            aim: 5.905755260491726,
            speed: 2.7283169169252974,
            flashlight: 4.004691799976666,
            total: 10.27335500962163,
        },
        doubleTime: {
            aim: 7.35538302364704,
            speed: 3.999593091025279,
            flashlight: 5.334676210648524,
            total: 12.985878171261373,
        },
    });
});
