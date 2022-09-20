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
        expect(performance.visual).toBeCloseTo(15.193025449226097, 5);
        expect(performance.total).toBeCloseTo(65.00206062364354, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.aim).toBeCloseTo(16.64639729456129, 5);
        expect(performance.tap).toBeCloseTo(12.384537370818084, 5);
        expect(performance.accuracy).toBeCloseTo(12.984300892290696, 5);
        expect(performance.flashlight).toBe(0);
        expect(performance.visual).toBeCloseTo(14.435981869059017, 5);
        expect(performance.total).toBeCloseTo(61.75205675694358, 5);
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
        expect(performance.visual).toBeCloseTo(14.003981864474136, 5);
        expect(performance.total).toBeCloseTo(57.28269748621854, 5);
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
        expect(performance.visual).toBeCloseTo(13.877034446607993, 5);
        expect(performance.total).toBeCloseTo(56.53580116475682, 5);
    });

    test("1.5 tap penalty", () => {
        const performance = calculatePerformance(difficulty, {
            tapPenalty: 1.5,
        });

        expect(performance.tap).toBeCloseTo(8.749177677625111, 5);
        expect(performance.total).toBeCloseTo(60.3502290205607, 5);
    });
});

describe("Test performance calculation with Hidden", () => {
    const difficulty = calculateDifficulty(mainBeatmap, {
        mods: [new ModHidden()],
    });

    test("SS", () => {
        const performance = calculatePerformance(difficulty);

        expect(performance.visual).toBeCloseTo(17.23584724216641, 5);
        expect(performance.total).toBeCloseTo(67.25071674067229, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.visual).toBeCloseTo(16.3770131970956, 5);
        expect(performance.total).toBeCloseTo(63.888703567041496, 5);
    });

    test("99% approximated", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                percent: 99,
                nobjects: mainBeatmap.hitObjects.objects.length,
            }),
        });

        expect(performance.visual).toBeCloseTo(15.886927393413924, 5);
        expect(performance.total).toBeCloseTo(59.364522770820024, 5);
    });

    test("10x100", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                n100: 10,
            }),
        });

        expect(performance.visual).toBeCloseTo(15.742910896539053, 5);
        expect(performance.total).toBeCloseTo(58.599567387382336, 5);
    });
});

describe("Test performance calculation with Flashlight", () => {
    const difficulty = calculateDifficulty(mainBeatmap, {
        mods: [new ModFlashlight()],
    });

    test("SS", () => {
        const performance = calculatePerformance(difficulty);

        expect(performance.flashlight).toBeCloseTo(5.049665728539405, 5);
        expect(performance.total).toBeCloseTo(69.78924684588638, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.flashlight).toBeCloseTo(4.859275717033319, 5);
        expect(performance.total).toBeCloseTo(66.35749084224854, 5);
    });

    test("99% approximated", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                percent: 99,
                nobjects: mainBeatmap.hitObjects.objects.length,
            }),
        });

        expect(performance.flashlight).toBeCloseTo(5.024076206266401, 5);
        expect(performance.total).toBeCloseTo(62.00252868962709, 5);
    });

    test("10x100", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                n100: 10,
            }),
        });

        expect(performance.flashlight).toBeCloseTo(5.0212329260138455, 5);
        expect(performance.total).toBeCloseTo(61.24974455133266, 5);
    });
});

describe("Test performance calculation with Hidden, Flashlight", () => {
    const difficulty = calculateDifficulty(mainBeatmap, {
        mods: [new ModHidden(), new ModFlashlight()],
    });

    test("SS", () => {
        const performance = calculatePerformance(difficulty);

        expect(performance.flashlight).toBeCloseTo(6.916328185934696, 5);
        expect(performance.total).toBeCloseTo(73.86331047848479, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.flashlight).toBeCloseTo(6.655558488753008, 5);
        expect(performance.total).toBeCloseTo(70.25282937811055, 5);
    });

    test("99% approximated", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                percent: 99,
                nobjects: mainBeatmap.hitObjects.objects.length,
            }),
        });

        expect(performance.flashlight).toBeCloseTo(6.881279225533, 5);
        expect(performance.total).toBeCloseTo(65.92027429067244, 5);
    });

    test("10x100", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                n100: 10,
            }),
        });

        expect(performance.flashlight).toBeCloseTo(6.877384896599478, 5);
        expect(performance.total).toBeCloseTo(65.15044482336972, 5);
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
        expect(performance.visual).toBeCloseTo(21.272184866116817, 5);
        expect(performance.total).toBeCloseTo(170.71636938233144, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.aim).toBeCloseTo(40.40849275579425, 5);
        expect(performance.tap).toBeCloseTo(44.72170577977179, 5);
        expect(performance.accuracy).toBeCloseTo(42.4786218442272, 5);
        expect(performance.flashlight).toBe(0);
        expect(performance.visual).toBeCloseTo(20.212226726585012, 5);
        expect(performance.total).toBeCloseTo(162.22604142411706, 5);
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
        expect(performance.visual).toBeCloseTo(19.60737129536075, 5);
        expect(performance.total).toBeCloseTo(148.79063943223957, 5);
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
        expect(performance.visual).toBeCloseTo(19.4296286232281, 5);
        expect(performance.total).toBeCloseTo(146.69611511789972, 5);
    });

    test("1.5 tap penalty", () => {
        const performance = calculatePerformance(difficulty, {
            tapPenalty: 1.5,
        });

        expect(performance.tap).toBeCloseTo(31.410201613927615, 5);
        expect(performance.total).toBeCloseTo(153.4586822347829, 5);
    });
});

describe("Test performance calculation with Flashlight, Relax", () => {
    const difficulty = calculateDifficulty(mainBeatmap, {
        mods: [new ModFlashlight(), new ModRelax()],
    });

    test("SS", () => {
        const performance = calculatePerformance(difficulty);

        expect(performance.aim).toBeCloseTo(13.327789744098121, 5);
        expect(performance.tap).toBeCloseTo(0.00000964814814814815, 5);
        expect(performance.accuracy).toBe(0);
        expect(performance.flashlight).toBeCloseTo(2.8537734566776862, 5);
        expect(performance.visual).toBe(0);
        expect(performance.total).toBeCloseTo(19.262354315899472, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.aim).toBeCloseTo(12.814444259206777, 5);
        expect(performance.tap).toBeCloseTo(0.000009104691945736016, 5);
        expect(performance.accuracy).toBe(0);
        expect(performance.flashlight).toBeCloseTo(2.7461762432261367, 5);
        expect(performance.visual).toBe(0);
        expect(performance.total).toBeCloseTo(18.522857530006522, 5);
    });

    test("99% approximated", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                percent: 99,
                nobjects: mainBeatmap.hitObjects.objects.length,
            }),
        });

        expect(performance.aim).toBeCloseTo(9.415686249525756, 5);
        expect(performance.tap).toBeCloseTo(0.0000065347134883996845, 5);
        expect(performance.accuracy).toBe(0);
        expect(performance.flashlight).toBeCloseTo(2.1758958477518466, 5);
        expect(performance.visual).toBe(0);
        expect(performance.total).toBeCloseTo(13.776080723809219, 5);
    });

    test("10x100", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                n100: 10,
            }),
        });

        expect(performance.aim).toBeCloseTo(8.824638603011023, 5);
        expect(performance.tap).toBeCloseTo(0.000006159718640801493, 5);
        expect(performance.accuracy).toBe(0);
        expect(performance.flashlight).toBeCloseTo(2.078568129391646, 5);
        expect(performance.visual).toBe(0);
        expect(performance.total).toBeCloseTo(12.952710046079826, 5);
    });
});

describe("Test performance calculation with NoFail", () => {
    const difficulty = calculateDifficulty(mainBeatmap, {
        mods: [new ModNoFail()],
    });

    test("SS", () => {
        const performance = calculatePerformance(difficulty);

        expect(performance.total).toBeCloseTo(65.00206062364354, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.total).toBeCloseTo(60.51701562180472, 5);
    });

    test("99% approximated", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                percent: 99,
                nobjects: mainBeatmap.hitObjects.objects.length,
            }),
        });

        expect(performance.total).toBeCloseTo(57.28269748621854, 5);
    });

    test("10x100", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                n100: 10,
            }),
        });

        expect(performance.total).toBeCloseTo(56.53580116475682, 5);
    });

    test("1.5 tap penalty", () => {
        const performance = calculatePerformance(difficulty, {
            tapPenalty: 1.5,
        });

        expect(performance.total).toBeCloseTo(60.3502290205607, 5);
    });
});

describe("Test performance calculation with ScoreV2", () => {
    const difficulty = calculateDifficulty(mainBeatmap, {
        mods: [new ModScoreV2()],
    });

    test("SS", () => {
        const performance = calculatePerformance(difficulty);

        expect(performance.accuracy).toBeCloseTo(19.155029601507906, 5);
        expect(performance.total).toBeCloseTo(70.8907936041593, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.accuracy).toBeCloseTo(18.769694179956314, 5);
        expect(performance.total).toBeCloseTo(68.11596198255613, 5);
    });

    test("99% approximated", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                percent: 99,
                nobjects: mainBeatmap.hitObjects.objects.length,
            }),
        });

        expect(performance.accuracy).toBeCloseTo(16.947414434062768, 5);
        expect(performance.total).toBeCloseTo(65.32768851558761, 5);
    });

    test("10x100", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                n100: 10,
            }),
        });

        expect(performance.accuracy).toBeCloseTo(16.717102040250882, 5);
        expect(performance.total).toBeCloseTo(64.74264764610885, 5);
    });
});

test("Test negative OD performance calculation", () => {
    const difficulty = calculateDifficulty(mainBeatmap, {
        mods: [new ModFlashlight()],
    });

    difficulty.stats.od = 1;

    let performance = calculatePerformance(difficulty);

    const {
        aim: firstAim,
        tap: firstTap,
        flashlight: firstFlashlight,
    } = performance;

    // Intentionally set OD to negative.
    difficulty.stats.od = -1;

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

test("Test apply tap penalty", () => {
    const performance = calculatePerformance(calculateDifficulty(mainBeatmap));

    expect(performance.tap).toBeCloseTo(13.123766516437668, 5);
    expect(performance.total).toBeCloseTo(65.00206062364354, 5);

    expect(() => performance.applyTapPenalty(-1)).toThrow();

    performance.applyTapPenalty(1.5);

    expect(performance.tap).toBeCloseTo(8.749177677625111, 5);
    expect(performance.total).toBeCloseTo(60.3502290205607, 5);
});

test("Test string concatenation", () => {
    const performance = calculatePerformance(calculateDifficulty(mainBeatmap));

    expect(performance.toString()).toBe(
        "65.00 pp (17.31 aim, 13.12 tap, 13.80 acc, 0.00 flashlight, 15.19 visual)"
    );
});
