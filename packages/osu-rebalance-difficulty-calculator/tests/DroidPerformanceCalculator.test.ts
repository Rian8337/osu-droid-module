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
} from "@rian8337/osu-base";
import { readFileSync } from "fs";
import { join } from "path";
import {
    DifficultyCalculationOptions,
    DroidDifficultyCalculator,
    DroidPerformanceCalculator,
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
    return new DroidDifficultyCalculator(beatmap).calculate(options);
};

const calculatePerformance = (
    calculator: DroidDifficultyCalculator,
    options?: PerformanceCalculationOptions
) => {
    return new DroidPerformanceCalculator(calculator).calculate(options);
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

        expect(performance.aim).toBeCloseTo(17.313250473522285, 5);
        expect(performance.tap).toBeCloseTo(13.123766516437668, 5);
        expect(performance.accuracy).toBeCloseTo(13.797682282371657, 5);
        expect(performance.flashlight).toBe(0);
        expect(performance.visual).toBeCloseTo(13.701269445658312, 5);
        expect(performance.total).toBeCloseTo(63.373971653682204, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.aim).toBeCloseTo(16.64639729456129, 5);
        expect(performance.tap).toBeCloseTo(12.384537370818084, 5);
        expect(performance.accuracy).toBeCloseTo(12.984300892290696, 5);
        expect(performance.flashlight).toBe(0);
        expect(performance.visual).toBeCloseTo(13.01855762445858, 5);
        expect(performance.total).toBeCloseTo(60.205064707536174, 5);
    });

    test("99% approximated", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                percent: 99,
                nobjects: mainBeatmap.hitObjects.objects.length,
            }),
        });

        expect(performance.aim).toBeCloseTo(17.137778340344695, 5);
        expect(performance.tap).toBeCloseTo(11.598880166543692, 5);
        expect(performance.accuracy).toBeCloseTo(9.537588955661478, 5);
        expect(performance.flashlight).toBe(0);
        expect(performance.visual).toBeCloseTo(12.62897435922127, 5);
        expect(performance.total).toBeCloseTo(55.775172353009786, 5);
    });

    test("10x100", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                n100: 10,
            }),
        });

        expect(performance.aim).toBeCloseTo(17.118281436658297, 5);
        expect(performance.tap).toBeCloseTo(11.438744909113167, 5);
        expect(performance.accuracy).toBeCloseTo(9.147691487325519, 5);
        expect(performance.flashlight).toBe(0);
        expect(performance.visual).toBeCloseTo(12.514491514219308, 5);
        expect(performance.total).toBeCloseTo(55.04133264640693, 5);
    });

    test("1.5 tap penalty", () => {
        const performance = calculatePerformance(difficulty, {
            tapPenalty: 1.5,
        });

        expect(performance.tap).toBeCloseTo(8.749177677625111, 5);
        expect(performance.total).toBeCloseTo(58.70982770353678, 5);
    });
});

describe("Test performance calculation with Hidden", () => {
    const difficulty = calculateDifficulty(mainBeatmap, {
        mods: [new ModHidden()],
    });

    test("SS", () => {
        const performance = calculatePerformance(difficulty);

        expect(performance.visual).toBeCloseTo(14.441001504690854, 5);
        expect(performance.total).toBeCloseTo(64.1797223001556, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.visual).toBeCloseTo(13.721430046271013, 5);
        expect(performance.total).toBeCloseTo(60.970680117011625, 5);
    });

    test("99% approximated", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                percent: 99,
                nobjects: mainBeatmap.hitObjects.objects.length,
            }),
        });

        expect(performance.visual).toBeCloseTo(13.310813165710568, 5);
        expect(performance.total).toBeCloseTo(56.521279830498244, 5);
    });

    test("10x100", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                n100: 10,
            }),
        });

        expect(performance.visual).toBeCloseTo(13.190149387548136, 5);
        expect(performance.total).toBeCloseTo(55.78098035642415, 5);
    });
});

describe("Test performance calculation with Flashlight", () => {
    const difficulty = calculateDifficulty(mainBeatmap, {
        mods: [new ModFlashlight()],
    });

    test("SS", () => {
        const performance = calculatePerformance(difficulty);

        expect(performance.flashlight).toBeCloseTo(5.049665728539405, 5);
        expect(performance.total).toBeCloseTo(68.17284104796431, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.flashlight).toBeCloseTo(4.859275717033319, 5);
        expect(performance.total).toBeCloseTo(64.82173514012031, 5);
    });

    test("99% approximated", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                percent: 99,
                nobjects: mainBeatmap.hitObjects.objects.length,
            }),
        });

        expect(performance.flashlight).toBeCloseTo(5.024076206266401, 5);
        expect(performance.total).toBeCloseTo(60.50705958365787, 5);
    });

    test("10x100", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                n100: 10,
            }),
        });

        expect(performance.flashlight).toBeCloseTo(5.0212329260138455, 5);
        expect(performance.total).toBeCloseTo(59.7673649772, 5);
    });
});

describe("Test performance calculation with Hidden, Flashlight", () => {
    const difficulty = calculateDifficulty(mainBeatmap, {
        mods: [new ModHidden(), new ModFlashlight()],
    });

    test("SS", () => {
        const performance = calculatePerformance(difficulty);

        expect(performance.flashlight).toBeCloseTo(6.916328185934696, 5);
        expect(performance.total).toBeCloseTo(70.82168597354152, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.flashlight).toBeCloseTo(6.655558488753008, 5);
        expect(performance.total).toBeCloseTo(67.36305888072454, 5);
    });

    test("99% approximated", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                percent: 99,
                nobjects: mainBeatmap.hitObjects.objects.length,
            }),
        });

        expect(performance.flashlight).toBeCloseTo(6.881279225533, 5);
        expect(performance.total).toBeCloseTo(63.1074158605238, 5);
    });

    test("10x100", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                n100: 10,
            }),
        });

        expect(performance.flashlight).toBeCloseTo(6.877384896599478, 5);
        expect(performance.total).toBeCloseTo(62.362331287623476, 5);
    });
});

describe("Test performance calculation with DoubleTime", () => {
    const difficulty = calculateDifficulty(mainBeatmap, {
        mods: [new ModDoubleTime()],
    });

    test("SS", () => {
        const performance = calculatePerformance(difficulty);

        expect(performance.aim).toBeCloseTo(42.02725334250858, 5);
        expect(performance.tap).toBeCloseTo(47.115302420891425, 5);
        expect(performance.accuracy).toBeCloseTo(45.13962922313779, 5);
        expect(performance.flashlight).toBe(0);
        expect(performance.visual).toBeCloseTo(18.14545128819464, 5);
        expect(performance.total).toBeCloseTo(167.52144126344444, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.aim).toBeCloseTo(40.40849275579425, 5);
        expect(performance.tap).toBeCloseTo(44.72170577977179, 5);
        expect(performance.accuracy).toBeCloseTo(42.4786218442272, 5);
        expect(performance.flashlight).toBe(0);
        expect(performance.visual).toBeCloseTo(17.24129316295027, 5);
        expect(performance.total).toBeCloseTo(159.19034195392487, 5);
    });

    test("99% approximated", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                percent: 99,
                nobjects: mainBeatmap.hitObjects.objects.length,
            }),
        });

        expect(performance.aim).toBeCloseTo(41.60130145052369, 5);
        expect(performance.tap).toBeCloseTo(43.138325244062834, 5);
        expect(performance.accuracy).toBeCloseTo(31.202575934894714, 5);
        expect(performance.flashlight).toBe(0);
        expect(performance.visual).toBeCloseTo(16.725343586883838, 5);
        expect(performance.total).toBeCloseTo(145.82904756002702, 5);
    });

    test("10x100", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                n100: 10,
            }),
        });

        expect(performance.aim).toBeCloseTo(41.55397346252537, 5);
        expect(performance.tap).toBeCloseTo(42.71205316385528, 5);
        expect(performance.accuracy).toBeCloseTo(29.927011909318374, 5);
        expect(performance.flashlight).toBe(0);
        expect(performance.visual).toBeCloseTo(16.573726768051383, 5);
        expect(performance.total).toBeCloseTo(143.7598653165196, 5);
    });

    test("1.5 tap penalty", () => {
        const performance = calculatePerformance(difficulty, {
            tapPenalty: 1.5,
        });

        expect(performance.tap).toBeCloseTo(31.410201613927615, 5);
        expect(performance.total).toBeCloseTo(150.2291418135146, 5);
    });
});

describe("Test performance calculation with Flashlight, Relax", () => {
    const difficulty = calculateDifficulty(mainBeatmap, {
        mods: [new ModFlashlight(), new ModRelax()],
    });

    test("SS", () => {
        const performance = calculatePerformance(difficulty);

        expect(performance.aim).toBeCloseTo(17.313250473522285, 5);
        expect(performance.tap).toBeCloseTo(0.00000964814814814815, 5);
        expect(performance.accuracy).toBe(0);
        expect(performance.flashlight).toBeCloseTo(3.1868428763914407, 5);
        expect(performance.visual).toBe(0);
        expect(performance.total).toBeCloseTo(17.13686507795333, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.aim).toBeCloseTo(16.64639729456129, 5);
        expect(performance.tap).toBeCloseTo(0.000009104691945736016, 5);
        expect(performance.accuracy).toBe(0);
        expect(performance.flashlight).toBeCloseTo(3.0666877840503575, 5);
        expect(performance.visual).toBe(0);
        expect(performance.total).toBeCloseTo(16.478680748023148, 5);
    });

    test("99% approximated", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                percent: 99,
                nobjects: mainBeatmap.hitObjects.objects.length,
            }),
        });

        expect(performance.aim).toBeCloseTo(12.231295477205938, 5);
        expect(performance.tap).toBeCloseTo(0.0000065347134883996845, 5);
        expect(performance.accuracy).toBe(0);
        expect(performance.flashlight).toBeCloseTo(2.429848860620635, 5);
        expect(performance.visual).toBe(0);
        expect(performance.total).toBeCloseTo(12.236179135112257, 5);
    });

    test("10x100", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                n100: 10,
            }),
        });

        expect(performance.aim).toBeCloseTo(11.46350455745296, 5);
        expect(performance.tap).toBeCloseTo(0.000006159718640801493, 5);
        expect(performance.accuracy).toBe(0);
        expect(performance.flashlight).toBeCloseTo(2.3211618360056083, 5);
        expect(performance.visual).toBe(0);
        expect(performance.total).toBeCloseTo(11.50002651947927, 5);
    });
});

describe("Test performance calculation with NoFail", () => {
    const difficulty = calculateDifficulty(mainBeatmap, {
        mods: [new ModNoFail()],
    });

    test("SS", () => {
        const performance = calculatePerformance(difficulty);

        expect(performance.total).toBeCloseTo(63.373971653682204, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.total).toBeCloseTo(59.000963413385456, 5);
    });

    test("99% approximated", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                percent: 99,
                nobjects: mainBeatmap.hitObjects.objects.length,
            }),
        });

        expect(performance.total).toBeCloseTo(55.775172353009786, 5);
    });

    test("10x100", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                n100: 10,
            }),
        });

        expect(performance.total).toBeCloseTo(55.04133264640693, 5);
    });

    test("1.5 tap penalty", () => {
        const performance = calculatePerformance(difficulty, {
            tapPenalty: 1.5,
        });

        expect(performance.total).toBeCloseTo(58.70982770353678, 5);
    });
});

describe("Test performance calculation with ScoreV2", () => {
    const difficulty = calculateDifficulty(mainBeatmap, {
        mods: [new ModScoreV2()],
    });

    test("SS", () => {
        const performance = calculatePerformance(difficulty);

        expect(performance.accuracy).toBeCloseTo(19.155029601507906, 5);
        expect(performance.total).toBeCloseTo(69.27694966116368, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.accuracy).toBeCloseTo(18.769694179956314, 5);
        expect(performance.total).toBeCloseTo(66.58426887408577, 5);
    });

    test("99% approximated", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                percent: 99,
                nobjects: mainBeatmap.hitObjects.objects.length,
            }),
        });

        expect(performance.accuracy).toBeCloseTo(16.947414434062768, 5);
        expect(performance.total).toBeCloseTo(63.840113347718905, 5);
    });

    test("10x100", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                n100: 10,
            }),
        });

        expect(performance.accuracy).toBeCloseTo(16.717102040250882, 5);
        expect(performance.total).toBeCloseTo(63.26857399993342, 5);
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
        expect(performance.tap).not.toBeNaN();
        expect(performance.accuracy).not.toBeNaN();
        expect(performance.flashlight).not.toBeNaN();
        expect(performance.visual).not.toBeNaN();
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
        expect(performance.tap).not.toBeNaN();
        expect(performance.accuracy).not.toBeNaN();
        expect(performance.flashlight).not.toBeNaN();
        expect(performance.visual).not.toBeNaN();
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
        tap: firstTap,
        flashlight: firstFlashlight,
    } = performance;

    // Intentionally set OD to negative.
    difficulty.beatmap.difficulty.od = -1;

    performance = calculatePerformance(difficulty);

    const {
        aim: secondAim,
        tap: secondTap,
        flashlight: secondFlashlight,
    } = performance;

    expect(secondAim).toBeLessThan(firstAim);
    expect(secondTap).toBeLessThan(firstTap);
    expect(secondFlashlight).toBeLessThan(firstFlashlight);
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
    expect(performance.tap).not.toBeNaN();
    expect(performance.accuracy).not.toBeNaN();
    expect(performance.flashlight).not.toBeNaN();
    expect(performance.visual).not.toBeNaN();
    expect(performance.total).not.toBeNaN();
});

test("Test string concatenation", () => {
    const performance = calculatePerformance(calculateDifficulty(mainBeatmap));

    expect(performance.toString()).toBe(
        "63.37 pp (17.31 aim, 13.12 tap, 13.80 acc, 0.00 flashlight, 13.70 visual)"
    );
});
