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

        expect(performance.aim).toBeCloseTo(54.976092652113856, 5);
        expect(performance.speed).toBeCloseTo(26.15662295508095, 5);
        expect(performance.accuracy).toBeCloseTo(50.033224101740856, 5);
        expect(performance.flashlight).toBe(0);
        expect(performance.total).toBeCloseTo(133.53509346964196, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.aim).toBeCloseTo(52.85858258616851, 5);
        expect(performance.speed).toBeCloseTo(24.861031236236244, 5);
        expect(performance.accuracy).toBeCloseTo(44.30812282995342, 5);
        expect(performance.flashlight).toBe(0);
        expect(performance.total).toBeCloseTo(124.22361508313226, 5);
    });

    test("99% approximated", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                percent: 99,
                nobjects: mainBeatmap.hitObjects.objects.length,
            }),
        });

        expect(performance.aim).toBeCloseTo(54.41890252388297, 5);
        expect(performance.speed).toBeCloseTo(24.143265115999064, 5);
        expect(performance.accuracy).toBeCloseTo(23.90690809465712, 5);
        expect(performance.flashlight).toBe(0);
        expect(performance.total).toBeCloseTo(104.71677911825847, 5);
    });
});

describe("Test performance calculation with Hidden", () => {
    const difficulty = calculateDifficulty(mainBeatmap, {
        mods: [new ModHidden()],
    });

    test("SS", () => {
        const performance = calculatePerformance(difficulty);

        expect(performance.aim).toBeCloseTo(61.57322377036753, 5);
        expect(performance.speed).toBeCloseTo(29.295417709690668, 5);
        expect(performance.accuracy).toBeCloseTo(54.03588202988013, 5);
        expect(performance.total).toBeCloseTo(147.50653933781624, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.aim).toBeCloseTo(59.20161249650874, 5);
        expect(performance.speed).toBeCloseTo(27.844354984584594, 5);
        expect(performance.accuracy).toBeCloseTo(47.85277265634969, 5);
        expect(performance.total).toBeCloseTo(137.32156821704172, 5);
    });

    test("99% approximated", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                percent: 99,
                nobjects: mainBeatmap.hitObjects.objects.length,
            }),
        });

        expect(performance.aim).toBeCloseTo(60.94917082674894, 5);
        expect(performance.speed).toBeCloseTo(27.040456929918953, 5);
        expect(performance.accuracy).toBeCloseTo(25.81946074222969, 5);
        expect(performance.total).toBeCloseTo(116.34961893789905, 5);
    });
});

describe("Test performance calculation with Flashlight", () => {
    const difficulty = calculateDifficulty(mainBeatmap, {
        mods: [new ModFlashlight()],
    });

    test("SS", () => {
        const performance = calculatePerformance(difficulty);

        expect(performance.flashlight).toBeCloseTo(62.628768392458475, 5);
        expect(performance.total).toBeCloseTo(193.1715846743577, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.flashlight).toBeCloseTo(60.26744537112235, 5);
        expect(performance.total).toBeCloseTo(181.68545507831425, 5);
    });

    test("99% approximated", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                percent: 99,
                nobjects: mainBeatmap.hitObjects.objects.length,
            }),
        });

        expect(performance.flashlight).toBeCloseTo(62.311392876956155, 5);
        expect(performance.total).toBeCloseTo(164.62579803136992, 5);
    });
});

describe("Test performance calculation with TouchDevice, Flashlight", () => {
    const difficulty = calculateDifficulty(mainBeatmap, {
        mods: [new ModTouchDevice(), new ModFlashlight()],
    });

    test("SS", () => {
        const performance = calculatePerformance(difficulty);

        expect(performance.aim).toBeCloseTo(32.244118527744696, 5);
        expect(performance.flashlight).toBeCloseTo(52.178567477496586, 5);
        expect(performance.total).toBeCloseTo(160.22522654570213, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.aim).toBeCloseTo(31.00217421602197, 5);
        expect(performance.flashlight).toBeCloseTo(50.21125348158876, 5);
        expect(performance.total).toBeCloseTo(149.92109529933543, 5);
    });

    test("99% approximated", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                percent: 99,
                nobjects: mainBeatmap.hitObjects.objects.length,
            }),
        });

        expect(performance.aim).toBeCloseTo(31.91732002915269, 5);
        expect(performance.flashlight).toBeCloseTo(51.914149061225494, 5);
        expect(performance.total).toBeCloseTo(131.40238514657804, 5);
    });
});

describe("Test performance calculation with Hidden, Flashlight", () => {
    const difficulty = calculateDifficulty(mainBeatmap, {
        mods: [new ModHidden(), new ModFlashlight()],
    });

    test("SS", () => {
        const performance = calculatePerformance(difficulty);

        expect(performance.flashlight).toBeCloseTo(92.36277805379396, 5);
        expect(performance.total).toBeCloseTo(237.04935924968015, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.flashlight).toBeCloseTo(88.88037915419744, 5);
        expect(performance.total).toBeCloseTo(223.6164823519385, 5);
    });

    test("99% approximated", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                percent: 99,
                nobjects: mainBeatmap.hitObjects.objects.length,
            }),
        });

        expect(performance.flashlight).toBeCloseTo(91.89472343527812, 5);
        expect(performance.total).toBeCloseTo(206.39529740439733, 5);
    });
});

describe("Test performance calculation with DoubleTime", () => {
    const difficulty = calculateDifficulty(mainBeatmap, {
        mods: [new ModDoubleTime()],
    });

    test("SS", () => {
        const performance = calculatePerformance(difficulty);

        expect(performance.aim).toBeCloseTo(146.16387400599763, 5);
        expect(performance.speed).toBeCloseTo(81.35451283583839, 5);
        expect(performance.accuracy).toBeCloseTo(105.52697492311131, 5);
        expect(performance.flashlight).toBe(0);
        expect(performance.total).toBeCloseTo(338.5263982355743, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.aim).toBeCloseTo(140.53409095750433, 5);
        expect(performance.speed).toBeCloseTo(77.70576359899255, 5);
        expect(performance.accuracy).toBeCloseTo(93.45194619596668, 5);
        expect(performance.flashlight).toBe(0);
        expect(performance.total).toBeCloseTo(316.9272252402531, 5);
    });

    test("99% approximated", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                percent: 99,
                nobjects: mainBeatmap.hitObjects.objects.length,
            }),
        });

        expect(performance.aim).toBeCloseTo(144.682483391072, 5);
        expect(performance.speed).toBeCloseTo(77.36836460537589, 5);
        expect(performance.accuracy).toBeCloseTo(50.422968663061425, 5);
        expect(performance.flashlight).toBe(0);
        expect(performance.total).toBeCloseTo(278.7281944283225, 5);
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
});

describe("Test performance calculation with NoFail", () => {
    const difficulty = calculateDifficulty(mainBeatmap, {
        mods: [new ModNoFail()],
    });

    test("SS", () => {
        const performance = calculatePerformance(difficulty);

        expect(performance.total).toBeCloseTo(133.53509346964196, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.total).toBeCloseTo(121.73914278146962, 5);
    });

    test("99% approximated", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                percent: 99,
                nobjects: mainBeatmap.hitObjects.objects.length,
            }),
        });

        expect(performance.total).toBeCloseTo(104.71677911825847, 5);
    });
});

describe("Test performance calculation with SpunOut", () => {
    const difficulty = calculateDifficulty(mainBeatmap, {
        mods: [new ModSpunOut()],
    });

    test("SS", () => {
        const performance = calculatePerformance(difficulty);

        expect(performance.total).toBeCloseTo(132.94743910780593, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.total).toBeCloseTo(123.67693819580722, 5);
    });

    test("99% approximated", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                percent: 99,
                nobjects: mainBeatmap.hitObjects.objects.length,
            }),
        });

        expect(performance.total).toBeCloseTo(104.25594690998018, 5);
    });
});

describe("Test performance calculation with ScoreV2", () => {
    const difficulty = calculateDifficulty(mainBeatmap, {
        mods: [new ModScoreV2()],
    });

    test("SS", () => {
        const performance = calculatePerformance(difficulty);

        expect(performance.accuracy).toBeCloseTo(69.46006358996907, 5);
        expect(performance.total).toBeCloseTo(153.68686305601457, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.accuracy).toBeCloseTo(66.6935622754495, 5);
        expect(performance.total).toBeCloseTo(147.39870005329524, 5);
    });

    test("99% approximated", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                percent: 99,
                nobjects: mainBeatmap.hitObjects.objects.length,
            }),
        });

        expect(performance.accuracy).toBeCloseTo(54.372139363835146, 5);
        expect(performance.total).toBeCloseTo(135.50068039881705, 5);
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

    expect(performance.aim).toBeCloseTo(141.45653585707328, 5);
    expect(performance.speed).toBeCloseTo(167.49667205214175, 5);
    expect(performance.accuracy).toBeCloseTo(140.70696717850745, 5);
    expect(performance.total).toBeCloseTo(455.9059860464841, 5);
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
    expect(performance.speed).toBeCloseTo(26.15662295508095, 5);
    expect(performance.accuracy).toBeCloseTo(50.033224101740856, 5);
    expect(performance.flashlight).toBe(0);
    expect(performance.total).toBeCloseTo(133.53509346964196, 5);

    expect(performance.toString()).toBe(
        "133.54 pp (54.98 aim, 26.16 speed, 50.03 acc, 0.00 flashlight)"
    );
});
