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

        expect(performance.aim).toBeCloseTo(16.781484824588137, 5);
        expect(performance.tap).toBeCloseTo(13.123766516437668, 5);
        expect(performance.accuracy).toBeCloseTo(13.797682282371657, 5);
        expect(performance.flashlight).toBe(0);
        expect(performance.visual).toBeCloseTo(15.193134100228049, 5);
        expect(performance.total).toBeCloseTo(64.41258568774917, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.aim).toBeCloseTo(16.135113623520102, 5);
        expect(performance.tap).toBeCloseTo(12.384537370818084, 5);
        expect(performance.accuracy).toBeCloseTo(12.984300892290696, 5);
        expect(performance.flashlight).toBe(0);
        expect(performance.visual).toBeCloseTo(14.436085106159451, 5);
        expect(performance.total).toBeCloseTo(61.1846003639596, 5);
    });

    test("99% approximated", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                percent: 99,
                nobjects: mainBeatmap.hitObjects.objects.length,
            }),
        });

        expect(performance.aim).toBeCloseTo(16.61140220812272, 5);
        expect(performance.tap).toBeCloseTo(11.598880166543692, 5);
        expect(performance.accuracy).toBeCloseTo(9.537588955661478, 5);
        expect(performance.flashlight).toBe(0);
        expect(performance.visual).toBeCloseTo(14.004082012181122, 5);
        expect(performance.total).toBeCloseTo(56.69232939623057, 5);
    });

    test("10x100", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                n100: 10,
            }),
        });

        expect(performance.aim).toBeCloseTo(16.59250413962656, 5);
        expect(performance.tap).toBeCloseTo(11.438744909113167, 5);
        expect(performance.accuracy).toBeCloseTo(9.147691487325519, 5);
        expect(performance.flashlight).toBe(0);
        expect(performance.visual).toBeCloseTo(13.877133686466557, 5);
        expect(performance.total).toBeCloseTo(55.94539243328607, 5);
    });

    test("1.5 tap penalty", () => {
        const performance = calculatePerformance(difficulty, {
            tapPenalty: 1.5,
        });

        expect(performance.tap).toBeCloseTo(8.749177677625111, 5);
        expect(performance.total).toBeCloseTo(59.75633762146459, 5);
    });
});

describe("Test performance calculation with Hidden", () => {
    const difficulty = calculateDifficulty(mainBeatmap, {
        mods: [new ModHidden()],
    });

    test("SS", () => {
        const performance = calculatePerformance(difficulty);

        expect(performance.visual).toBeCloseTo(17.2355858893519, 5);
        expect(performance.total).toBeCloseTo(66.66284500479865, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.visual).toBeCloseTo(16.376764867063883, 5);
        expect(performance.total).toBeCloseTo(63.32279606898897, 5);
    });

    test("99% approximated", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                percent: 99,
                nobjects: mainBeatmap.hitObjects.objects.length,
            }),
        });

        expect(performance.visual).toBeCloseTo(15.886686494714265, 5);
        expect(performance.total).toBeCloseTo(58.77589247506545, 5);
    });

    test("10x100", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                n100: 10,
            }),
        });

        expect(performance.visual).toBeCloseTo(15.74267218160885, 5);
        expect(performance.total).toBeCloseTo(58.010909199871094, 5);
    });
});

describe("Test performance calculation with Flashlight", () => {
    const difficulty = calculateDifficulty(mainBeatmap, {
        mods: [new ModFlashlight()],
    });

    test("SS", () => {
        const performance = calculatePerformance(difficulty);

        expect(performance.flashlight).toBeCloseTo(5.3512759028639, 5);
        expect(performance.total).toBeCloseTo(69.49888525334939, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.flashlight).toBeCloseTo(5.149514135751211, 5);
        expect(performance.total).toBeCloseTo(66.07826371685941, 5);
    });

    test("99% approximated", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                percent: 99,
                nobjects: mainBeatmap.hitObjects.objects.length,
            }),
        });

        expect(performance.flashlight).toBeCloseTo(5.324157950653442, 5);
        expect(performance.total).toBeCloseTo(61.71363099980879, 5);
    });

    test("10x100", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                n100: 10,
            }),
        });

        expect(performance.flashlight).toBeCloseTo(5.321144844852279, 5);
        expect(performance.total).toBeCloseTo(60.96104073338026, 5);
    });
});

describe("Test performance calculation with Hidden, Flashlight", () => {
    const difficulty = calculateDifficulty(mainBeatmap, {
        mods: [new ModHidden(), new ModFlashlight()],
    });

    test("SS", () => {
        const performance = calculatePerformance(difficulty);

        expect(performance.flashlight).toBeCloseTo(6.383667004197275, 5);
        expect(performance.total).toBeCloseTo(72.74988963164019, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.flashlight).toBeCloseTo(6.142980491521577, 5);
        expect(performance.total).toBeCloseTo(69.18065115248993, 5);
    });

    test("99% approximated", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                percent: 99,
                nobjects: mainBeatmap.hitObjects.objects.length,
            }),
        });

        expect(performance.flashlight).toBeCloseTo(6.351317340324655, 5);
        expect(performance.total).toBeCloseTo(64.80358812317179, 5);
    });

    test("10x100", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                n100: 10,
            }),
        });

        expect(performance.flashlight).toBeCloseTo(6.347722933227696, 5);
        expect(performance.total).toBeCloseTo(64.03349972846922, 5);
    });
});

describe("Test performance calculation with DoubleTime", () => {
    const difficulty = calculateDifficulty(mainBeatmap, {
        mods: [new ModDoubleTime()],
    });

    test("SS", () => {
        const performance = calculatePerformance(difficulty);

        expect(performance.aim).toBeCloseTo(40.74676286806221, 5);
        expect(performance.tap).toBeCloseTo(47.115302420891425, 5);
        expect(performance.accuracy).toBeCloseTo(45.13962922313779, 5);
        expect(performance.flashlight).toBe(0);
        expect(performance.visual).toBeCloseTo(21.27233589414183, 5);
        expect(performance.total).toBeCloseTo(169.30795894621448, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.aim).toBeCloseTo(39.17732283757849, 5);
        expect(performance.tap).toBeCloseTo(44.72170577977179, 5);
        expect(performance.accuracy).toBeCloseTo(42.4786218442272, 5);
        expect(performance.flashlight).toBe(0);
        expect(performance.visual).toBeCloseTo(20.212370229130837, 5);
        expect(performance.total).toBeCloseTo(160.87027940558295, 5);
    });

    test("99% approximated", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                percent: 99,
                nobjects: mainBeatmap.hitObjects.objects.length,
            }),
        });

        expect(performance.aim).toBeCloseTo(40.333788920075094, 5);
        expect(performance.tap).toBeCloseTo(43.138325244062834, 5);
        expect(performance.accuracy).toBeCloseTo(31.202575934894714, 5);
        expect(performance.flashlight).toBe(0);
        expect(performance.visual).toBeCloseTo(19.607510503560615, 5);
        expect(performance.total).toBeCloseTo(147.37854611098945, 5);
    });

    test("10x100", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                n100: 10,
            }),
        });

        expect(performance.aim).toBeCloseTo(40.287902925854304, 5);
        expect(performance.tap).toBeCloseTo(42.71205316385528, 5);
        expect(performance.accuracy).toBeCloseTo(29.927011909318374, 5);
        expect(performance.flashlight).toBe(0);
        expect(performance.visual).toBeCloseTo(19.42976656949249, 5);
        expect(performance.total).toBeCloseTo(145.2837769768792, 5);
    });

    test("1.5 tap penalty", () => {
        const performance = calculatePerformance(difficulty, {
            tapPenalty: 1.5,
        });

        expect(performance.tap).toBeCloseTo(31.410201613927615, 5);
        expect(performance.total).toBeCloseTo(152.03510830990433, 5);
    });
});

describe("Test performance calculation with Flashlight, Relax", () => {
    const difficulty = calculateDifficulty(mainBeatmap, {
        mods: [new ModFlashlight(), new ModRelax()],
    });

    test("SS", () => {
        const performance = calculatePerformance(difficulty);

        expect(performance.aim).toBeCloseTo(12.917251023872693, 5);
        expect(performance.tap).toBeCloseTo(0.00000964814814814815, 5);
        expect(performance.accuracy).toBe(0);
        expect(performance.flashlight).toBeCloseTo(3.0242257511506785, 5);
        expect(performance.visual).toBe(0);
        expect(performance.total).toBeCloseTo(18.94047551834463, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.aim).toBeCloseTo(12.419718228290474, 5);
        expect(performance.tap).toBeCloseTo(0.000009104691945736016, 5);
        expect(performance.accuracy).toBe(0);
        expect(performance.flashlight).toBeCloseTo(2.910201891649562, 5);
        expect(performance.visual).toBe(0);
        expect(performance.total).toBeCloseTo(18.213540999769666, 5);
    });

    test("99% approximated", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                percent: 99,
                nobjects: mainBeatmap.hitObjects.objects.length,
            }),
        });

        expect(performance.aim).toBeCloseTo(9.125652878866061, 5);
        expect(performance.tap).toBeCloseTo(0.0000065347134883996845, 5);
        expect(performance.accuracy).toBe(0);
        expect(performance.flashlight).toBeCloseTo(2.305859366375129, 5);
        expect(performance.visual).toBe(0);
        expect(performance.total).toBeCloseTo(13.560032390657733, 5);
    });

    test("10x100", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                n100: 10,
            }),
        });

        expect(performance.aim).toBeCloseTo(8.552811397743447, 5);
        expect(performance.tap).toBeCloseTo(0.000006159718640801493, 5);
        expect(performance.accuracy).toBe(0);
        expect(performance.flashlight).toBeCloseTo(2.202718385973578, 5);
        expect(performance.visual).toBe(0);
        expect(performance.total).toBeCloseTo(12.753020239097335, 5);
    });
});

describe("Test performance calculation with NoFail", () => {
    const difficulty = calculateDifficulty(mainBeatmap, {
        mods: [new ModNoFail()],
    });

    test("SS", () => {
        const performance = calculatePerformance(difficulty);

        expect(performance.total).toBeCloseTo(64.41258568774917, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.total).toBeCloseTo(59.96090835668042, 5);
    });

    test("99% approximated", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                percent: 99,
                nobjects: mainBeatmap.hitObjects.objects.length,
            }),
        });

        expect(performance.total).toBeCloseTo(56.69232939623057, 5);
    });

    test("10x100", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                n100: 10,
            }),
        });

        expect(performance.total).toBeCloseTo(55.94539243328607, 5);
    });

    test("1.5 tap penalty", () => {
        const performance = calculatePerformance(difficulty, {
            tapPenalty: 1.5,
        });

        expect(performance.total).toBeCloseTo(59.75633762146459, 5);
    });
});

describe("Test performance calculation with ScoreV2", () => {
    const difficulty = calculateDifficulty(mainBeatmap, {
        mods: [new ModScoreV2()],
    });

    test("SS", () => {
        const performance = calculatePerformance(difficulty);

        expect(performance.accuracy).toBeCloseTo(19.155029601507906, 5);
        expect(performance.total).toBeCloseTo(70.30643284218932, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.accuracy).toBeCloseTo(18.769694179956314, 5);
        expect(performance.total).toBeCloseTo(67.55407080509796, 5);
    });

    test("99% approximated", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                percent: 99,
                nobjects: mainBeatmap.hitObjects.objects.length,
            }),
        });

        expect(performance.accuracy).toBeCloseTo(16.947414434062768, 5);
        expect(performance.total).toBeCloseTo(64.74506881329731, 5);
    });

    test("10x100", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                n100: 10,
            }),
        });

        expect(performance.accuracy).toBeCloseTo(16.717102040250882, 5);
        expect(performance.total).toBeCloseTo(64.1602300930206, 5);
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
        "64.41 pp (16.78 aim, 13.12 tap, 13.80 acc, 0.00 flashlight, 15.19 visual)"
    );
});
