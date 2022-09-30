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

        expect(performance.aim).toBeCloseTo(55.223763700576384, 5);
        expect(performance.speed).toBeCloseTo(26.15662295508095, 5);
        expect(performance.accuracy).toBeCloseTo(50.033224101740856, 5);
        expect(performance.flashlight).toBe(0);
        expect(performance.total).toBeCloseTo(136.18099461434596, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.aim).toBeCloseTo(53.09671410730447, 5);
        expect(performance.speed).toBeCloseTo(24.861031236236244, 5);
        expect(performance.accuracy).toBeCloseTo(44.30812282995342, 5);
        expect(performance.flashlight).toBe(0);
        expect(performance.total).toBeCloseTo(126.69400335342888, 5);
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
        expect(performance.total).toBeCloseTo(106.85150755338925, 5);
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
        expect(performance.total).toBeCloseTo(104.67015315543203, 5);
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
        expect(performance.total).toBeCloseTo(150.43369648042943, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.aim).toBeCloseTo(59.468319800181014, 5);
        expect(performance.speed).toBeCloseTo(27.844354984584594, 5);
        expect(performance.accuracy).toBeCloseTo(47.85277265634969, 5);
        expect(performance.total).toBeCloseTo(140.05647098908875, 5);
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
        expect(performance.total).toBeCloseTo(118.72408764470288, 5);
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
        expect(performance.total).toBeCloseTo(116.36251965238309, 5);
    });
});

describe("Test performance calculation with Flashlight", () => {
    const difficulty = calculateDifficulty(mainBeatmap, {
        mods: [new ModFlashlight()],
    });

    test("SS", () => {
        const performance = calculatePerformance(difficulty);

        expect(performance.flashlight).toBeCloseTo(61.563689314464995, 5);
        expect(performance.total).toBeCloseTo(195.77651562575653, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.flashlight).toBeCloseTo(59.2425234894296, 5);
        expect(performance.total).toBeCloseTo(184.11502826844475, 5);
    });

    test("99% approximated", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                percent: 99,
                nobjects: mainBeatmap.hitObjects.objects.length,
            }),
        });

        expect(performance.flashlight).toBeCloseTo(61.25171115915521, 5);
        expect(performance.total).toBeCloseTo(166.71069133807018, 5);
    });

    test("10x100", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                n100: 10,
            }),
        });

        expect(performance.flashlight).toBeCloseTo(61.21704691967634, 5);
        expect(performance.total).toBeCloseTo(164.54881382093146, 5);
    });
});

describe("Test performance calculation with TouchDevice, Flashlight", () => {
    const difficulty = calculateDifficulty(mainBeatmap, {
        mods: [new ModTouchDevice(), new ModFlashlight()],
    });

    test("SS", () => {
        const performance = calculatePerformance(difficulty);

        expect(performance.aim).toBeCloseTo(32.360789778121806, 5);
        expect(performance.flashlight).toBeCloseTo(51.46746346727857, 5);
        expect(performance.total).toBeCloseTo(162.4685053159373, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.aim).toBeCloseTo(31.114351648538225, 5);
        expect(performance.flashlight).toBeCloseTo(49.52696057292985, 5);
        expect(performance.total).toBeCloseTo(152.0018922640928, 5);
    });

    test("99% approximated", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                percent: 99,
                nobjects: mainBeatmap.hitObjects.objects.length,
            }),
        });

        expect(performance.aim).toBeCloseTo(32.032808800640844, 5);
        expect(performance.flashlight).toBeCloseTo(51.20664861862682, 5);
        expect(performance.total).toBeCloseTo(133.12142700807524, 5);
    });

    test("10x100", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                n100: 10,
            }),
        });

        expect(performance.aim).toBeCloseTo(31.996366469809622, 5);
        expect(performance.flashlight).toBeCloseTo(51.17766919099885, 5);
        expect(performance.total).toBeCloseTo(130.9458424466107, 5);
    });
});

describe("Test performance calculation with Hidden, Flashlight", () => {
    const difficulty = calculateDifficulty(mainBeatmap, {
        mods: [new ModHidden(), new ModFlashlight()],
    });

    test("SS", () => {
        const performance = calculatePerformance(difficulty);

        expect(performance.flashlight).toBeCloseTo(75.62720634678199, 5);
        expect(performance.total).toBeCloseTo(224.10769341670655, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.flashlight).toBeCloseTo(72.77579687522837, 5);
        expect(performance.total).toBeCloseTo(211.04793537681596, 5);
    });

    test("99% approximated", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                percent: 99,
                nobjects: mainBeatmap.hitObjects.objects.length,
            }),
        });

        expect(performance.flashlight).toBeCloseTo(75.2439603686733, 5);
        expect(performance.total).toBeCloseTo(192.75190754109047, 5);
    });

    test("10x100", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                n100: 10,
            }),
        });

        expect(performance.flashlight).toBeCloseTo(75.20137748221677, 5);
        expect(performance.total).toBeCloseTo(190.4152718797593, 5);
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
        expect(performance.total).toBeCloseTo(344.76103767038694, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.aim).toBeCloseTo(140.70597776746038, 5);
        expect(performance.speed).toBeCloseTo(77.70576359899255, 5);
        expect(performance.accuracy).toBeCloseTo(93.45194619596668, 5);
        expect(performance.flashlight).toBe(0);
        expect(performance.total).toBeCloseTo(322.769351387507, 5);
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
        expect(performance.total).toBeCloseTo(283.89657402890174, 5);
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
        expect(performance.total).toBeCloseTo(279.3650960970057, 5);
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
        expect(performance.total).toBeCloseTo(45.54059837156449, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.aim).toBeCloseTo(38.40922327723457, 5);
        expect(performance.speed).toBe(0);
        expect(performance.accuracy).toBe(0);
        expect(performance.flashlight).toBe(0);
        expect(performance.total).toBeCloseTo(43.78651453604741, 5);
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
        expect(performance.total).toBeCloseTo(37.85905152573197, 5);
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
        expect(performance.total).toBeCloseTo(36.70459202134013, 5);
    });
});

describe("Test performance calculation with NoFail", () => {
    const difficulty = calculateDifficulty(mainBeatmap, {
        mods: [new ModNoFail()],
    });

    test("SS", () => {
        const performance = calculatePerformance(difficulty);

        expect(performance.total).toBeCloseTo(136.18099461434596, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.total).toBeCloseTo(124.1601232863603, 5);
    });

    test("99% approximated", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                percent: 99,
                nobjects: mainBeatmap.hitObjects.objects.length,
            }),
        });

        expect(performance.total).toBeCloseTo(106.85150755338925, 5);
    });

    test("10x100", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                n100: 10,
            }),
        });

        expect(performance.total).toBeCloseTo(104.67015315543203, 5);
    });
});

describe("Test performance calculation with SpunOut", () => {
    const difficulty = calculateDifficulty(mainBeatmap, {
        mods: [new ModSpunOut()],
    });

    test("SS", () => {
        const performance = calculatePerformance(difficulty);

        expect(performance.total).toBeCloseTo(135.58169630702514, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.total).toBeCloseTo(126.13645490863723, 5);
    });

    test("99% approximated", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                percent: 99,
                nobjects: mainBeatmap.hitObjects.objects.length,
            }),
        });

        expect(performance.total).toBeCloseTo(106.38128094215934, 5);
    });

    test("10x100", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                n100: 10,
            }),
        });

        expect(performance.total).toBeCloseTo(104.20952613628957, 5);
    });
});

describe("Test performance calculation with ScoreV2", () => {
    const difficulty = calculateDifficulty(mainBeatmap, {
        mods: [new ModScoreV2()],
    });

    test("SS", () => {
        const performance = calculatePerformance(difficulty);

        expect(performance.accuracy).toBeCloseTo(69.46006358996907, 5);
        expect(performance.total).toBeCloseTo(156.68897317631317, 5);
    });

    test("1 miss", () => {
        const performance = calculatePerformance(difficulty, { miss: 1 });

        expect(performance.accuracy).toBeCloseTo(66.6935622754495, 5);
        expect(performance.total).toBeCloseTo(150.27865750410314, 5);
    });

    test("99% approximated", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                percent: 99,
                nobjects: mainBeatmap.hitObjects.objects.length,
            }),
        });

        expect(performance.accuracy).toBeCloseTo(54.372139363835146, 5);
        expect(performance.total).toBeCloseTo(138.17839244768766, 5);
    });

    test("10x100", () => {
        const performance = calculatePerformance(difficulty, {
            accPercent: new Accuracy({
                n100: 10,
            }),
        });

        expect(performance.accuracy).toBeCloseTo(52.90436529080426, 5);
        expect(performance.total).toBeCloseTo(136.35918094771762, 5);
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
    expect(performance.total).toBeCloseTo(465.3353986766533, 5);
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
    expect(performance.total).toBeCloseTo(136.18099461434596, 5);

    expect(performance.toString()).toBe(
        "136.18 pp (55.22 aim, 26.16 speed, 50.03 acc, 0.00 flashlight)"
    );
});
