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

        expect(performance.aim).toBeCloseTo(16.5332457857454, 5);
        expect(performance.tap).toBeCloseTo(13.123766516437668, 5);
        expect(performance.accuracy).toBeCloseTo(13.797682282371657, 5);
        expect(performance.flashlight).toBe(0);
        expect(performance.visual).toBeCloseTo(27.149798544590933, 5);
        expect(performance.total).toBeCloseTo(77.54833913279873, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.aim).toBeCloseTo(15.896435989247099, 5);
        expect(performance.tap).toBeCloseTo(12.384537370818084, 5);
        expect(performance.accuracy).toBeCloseTo(12.984300892290696, 5);
        expect(performance.flashlight).toBe(0);
        expect(performance.visual).toBeCloseTo(25.796968539816664, 5);
        expect(performance.total).toBeCloseTo(73.66280182497636, 5);
    });

    test("99% approximated", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                percent: 99,
                nobjects: mainBeatmap.hitObjects.objects.length,
            }),
        });

        expect(performance.aim).toBeCloseTo(16.365679105484467, 5);
        expect(performance.tap).toBeCloseTo(11.598880166543692, 5);
        expect(performance.accuracy).toBeCloseTo(9.537588955661478, 5);
        expect(performance.flashlight).toBe(0);
        expect(performance.visual).toBeCloseTo(25.024988453629206, 5);
        expect(performance.total).toBeCloseTo(68.8300800884626, 5);
    });

    test("10x100", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                n100: 10,
            }),
        });

        expect(performance.aim).toBeCloseTo(16.347060585455477, 5);
        expect(performance.tap).toBeCloseTo(11.438744909113167, 5);
        expect(performance.accuracy).toBeCloseTo(9.147691487325519, 5);
        expect(performance.flashlight).toBe(0);
        expect(performance.visual).toBeCloseTo(24.798134570422068, 5);
        expect(performance.total).toBeCloseTo(67.97524435912858, 5);
    });

    test("1.5 tap penalty", () => {
        const performance = calculatePerformance(difficulty, {
            tapPenalty: 1.5,
        });

        expect(performance.tap).toBeCloseTo(8.749177677625111, 5);
        expect(performance.total).toBeCloseTo(72.98090652903778, 5);
    });
});

describe("Test performance calculation with Hidden", () => {
    const difficulty = calculateDifficulty(mainBeatmap, {
        mods: [new ModHidden()],
    });

    test("SS", () => {
        const performance = calculatePerformance(difficulty);

        expect(performance.accuracy).toBeCloseTo(14.90149686496139, 5);
        expect(performance.visual).toBeCloseTo(36.351952144791305, 5);
        expect(performance.total).toBeCloseTo(89.30379990176435, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.accuracy).toBeCloseTo(14.023044963673952, 5);
        expect(performance.visual).toBeCloseTo(34.540593894275304, 5);
        expect(performance.total).toBeCloseTo(84.82112487735291, 5);
    });

    test("99% approximated", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                percent: 99,
                nobjects: mainBeatmap.hitObjects.objects.length,
            }),
        });

        expect(performance.accuracy).toBeCloseTo(10.300596072114397, 5);
        expect(performance.visual).toBeCloseTo(33.50695885261091, 5);
        expect(performance.total).toBeCloseTo(79.41106255207474, 5);
    });

    test("10x100", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                n100: 10,
            }),
        });

        expect(performance.accuracy).toBeCloseTo(9.87950680631156, 5);
        expect(performance.visual).toBeCloseTo(33.20321510686407, 5);
        expect(performance.total).toBeCloseTo(78.43615221607611, 5);
    });
});

describe("Test performance calculation with Flashlight", () => {
    const difficulty = calculateDifficulty(mainBeatmap, {
        mods: [new ModFlashlight()],
    });

    test("SS", () => {
        const performance = calculatePerformance(difficulty);

        expect(performance.flashlight).toBeCloseTo(5.049665728539405, 5);
        expect(performance.total).toBeCloseTo(82.2547023189771, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.flashlight).toBeCloseTo(4.859275717033319, 5);
        expect(performance.total).toBeCloseTo(78.19056444074147, 5);
    });

    test("99% approximated", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                percent: 99,
                nobjects: mainBeatmap.hitObjects.objects.length,
            }),
        });

        expect(performance.flashlight).toBeCloseTo(5.024076206266401, 5);
        expect(performance.total).toBeCloseTo(73.46734754816, 5);
    });

    test("10x100", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                n100: 10,
            }),
        });

        expect(performance.flashlight).toBeCloseTo(5.0212329260138455, 5);
        expect(performance.total).toBeCloseTo(72.60648457017079, 5);
    });
});

describe("Test performance calculation with Hidden, Flashlight", () => {
    const difficulty = calculateDifficulty(mainBeatmap, {
        mods: [new ModHidden(), new ModFlashlight()],
    });

    test("SS", () => {
        const performance = calculatePerformance(difficulty);

        expect(performance.flashlight).toBeCloseTo(6.916328185934696, 5);
        expect(performance.total).toBeCloseTo(95.76496220269205, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.flashlight).toBeCloseTo(6.655558488753008, 5);
        expect(performance.total).toBeCloseTo(91.03916328041235, 5);
    });

    test("99% approximated", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                percent: 99,
                nobjects: mainBeatmap.hitObjects.objects.length,
            }),
        });

        expect(performance.flashlight).toBeCloseTo(6.881279225533, 5);
        expect(performance.total).toBeCloseTo(85.80502909679991, 5);
    });

    test("10x100", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                n100: 10,
            }),
        });

        expect(performance.flashlight).toBeCloseTo(6.877384896599478, 5);
        expect(performance.total).toBeCloseTo(84.8243546575712, 5);
    });
});

describe("Test performance calculation with DoubleTime", () => {
    const difficulty = calculateDifficulty(mainBeatmap, {
        mods: [new ModDoubleTime()],
    });

    test("SS", () => {
        const performance = calculatePerformance(difficulty);

        expect(performance.aim).toBeCloseTo(40.2051318156521, 5);
        expect(performance.tap).toBeCloseTo(47.115302420891425, 5);
        expect(performance.accuracy).toBeCloseTo(45.13962922313779, 5);
        expect(performance.flashlight).toBe(0);
        expect(performance.visual).toBeCloseTo(46.78766155019281, 5);
        expect(performance.total).toBeCloseTo(195.98673083545236, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.aim).toBeCloseTo(38.65655374807223, 5);
        expect(performance.tap).toBeCloseTo(44.72170577977179, 5);
        expect(performance.accuracy).toBeCloseTo(42.4786218442272, 5);
        expect(performance.flashlight).toBe(0);
        expect(performance.visual).toBeCloseTo(44.45630898805992, 5);
        expect(performance.total).toBeCloseTo(186.21241444514882, 5);
    });

    test("99% approximated", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                percent: 99,
                nobjects: mainBeatmap.hitObjects.objects.length,
            }),
        });

        expect(performance.aim).toBeCloseTo(39.79764737157455, 5);
        expect(performance.tap).toBeCloseTo(43.138325244062834, 5);
        expect(performance.accuracy).toBeCloseTo(31.202575934894714, 5);
        expect(performance.flashlight).toBe(0);
        expect(performance.visual).toBeCloseTo(43.125943941825575, 5);
        expect(performance.total).toBeCloseTo(172.0548158939326, 5);
    });

    test("10x100", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                n100: 10,
            }),
        });

        expect(performance.aim).toBeCloseTo(39.7523713222326, 5);
        expect(performance.tap).toBeCloseTo(42.71205316385528, 5);
        expect(performance.accuracy).toBeCloseTo(29.927011909318374, 5);
        expect(performance.flashlight).toBe(0);
        expect(performance.visual).toBeCloseTo(42.73500318801446, 5);
        expect(performance.total).toBeCloseTo(169.74291607014996, 5);
    });

    test("1.5 tap penalty", () => {
        const performance = calculatePerformance(difficulty, {
            tapPenalty: 1.5,
        });

        expect(performance.tap).toBeCloseTo(31.410201613927615, 5);
        expect(performance.total).toBeCloseTo(178.9786084558657, 5);
    });
});

describe("Test performance calculation with Relax", () => {
    const difficulty = calculateDifficulty(mainBeatmap, {
        mods: [new ModRelax()],
    });

    test("SS", () => {
        const performance = calculatePerformance(difficulty);

        expect(performance.aim).toBeCloseTo(16.5332457857454, 5);
        expect(performance.tap).toBeCloseTo(0.00000964814814814815, 5);
        expect(performance.accuracy).toBe(0);
        expect(performance.flashlight).toBe(0);
        expect(performance.visual).toBeCloseTo(27.149798544590933, 5);
        expect(performance.total).toBeCloseTo(30.606314137711642, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.aim).toBeCloseTo(15.896435989247099, 5);
        expect(performance.tap).toBeCloseTo(0.000009068490964122712, 5);
        expect(performance.accuracy).toBe(0);
        expect(performance.flashlight).toBe(0);
        expect(performance.visual).toBeCloseTo(25.796968539816664, 5);
        expect(performance.total).toBeCloseTo(29.20831592875732, 5);
    });

    test("99% approximated", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                percent: 99,
                nobjects: mainBeatmap.hitObjects.objects.length,
            }),
        });

        expect(performance.aim).toBeCloseTo(11.097981721999059, 5);
        expect(performance.tap).toBeCloseTo(0.00000614955234821296, 5);
        expect(performance.accuracy).toBe(0);
        expect(performance.flashlight).toBe(0);
        expect(performance.visual).toBeCloseTo(16.970078825420845, 5);
        expect(performance.total).toBeCloseTo(19.650530961455733, 5);
    });

    test("10x100", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                n100: 10,
            }),
        });

        expect(performance.aim).toBeCloseTo(10.290999383345303, 5);
        expect(performance.tap).toBeCloseTo(0.000005898479160816878, 5);
        expect(performance.accuracy).toBe(0);
        expect(performance.flashlight).toBe(0);
        expect(performance.visual).toBeCloseTo(15.6112217385054, 5);
        expect(performance.total).toBeCloseTo(18.13277263503106, 5);
    });
});

describe("Test performance calculation with NoFail", () => {
    const difficulty = calculateDifficulty(mainBeatmap, {
        mods: [new ModNoFail()],
    });

    test("SS", () => {
        const performance = calculatePerformance(difficulty);

        expect(performance.total).toBeCloseTo(77.54833913279873, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.total).toBeCloseTo(72.18954578847682, 5);
    });

    test("99% approximated", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                percent: 99,
                nobjects: mainBeatmap.hitObjects.objects.length,
            }),
        });

        expect(performance.total).toBeCloseTo(68.8300800884626, 5);
    });

    test("10x100", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                n100: 10,
            }),
        });

        expect(performance.total).toBeCloseTo(67.97524435912858, 5);
    });

    test("1.5 tap penalty", () => {
        const performance = calculatePerformance(difficulty, {
            tapPenalty: 1.5,
        });

        expect(performance.total).toBeCloseTo(72.98090652903778, 5);
    });
});

describe("Test performance calculation with ScoreV2", () => {
    const difficulty = calculateDifficulty(mainBeatmap, {
        mods: [new ModScoreV2()],
    });

    test("SS", () => {
        const performance = calculatePerformance(difficulty);

        expect(performance.accuracy).toBeCloseTo(19.155029601507906, 5);
        expect(performance.total).toBeCloseTo(83.3384341551706, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.accuracy).toBeCloseTo(18.769694179956314, 5);
        expect(performance.total).toBeCloseTo(79.92078816048291, 5);
    });

    test("99% approximated", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                percent: 99,
                nobjects: mainBeatmap.hitObjects.objects.length,
            }),
        });

        expect(performance.accuracy).toBeCloseTo(16.947414434062768, 5);
        expect(performance.total).toBeCloseTo(76.73801038280574, 5);
    });

    test("10x100", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                n100: 10,
            }),
        });

        expect(performance.accuracy).toBeCloseTo(16.717102040250882, 5);
        expect(performance.total).toBeCloseTo(76.04209068112357, 5);
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
        "77.55 pp (16.53 aim, 13.12 tap, 13.80 acc, 0.00 flashlight, 27.15 visual)"
    );
});
