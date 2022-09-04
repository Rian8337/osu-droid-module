import {
    Accuracy,
    Beatmap,
    BeatmapDecoder,
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

        expect(performance.aim).toBeCloseTo(54.976092652113856, 5);
        expect(performance.speed).toBeCloseTo(28.660262165841882, 5);
        expect(performance.accuracy).toBeCloseTo(50.033224101740856, 5);
        expect(performance.flashlight).toBe(0);
        expect(performance.total).toBeCloseTo(135.95353664680246, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.aim).toBeCloseTo(52.85858258616851, 5);
        expect(performance.speed).toBeCloseTo(27.451734762333796, 5);
        expect(performance.accuracy).toBeCloseTo(44.30812282995342, 5);
        expect(performance.flashlight).toBe(0);
        expect(performance.total).toBeCloseTo(126.73228332305497, 5);
    });

    test("99% approximated", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                percent: 99,
                nobjects: mainBeatmap.hitObjects.objects.length,
            }),
        });

        expect(performance.aim).toBeCloseTo(54.41890252388297, 5);
        expect(performance.speed).toBeCloseTo(27.726934976455627, 5);
        expect(performance.accuracy).toBeCloseTo(23.90690809465712, 5);
        expect(performance.flashlight).toBe(0);
        expect(performance.total).toBeCloseTo(108.24130614508275, 5);
    });

    test("10x100", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                n100: 10,
            }),
        });

        expect(performance.aim).toBeCloseTo(54.35699250963509, 5);
        expect(performance.speed).toBeCloseTo(27.624549013324675, 5);
        expect(performance.accuracy).toBeCloseTo(21.992227901983032, 5);
        expect(performance.flashlight).toBe(0);
        expect(performance.total).toBeCloseTo(106.21552329920254, 5);
    });
});

describe("Test performance calculation with Hidden", () => {
    const difficulty = calculateDifficulty(mainBeatmap, {
        mods: [new ModHidden()],
    });

    test("SS", () => {
        const performance = calculatePerformance(difficulty);

        expect(performance.aim).toBeCloseTo(61.57322377036753, 5);
        expect(performance.speed).toBeCloseTo(32.09949362574291, 5);
        expect(performance.accuracy).toBeCloseTo(54.03588202988013, 5);
        expect(performance.total).toBeCloseTo(150.21890462919188, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.aim).toBeCloseTo(59.20161249650874, 5);
        expect(performance.speed).toBeCloseTo(30.745942933813854, 5);
        expect(performance.accuracy).toBeCloseTo(47.85277265634969, 5);
        expect(performance.total).toBeCloseTo(140.1349153901248, 5);
    });

    test("99% approximated", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                percent: 99,
                nobjects: mainBeatmap.hitObjects.objects.length,
            }),
        });

        expect(performance.aim).toBeCloseTo(60.94917082674894, 5);
        expect(performance.speed).toBeCloseTo(31.054167173630308, 5);
        expect(performance.accuracy).toBeCloseTo(25.81946074222969, 5);
        expect(performance.total).toBeCloseTo(120.30018655349934, 5);
    });

    test("10x100", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                n100: 10,
            }),
        });

        expect(performance.aim).toBeCloseTo(60.879831610791314, 5);
        expect(performance.speed).toBeCloseTo(30.93949489492364, 5);
        expect(performance.accuracy).toBeCloseTo(23.751606134141674, 5);
        expect(performance.flashlight).toBe(0);
        expect(performance.total).toBeCloseTo(118.11132917516717, 5);
    });
});

describe("Test performance calculation with Flashlight", () => {
    const difficulty = calculateDifficulty(mainBeatmap, {
        mods: [new ModFlashlight()],
    });

    test("SS", () => {
        const performance = calculatePerformance(difficulty);

        expect(performance.flashlight).toBeCloseTo(54.31954516542774, 5);
        expect(performance.total).toBeCloseTo(187.14337328288548, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.flashlight).toBeCloseTo(52.27150884282495, 5);
        expect(performance.total).toBeCloseTo(176.0389920294359, 5);
    });

    test("99% approximated", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                percent: 99,
                nobjects: mainBeatmap.hitObjects.objects.length,
            }),
        });

        expect(performance.flashlight).toBeCloseTo(54.044277200062396, 5);
        expect(performance.total).toBeCloseTo(159.55322745963463, 5);
    });

    test("10x100", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                n100: 10,
            }),
        });

        expect(performance.flashlight).toBeCloseTo(54.01369187057736, 5);
        expect(performance.total).toBeCloseTo(157.53466143961464, 5);
    });
});

describe("Test performance calculation with TouchDevice, Flashlight", () => {
    const difficulty = calculateDifficulty(mainBeatmap, {
        mods: [new ModTouchDevice(), new ModFlashlight()],
    });

    test("SS", () => {
        const performance = calculatePerformance(difficulty);

        expect(performance.aim).toBeCloseTo(32.244118527744696, 5);
        expect(performance.flashlight).toBeCloseTo(46.562678449743366, 5);
        expect(performance.total).toBeCloseTo(156.9440402648235, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.aim).toBeCloseTo(31.00217421602197, 5);
        expect(performance.flashlight).toBeCloseTo(44.80710305874318, 5);
        expect(performance.total).toBeCloseTo(146.9257002912713, 5);
    });

    test("99% approximated", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                percent: 99,
                nobjects: mainBeatmap.hitObjects.objects.length,
            }),
        });

        expect(performance.aim).toBeCloseTo(31.91732002915269, 5);
        expect(performance.flashlight).toBeCloseTo(46.326718930572376, 5);
        expect(performance.total).toBeCloseTo(129.11570936248526, 5);
    });

    test("10x100", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                n100: 10,
            }),
        });

        expect(performance.aim).toBeCloseTo(31.881009084864687, 5);
        expect(performance.flashlight).toBeCloseTo(46.300501206220034, 5);
        expect(performance.total).toBeCloseTo(127.08717635419622, 5);
    });
});

describe("Test performance calculation with Hidden, Flashlight", () => {
    const difficulty = calculateDifficulty(mainBeatmap, {
        mods: [new ModHidden(), new ModFlashlight()],
    });

    test("SS", () => {
        const performance = calculatePerformance(difficulty);

        expect(performance.flashlight).toBeCloseTo(70.61540871505606, 5);
        expect(performance.total).toBeCloseTo(217.42125340903524, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.flashlight).toBeCloseTo(67.95296149567244, 5);
        expect(performance.total).toBeCloseTo(204.87636886494772, 5);
    });

    test("99% approximated", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                percent: 99,
                nobjects: mainBeatmap.hitObjects.objects.length,
            }),
        });

        expect(performance.flashlight).toBeCloseTo(70.25756036008111, 5);
        expect(performance.total).toBeCloseTo(187.7278816366729, 5);
    });

    test("10x100", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                n100: 10,
            }),
        });

        expect(performance.flashlight).toBeCloseTo(70.21779943175056, 5);
        expect(performance.total).toBeCloseTo(185.55199290755706, 5);
    });
});

describe("Test performance calculation with DoubleTime", () => {
    const difficulty = calculateDifficulty(mainBeatmap, {
        mods: [new ModDoubleTime()],
    });

    test("SS", () => {
        const performance = calculatePerformance(difficulty);

        expect(performance.aim).toBeCloseTo(146.16387400599763, 5);
        expect(performance.speed).toBeCloseTo(90.23236887999639, 5);
        expect(performance.accuracy).toBeCloseTo(105.52697492311131, 5);
        expect(performance.flashlight).toBe(0);
        expect(performance.total).toBeCloseTo(347.2814696873974, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.aim).toBeCloseTo(140.53409095750433, 5);
        expect(performance.speed).toBeCloseTo(86.55748709361, 5);
        expect(performance.accuracy).toBeCloseTo(93.45194619596668, 5);
        expect(performance.flashlight).toBe(0);
        expect(performance.total).toBeCloseTo(325.6752447165502, 5);
    });

    test("99% approximated", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                percent: 99,
                nobjects: mainBeatmap.hitObjects.objects.length,
            }),
        });

        expect(performance.aim).toBeCloseTo(144.682483391072, 5);
        expect(performance.speed).toBeCloseTo(88.08796749595666, 5);
        expect(performance.accuracy).toBeCloseTo(50.422968663061425, 5);
        expect(performance.flashlight).toBe(0);
        expect(performance.total).toBeCloseTo(289.46098150288475, 5);
    });

    test("10x100", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                n100: 10,
            }),
        });

        expect(performance.aim).toBeCloseTo(144.517884433858, 5);
        expect(performance.speed).toBeCloseTo(87.8515346512233, 5);
        expect(performance.accuracy).toBeCloseTo(46.38464388376609, 5);
        expect(performance.flashlight).toBe(0);
        expect(performance.total).toBeCloseTo(285.2209215057409, 5);
    });
});

describe("Test performance calculation with Relax", () => {
    const difficulty = calculateDifficulty(mainBeatmap, {
        mods: [new ModRelax()],
    });

    test("SS", () => {
        const performance = calculatePerformance(difficulty);

        expect(performance.aim).toBeCloseTo(54.976092652113856, 5);
        expect(performance.speed).toBeCloseTo(0.00000964814814814815, 5);
        expect(performance.accuracy).toBe(0);
        expect(performance.flashlight).toBe(0);
        expect(performance.total).toBeCloseTo(36.943935708175204, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.aim).toBeCloseTo(52.85858258616851, 5);
        expect(performance.speed).toBeCloseTo(0.000009068490964122712, 5);
        expect(performance.accuracy).toBe(0);
        expect(performance.flashlight).toBe(0);
        expect(performance.total).toBeCloseTo(35.520968882361124, 5);
    });

    test("99% approximated", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                percent: 99,
                nobjects: mainBeatmap.hitObjects.objects.length,
            }),
        });

        expect(performance.aim).toBeCloseTo(36.902836823857136, 5);
        expect(performance.speed).toBeCloseTo(0.00000614955234821296, 5);
        expect(performance.accuracy).toBe(0);
        expect(performance.flashlight).toBe(0);
        expect(performance.total).toBeCloseTo(24.798707385937625, 5);
    });

    test("10x100", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                n100: 10,
            }),
        });

        expect(performance.aim).toBeCloseTo(34.21947165809527, 5);
        expect(performance.speed).toBeCloseTo(0.000007478341959201838, 5);
        expect(performance.accuracy).toBe(0);
        expect(performance.flashlight).toBe(0);
        expect(performance.total).toBeCloseTo(22.995485939918133, 5);
    });
});

describe("Test performance calculation with NoFail", () => {
    const difficulty = calculateDifficulty(mainBeatmap, {
        mods: [new ModNoFail()],
    });

    test("SS", () => {
        const performance = calculatePerformance(difficulty);

        expect(performance.total).toBeCloseTo(135.95353664680246, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.total).toBeCloseTo(124.19763765659388, 5);
    });

    test("99% approximated", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                percent: 99,
                nobjects: mainBeatmap.hitObjects.objects.length,
            }),
        });

        expect(performance.total).toBeCloseTo(108.24130614508275, 5);
    });

    test("10x100", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                n100: 10,
            }),
        });

        expect(performance.total).toBeCloseTo(106.21552329920254, 5);
    });
});

describe("Test performance calculation with SpunOut", () => {
    const difficulty = calculateDifficulty(mainBeatmap, {
        mods: [new ModSpunOut()],
    });

    test("SS", () => {
        const performance = calculatePerformance(difficulty);

        expect(performance.total).toBeCloseTo(135.35523932479032, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.total).toBeCloseTo(126.17456641774453, 5);
    });

    test("99% approximated", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                percent: 99,
                nobjects: mainBeatmap.hitObjects.objects.length,
            }),
        });

        expect(performance.total).toBeCloseTo(107.76496337978978, 5);
    });

    test("10x100", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                n100: 10,
            }),
        });

        expect(performance.total).toBeCloseTo(105.7480954947231, 5);
    });
});

describe("Test performance calculation with ScoreV2", () => {
    const difficulty = calculateDifficulty(mainBeatmap, {
        mods: [new ModScoreV2()],
    });

    test("SS", () => {
        const performance = calculatePerformance(difficulty);

        expect(performance.accuracy).toBeCloseTo(69.46006358996907, 5);
        expect(performance.total).toBeCloseTo(156.0718578742609, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.accuracy).toBeCloseTo(66.6935622754495, 5);
        expect(performance.total).toBeCloseTo(149.86524223289516, 5);
    });

    test("99% approximated", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                percent: 99,
                nobjects: mainBeatmap.hitObjects.objects.length,
            }),
        });

        expect(performance.accuracy).toBeCloseTo(54.372139363835146, 5);
        expect(performance.total).toBeCloseTo(138.93693339789374, 5);
    });

    test("10x100", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                n100: 10,
            }),
        });

        expect(performance.accuracy).toBeCloseTo(52.90436529080426, 5);
        expect(performance.total).toBeCloseTo(137.26167783616964, 5);
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

    expect(performance.aim).toBeCloseTo(141.45653585707328, 5);
    expect(performance.speed).toBeCloseTo(168.82433560258056, 5);
    expect(performance.accuracy).toBeCloseTo(140.70696717850745, 5);
    expect(performance.total).toBeCloseTo(457.26695389770947, 5);
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

    expect(performance.aim).toBeCloseTo(54.976092652113856, 5);
    expect(performance.speed).toBeCloseTo(28.660262165841882, 5);
    expect(performance.accuracy).toBeCloseTo(50.033224101740856, 5);
    expect(performance.flashlight).toBe(0);
    expect(performance.total).toBeCloseTo(135.95353664680246, 5);

    expect(performance.toString()).toBe(
        "135.95 pp (54.98 aim, 28.66 speed, 50.03 acc, 0.00 flashlight)"
    );
});
