import {
    Accuracy,
    Beatmap,
    BeatmapDecoder,
    MapStats,
    ModDoubleTime,
    ModFlashlight,
    ModHidden,
    ModNoFail,
    ModRelax,
    ModScoreV2,
    ModSpunOut,
    ModTouchDevice,
} from "@rian8337/osu-base";
import { readFileSync } from "fs";
import { join } from "path";
import {
    DifficultyCalculationOptions,
    OsuDifficultyCalculator,
    OsuPerformanceCalculator,
    PerformanceCalculationOptions,
} from "../src";

const getBeatmapData = (path: string) => {
    return readFileSync(
        join(process.cwd(), "tests", "files", "beatmaps", path),
        { encoding: "utf-8" }
    );
};

const calculateDifficulty = (
    beatmap: Beatmap,
    options?: DifficultyCalculationOptions
) => {
    return new OsuDifficultyCalculator(beatmap).calculate(options);
};

const calculatePerformance = (
    calculator: OsuDifficultyCalculator,
    options?: PerformanceCalculationOptions
) => {
    return new OsuPerformanceCalculator(calculator).calculate(options);
};

const decoder = new BeatmapDecoder();

const mainBeatmap = decoder.decode(
    getBeatmapData(
        "YOASOBI - Love Letter (ohm002) [Please accept my overflowing emotions.].osu"
    )
).result;

const spinnerOnlyBeatmap = decoder.decode(
    getBeatmapData("Calculate SPM - Spinner Test (Ash Marley) [Easy].osu")
).result;

describe("Test performance calculation with NoMod", () => {
    const difficulty = calculateDifficulty(mainBeatmap);

    test("SS", () => {
        const performance = calculatePerformance(difficulty);

        expect(performance.aim).toBeCloseTo(55.223763700576384, 5);
        expect(performance.speed).toBeCloseTo(26.15662295508095, 5);
        expect(performance.accuracy).toBeCloseTo(50.033224101740856, 5);
        expect(performance.flashlight).toBe(0);
        expect(performance.total).toBeCloseTo(133.79185435795395, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.aim).toBeCloseTo(53.09671410730447, 5);
        expect(performance.speed).toBeCloseTo(24.861031236236244, 5);
        expect(performance.accuracy).toBeCloseTo(44.30812282995342, 5);
        expect(performance.flashlight).toBe(0);
        expect(performance.total).toBeCloseTo(124.47130154021085, 5);
    });

    test("99% approximated", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                percent: 99,
                nobjects: mainBeatmap.hitObjects.objects.length,
            }),
        });

        expect(performance.aim).toBeCloseTo(54.66406339280028, 5);
        expect(performance.speed).toBeCloseTo(24.143265115999064, 5);
        expect(performance.accuracy).toBeCloseTo(23.90690809465712, 5);
        expect(performance.flashlight).toBe(0);
        expect(performance.total).toBeCloseTo(104.97691970157544, 5);
    });

    test("10x100", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                n100: 10,
            }),
        });

        expect(performance.aim).toBeCloseTo(54.60187446971404, 5);
        expect(performance.speed).toBeCloseTo(23.926406295479588, 5);
        expect(performance.accuracy).toBeCloseTo(21.992227901983032, 5);
        expect(performance.flashlight).toBe(0);
        expect(performance.total).toBeCloseTo(102.83383467902095, 5);
    });
});

describe("Test performance calculation with Hidden", () => {
    const difficulty = calculateDifficulty(mainBeatmap, {
        mods: [new ModHidden()],
    });

    test("SS", () => {
        const performance = calculatePerformance(difficulty);

        expect(performance.aim).toBeCloseTo(61.85061534464556, 5);
        expect(performance.speed).toBeCloseTo(29.295417709690668, 5);
        expect(performance.accuracy).toBeCloseTo(54.03588202988013, 5);
        expect(performance.total).toBeCloseTo(147.79450882287804, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.aim).toBeCloseTo(59.468319800181014, 5);
        expect(performance.speed).toBeCloseTo(27.844354984584594, 5);
        expect(performance.accuracy).toBeCloseTo(47.85277265634969, 5);
        expect(performance.total).toBeCloseTo(137.59933991910478, 5);
    });

    test("99% approximated", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                percent: 99,
                nobjects: mainBeatmap.hitObjects.objects.length,
            }),
        });

        expect(performance.aim).toBeCloseTo(61.223750999936314, 5);
        expect(performance.speed).toBeCloseTo(27.040456929918953, 5);
        expect(performance.accuracy).toBeCloseTo(25.81946074222969, 5);
        expect(performance.total).toBeCloseTo(116.64120891409407, 5);
    });

    test("10x100", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                n100: 10,
            }),
        });

        expect(performance.aim).toBeCloseTo(61.15409940607973, 5);
        expect(performance.speed).toBeCloseTo(26.79757505093714, 5);
        expect(performance.accuracy).toBeCloseTo(23.751606134141674, 5);
        expect(performance.total).toBeCloseTo(114.3210719391834, 5);
    });
});

describe("Test performance calculation with Flashlight", () => {
    const difficulty = calculateDifficulty(mainBeatmap, {
        mods: [new ModFlashlight()],
    });

    test("SS", () => {
        const performance = calculatePerformance(difficulty);

        expect(performance.flashlight).toBeCloseTo(61.538165729188705, 5);
        expect(performance.total).toBeCloseTo(192.31604105394607, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.flashlight).toBeCloseTo(59.21796223234604, 5);
        expect(performance.total).toBeCloseTo(180.8600567797021, 5);
    });

    test("99% approximated", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                percent: 99,
                nobjects: mainBeatmap.hitObjects.objects.length,
            }),
        });

        expect(performance.flashlight).toBeCloseTo(61.22631691637187, 5);
        expect(performance.total).toBeCloseTo(163.7598716064098, 5);
    });

    test("10x100", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                n100: 10,
            }),
        });

        expect(performance.flashlight).toBeCloseTo(61.19166704828111, 5);
        expect(performance.total).toBeCloseTo(161.63590396106613, 5);
    });
});

describe("Test performance calculation with TouchDevice, Flashlight", () => {
    const difficulty = calculateDifficulty(mainBeatmap, {
        mods: [new ModTouchDevice(), new ModFlashlight()],
    });

    test("SS", () => {
        const performance = calculatePerformance(difficulty);

        expect(performance.aim).toBeCloseTo(32.360789778121806, 5);
        expect(performance.flashlight).toBeCloseTo(51.45039251291363, 5);
        expect(performance.total).toBeCloseTo(159.60091282933348, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.aim).toBeCloseTo(31.114351648538225, 5);
        expect(performance.flashlight).toBeCloseTo(49.510533253089, 5);
        expect(performance.total).toBeCloseTo(149.31852876616767, 5);
    });

    test("99% approximated", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                percent: 99,
                nobjects: mainBeatmap.hitObjects.objects.length,
            }),
        });

        expect(performance.aim).toBeCloseTo(32.032808800640844, 5);
        expect(performance.flashlight).toBeCloseTo(51.189664172476576, 5);
        expect(performance.total).toBeCloseTo(130.76844622665507, 5);
    });

    test("10x100", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                n100: 10,
            }),
        });

        expect(performance.aim).toBeCloseTo(31.996366469809622, 5);
        expect(performance.flashlight).toBeCloseTo(51.160694356872455, 5);
        expect(performance.total).toBeCloseTo(128.63101184750408, 5);
    });
});

describe("Test performance calculation with Hidden, Flashlight", () => {
    const difficulty = calculateDifficulty(mainBeatmap, {
        mods: [new ModHidden(), new ModFlashlight()],
    });

    test("SS", () => {
        const performance = calculatePerformance(difficulty);

        expect(performance.flashlight).toBeCloseTo(75.5966686916786, 5);
        expect(performance.total).toBeCloseTo(220.14489379940778, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.flashlight).toBeCloseTo(72.74641059623957, 5);
        expect(performance.total).toBeCloseTo(207.31536164613684, 5);
    });

    test("99% approximated", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                percent: 99,
                nobjects: mainBeatmap.hitObjects.objects.length,
            }),
        });

        expect(performance.flashlight).toBeCloseTo(75.2135774652005, 5);
        expect(performance.total).toBeCloseTo(189.33891317946123, 5);
    });

    test("10x100", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                n100: 10,
            }),
        });

        expect(performance.flashlight).toBeCloseTo(75.1710117733696, 5);
        expect(performance.total).toBeCloseTo(187.04325238358294, 5);
    });
});

describe("Test performance calculation with DoubleTime", () => {
    const difficulty = calculateDifficulty(mainBeatmap, {
        mods: [new ModDoubleTime()],
    });

    test("SS", () => {
        const performance = calculatePerformance(difficulty);

        expect(performance.aim).toBeCloseTo(146.34264658610633, 5);
        expect(performance.speed).toBeCloseTo(81.35451283583839, 5);
        expect(performance.accuracy).toBeCloseTo(105.52697492311131, 5);
        expect(performance.flashlight).toBe(0);
        expect(performance.total).toBeCloseTo(338.7125984130118, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.aim).toBeCloseTo(140.70597776746038, 5);
        expect(performance.speed).toBeCloseTo(77.70576359899255, 5);
        expect(performance.accuracy).toBeCloseTo(93.45194619596668, 5);
        expect(performance.flashlight).toBe(0);
        expect(performance.total).toBeCloseTo(317.10673118772627, 5);
    });

    test("99% approximated", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                percent: 99,
                nobjects: mainBeatmap.hitObjects.objects.length,
            }),
        });

        expect(performance.aim).toBeCloseTo(144.85944408692282, 5);
        expect(performance.speed).toBeCloseTo(77.36836460537589, 5);
        expect(performance.accuracy).toBeCloseTo(50.422968663061425, 5);
        expect(performance.flashlight).toBe(0);
        expect(performance.total).toBeCloseTo(278.91593237927196, 5);
    });

    test("10x100", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                n100: 10,
            }),
        });

        expect(performance.aim).toBeCloseTo(144.69464380923574, 5);
        expect(performance.speed).toBeCloseTo(76.93257380235974, 5);
        expect(performance.accuracy).toBeCloseTo(46.38464388376609, 5);
        expect(performance.flashlight).toBe(0);
        expect(performance.total).toBeCloseTo(274.4639540602161, 5);
    });
});

describe("Test performance calculation with Relax", () => {
    const difficulty = calculateDifficulty(mainBeatmap, {
        mods: [new ModRelax()],
    });

    test("SS", () => {
        const performance = calculatePerformance(difficulty);

        expect(performance.aim).toBeCloseTo(39.9478933083899, 5);
        expect(performance.speed).toBe(0);
        expect(performance.accuracy).toBe(0);
        expect(performance.flashlight).toBe(0);
        expect(performance.total).toBeCloseTo(44.7416405053967, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.aim).toBeCloseTo(38.40922327723457, 5);
        expect(performance.speed).toBe(0);
        expect(performance.accuracy).toBe(0);
        expect(performance.flashlight).toBe(0);
        expect(performance.total).toBeCloseTo(43.01833007050273, 5);
    });

    test("99% approximated", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                percent: 99,
                nobjects: mainBeatmap.hitObjects.objects.length,
            }),
        });

        expect(performance.aim).toBeCloseTo(33.20969432081751, 5);
        expect(performance.speed).toBe(0);
        expect(performance.accuracy).toBe(0);
        expect(performance.flashlight).toBe(0);
        expect(performance.total).toBeCloseTo(37.19485763931562, 5);
    });

    test("10x100", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                n100: 10,
            }),
        });

        expect(performance.aim).toBeCloseTo(32.1970105450352, 5);
        expect(performance.speed).toBe(0);
        expect(performance.accuracy).toBe(0);
        expect(performance.flashlight).toBe(0);
        expect(performance.total).toBeCloseTo(36.06065181043943, 5);
    });
});

describe("Test performance calculation with NoFail", () => {
    const difficulty = calculateDifficulty(mainBeatmap, {
        mods: [new ModNoFail()],
    });

    test("SS", () => {
        const performance = calculatePerformance(difficulty);

        expect(performance.total).toBeCloseTo(133.79185435795395, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.total).toBeCloseTo(121.98187550940663, 5);
    });

    test("99% approximated", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                percent: 99,
                nobjects: mainBeatmap.hitObjects.objects.length,
            }),
        });

        expect(performance.total).toBeCloseTo(104.97691970157544, 5);
    });

    test("10x100", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                n100: 10,
            }),
        });

        expect(performance.total).toBeCloseTo(102.83383467902095, 5);
    });
});

describe("Test performance calculation with SpunOut", () => {
    const difficulty = calculateDifficulty(mainBeatmap, {
        mods: [new ModSpunOut()],
    });

    test("SS", () => {
        const performance = calculatePerformance(difficulty);

        expect(performance.total).toBeCloseTo(133.2030700560247, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.total).toBeCloseTo(123.92353464708219, 5);
    });

    test("99% approximated", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                percent: 99,
                nobjects: mainBeatmap.hitObjects.objects.length,
            }),
        });

        expect(performance.total).toBeCloseTo(104.51494268001619, 5);
    });

    test("10x100", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                n100: 10,
            }),
        });

        expect(performance.total).toBeCloseTo(102.38128883565291, 5);
    });
});

describe("Test performance calculation with ScoreV2", () => {
    const difficulty = calculateDifficulty(mainBeatmap, {
        mods: [new ModScoreV2()],
    });

    test("SS", () => {
        const performance = calculatePerformance(difficulty);

        expect(performance.accuracy).toBeCloseTo(69.46006358996907, 5);
        expect(performance.total).toBeCloseTo(153.9400438223428, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.accuracy).toBeCloseTo(66.6935622754495, 5);
        expect(performance.total).toBeCloseTo(147.64218982859256, 5);
    });

    test("99% approximated", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                percent: 99,
                nobjects: mainBeatmap.hitObjects.objects.length,
            }),
        });

        expect(performance.accuracy).toBeCloseTo(54.372139363835146, 5);
        expect(performance.total).toBeCloseTo(135.75421012404402, 5);
    });

    test("10x100", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                n100: 10,
            }),
        });

        expect(performance.accuracy).toBeCloseTo(52.90436529080426, 5);
        expect(performance.total).toBeCloseTo(133.96691461530153, 5);
    });
});

describe("Test performance calculation with custom statistics", () => {
    // These tests can be removed in 3.0.
    test("Empty custom statistics", () => {
        const performance = calculatePerformance(
            calculateDifficulty(mainBeatmap),
            {
                stats: new MapStats({
                    ar: 9,
                    isForceAR: true,
                    speedMultiplier: 1.25,
                    oldStatistics: false,
                }),
            }
        );

        expect(performance.aim).not.toBeNaN();
        expect(performance.speed).not.toBeNaN();
        expect(performance.accuracy).not.toBeNaN();
        expect(performance.flashlight).not.toBeNaN();
        expect(performance.total).not.toBeNaN();
    });

    test("Not empty custom statistics", () => {
        const performance = calculatePerformance(
            calculateDifficulty(mainBeatmap),
            {
                stats: new MapStats(),
            }
        );

        expect(performance.aim).not.toBeNaN();
        expect(performance.speed).not.toBeNaN();
        expect(performance.accuracy).not.toBeNaN();
        expect(performance.flashlight).not.toBeNaN();
        expect(performance.total).not.toBeNaN();
    });
});

test("Test negative OD performance calculation", () => {
    const difficulty = calculateDifficulty(mainBeatmap, {
        mods: [new ModFlashlight()],
    });

    difficulty.beatmap.difficulty.od = 1;

    let performance = calculatePerformance(difficulty);

    const {
        aim: firstAim,
        speed: firstSpeed,
        flashlight: firstFlashlight,
    } = performance;

    // Intentionally set OD to negative.
    difficulty.beatmap.difficulty.od = -1;

    performance = calculatePerformance(difficulty);

    const {
        aim: secondAim,
        speed: secondSpeed,
        flashlight: secondFlashlight,
    } = performance;

    expect(secondAim).toBeCloseTo(firstAim);
    expect(secondSpeed).toBeCloseTo(firstSpeed);
    expect(secondFlashlight).toBeCloseTo(firstFlashlight);
});

test("Test long beatmap length bonus", () => {
    const performance = calculatePerformance(
        calculateDifficulty(
            decoder.decode(
                getBeatmapData(
                    "DragonForce - Through the Fire and Flames (Ponoyoshi) [Myth].osu"
                )
            ).result
        )
    );

    expect(performance.aim).toBeCloseTo(142.71216523111306, 5);
    expect(performance.speed).toBeCloseTo(167.49667205214175, 5);
    expect(performance.accuracy).toBeCloseTo(140.70696717850745, 5);
    expect(performance.total).toBeCloseTo(457.1716197525016, 5);
});

test("Test spinner-only beatmap performance calculation", () => {
    const performance = calculatePerformance(
        calculateDifficulty(spinnerOnlyBeatmap, {
            mods: [new ModFlashlight()],
        })
    );

    expect(performance.accuracy).toBe(0);
});

test("Test effective miss count approximation", () => {
    const performance = calculatePerformance(calculateDifficulty(mainBeatmap), {
        combo: 50,
    });

    expect(performance.aim).not.toBeNaN();
    expect(performance.speed).not.toBeNaN();
    expect(performance.accuracy).not.toBeNaN();
    expect(performance.flashlight).not.toBeNaN();
    expect(performance.total).not.toBeNaN();
});

test("Test string concatenation", () => {
    const performance = calculatePerformance(calculateDifficulty(mainBeatmap));

    expect(performance.aim).toBeCloseTo(55.223763700576384, 5);
    expect(performance.speed).toBeCloseTo(26.15662295508095, 5);
    expect(performance.accuracy).toBeCloseTo(50.033224101740856, 5);
    expect(performance.flashlight).toBe(0);
    expect(performance.total).toBeCloseTo(133.79185435795395, 5);

    expect(performance.toString()).toBe(
        "133.79 pp (55.22 aim, 26.16 speed, 50.03 acc, 0.00 flashlight)"
    );
});
