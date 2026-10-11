import {
    BeatmapDecoder,
    ModClassic,
    ModDoubleTime,
    ModFlashlight,
    ModMap,
    ModNoFail,
} from "@rian8337/osu-base";
import { OsuDifficultyCalculator } from "../src";
import { readFileSync } from "fs";
import { join } from "path";

const calculator = new OsuDifficultyCalculator();
const beatmapPath = join(process.cwd(), "tests", "files", "beatmaps");

const testDiffCalc = (
    name: string,
    ratings: Readonly<{
        noMod: Readonly<{
            aim: number;
            speed: number;
            reading: number;
            total: number;
        }>;
        doubleTime: Readonly<{
            aim: number;
            speed: number;
            reading: number;
            total: number;
        }>;
        flashlight: number;
    }>,
) => {
    const data = readFileSync(join(beatmapPath, `${name}.osu`), {
        encoding: "utf-8",
    });

    const beatmap = new BeatmapDecoder().decode(data).result;

    test("No mod difficulty", () => {
        const noModAttributes = calculator.calculate(beatmap);

        expect(noModAttributes.aimDifficulty).toBeCloseTo(ratings.noMod.aim, 5);

        expect(noModAttributes.speedDifficulty).toBeCloseTo(
            ratings.noMod.speed,
            5,
        );

        expect(noModAttributes.flashlightDifficulty).toBe(0);
        expect(noModAttributes.readingDifficulty).toBeCloseTo(
            ratings.noMod.reading,
            5,
        );

        expect(noModAttributes.starRating).toBeCloseTo(ratings.noMod.total, 6);

        const str = `${noModAttributes.starRating.toFixed(
            2,
        )} stars (${noModAttributes.aimDifficulty.toFixed(
            2,
        )} aim, ${noModAttributes.speedDifficulty.toFixed(2)} speed, 0.00 flashlight, ${noModAttributes.readingDifficulty.toFixed(2)} reading)`;

        expect(noModAttributes.toString()).toBe(str);
    });

    test("Double Time difficulty", () => {
        const mods = new ModMap();
        mods.set(new ModDoubleTime());

        const doubleTimeAttributes = calculator.calculate(beatmap, mods);

        expect(doubleTimeAttributes.aimDifficulty).toBeCloseTo(
            ratings.doubleTime.aim,
            5,
        );

        expect(doubleTimeAttributes.speedDifficulty).toBeCloseTo(
            ratings.doubleTime.speed,
            5,
        );

        expect(doubleTimeAttributes.flashlightDifficulty).toBe(0);

        expect(doubleTimeAttributes.readingDifficulty).toBeCloseTo(
            ratings.doubleTime.reading,
            5,
        );

        expect(doubleTimeAttributes.starRating).toBeCloseTo(
            ratings.doubleTime.total,
            6,
        );
    });

    test("Flashlight difficulty calculation", () => {
        const mods = new ModMap();
        mods.set(new ModFlashlight());

        const flashlightAttributes = calculator.calculate(beatmap, mods);

        expect(flashlightAttributes.flashlightDifficulty).toBeCloseTo(
            ratings.flashlight,
            5,
        );
    });
};

test("Test difficulty adjustment mod retention", () => {
    const retainedMods = calculator.retainDifficultyAdjustmentMods([
        new ModDoubleTime(),
        new ModFlashlight(),
        new ModNoFail(),
    ]);

    expect(retainedMods.length).toBe(2);
    expect(retainedMods[0]).toBeInstanceOf(ModDoubleTime);
    expect(retainedMods[1]).toBeInstanceOf(ModFlashlight);
});

test("Test Classic mod does not alter difficulty with default settings", () => {
    const data = readFileSync(
        join(beatmapPath, "Kenji Ninuma - DISCOPRINCE (peppy) [Normal].osu"),
        { encoding: "utf-8" },
    );

    const beatmap = new BeatmapDecoder().decode(data).result;
    const noModAttributes = calculator.calculate(beatmap);

    const mods = new ModMap();
    mods.set(new ModClassic());

    const classicAttributes = calculator.calculate(beatmap, mods);

    expect(classicAttributes.starRating).toBeCloseTo(
        noModAttributes.starRating,
        10,
    );
    expect(classicAttributes.maxCombo).toBe(noModAttributes.maxCombo);
});

test("Test timed difficulty calculation", () => {
    const data = readFileSync(
        join(beatmapPath, "Kenji Ninuma - DISCOPRINCE (peppy) [Normal].osu"),
        { encoding: "utf-8" },
    );

    const beatmap = new BeatmapDecoder().decode(data).result;
    const timedAttributes = calculator.calculateTimed(beatmap);

    expect(timedAttributes.length).toBe(beatmap.hitObjects.objects.length);

    // Regression test: `attributes.hitCircleCount`/`sliderCount`/`spinnerCount`/`maxCombo` must
    // be progressive (as of each entry's own object index), not the whole map's totals. Every
    // hit object is exactly one circle, slider, or spinner, so the three counts must sum to
    // exactly `index + 1` at every entry - this holds regardless of the sample beatmap's actual
    // composition, and would fail immediately if these fields were whole-map totals instead
    // (every entry would sum to the same, full object count).
    timedAttributes.forEach((entry, index) => {
        const { hitCircleCount, sliderCount, spinnerCount } = entry.attributes;

        expect(hitCircleCount + sliderCount + spinnerCount).toBe(index + 1);
    });

    // maxCombo must never decrease, and must actually grow across the beatmap (not stay
    // constant, which is what a whole-map/non-progressive value would look like).
    for (let i = 1; i < timedAttributes.length; ++i) {
        expect(timedAttributes[i].attributes.maxCombo).toBeGreaterThanOrEqual(
            timedAttributes[i - 1].attributes.maxCombo,
        );
    }

    expect(timedAttributes.at(-1)!.attributes.maxCombo).toBeGreaterThan(
        timedAttributes[0].attributes.maxCombo,
    );
});

describe("Test difficulty calculation sample beatmap 1", () => {
    testDiffCalc(
        "YOASOBI - Love Letter (ohm002) [Please accept my overflowing emotions.]",
        {
            noMod: {
                aim: 2.4870844357004556,
                speed: 1.5633418805901897,
                reading: 0.6727005469060481,
                total: 4.364828434786013,
            },
            doubleTime: {
                aim: 3.6298455695176957,
                speed: 2.401439886201353,
                reading: 1.4877732552464953,
                total: 6.491834447828859,
            },
            flashlight: 1.6008693071588762,
        },
    );
});

describe("Test difficulty calculation sample beatmap 2", () => {
    testDiffCalc("Kenji Ninuma - DISCOPRINCE (peppy) [Normal]", {
        noMod: {
            aim: 1.2918287566346187,
            speed: 0.8773462600180841,
            reading: 0.6041372010627798,
            total: 2.3377510341052137,
        },
        doubleTime: {
            aim: 1.8089381311646793,
            speed: 1.2904406621574656,
            reading: 0.6070965344902095,
            total: 3.2698379141548104,
        },
        flashlight: 0.4145059041266731,
    });
});

describe("Test difficulty calculation sample beatmap 3", () => {
    testDiffCalc(
        "sphere - HIGH POWERED (TV Size) (Azunyan-) [POWER OVERLOAD EXPERT]",
        {
            noMod: {
                aim: 3.1505968688381984,
                speed: 3.058694770215503,
                reading: 1.1797961155698458,
                total: 6.354875737920956,
            },
            doubleTime: {
                aim: 4.499379665681266,
                speed: 4.654810864857867,
                reading: 2.1780323733641684,
                total: 9.431854544814911,
            },
            flashlight: 1.8710027366321846,
        },
    );
});

describe("Test difficulty calculation sample beatmap 4", () => {
    testDiffCalc("Ocelot - KAEDE (Hollow Wings) [EX EX]", {
        noMod: {
            aim: 4.780399558711109,
            speed: 1.3014247028204295,
            reading: 0.9062995204824486,
            total: 7.922789675742759,
        },
        doubleTime: {
            aim: 6.0542516710504755,
            speed: 1.9248793693746318,
            reading: 3.0441790604217873,
            total: 10.34657538237343,
        },
        flashlight: 2.959676079747859,
    });
});

describe("Test difficulty calculation sample beatmap 5", () => {
    testDiffCalc(
        "m1dlet - Tell Me Why Speedcore Is So Awesome (None1637) [DROID Ultimate PP CS32 x2]",
        {
            noMod: {
                aim: 42.444651280866594,
                speed: 9.497580060175245,
                reading: 10.404891953616387,
                total: 70.32500744175432,
            },
            doubleTime: {
                aim: 49.76637659674731,
                speed: 13.289606301933905,
                reading: 24.836269854802815,
                total: 84.7622993029462,
            },
            flashlight: 39.3735653005381,
        },
    );
});

describe("Test difficulty calculation sample beatmap 6", () => {
    testDiffCalc("negativeOD", {
        noMod: {
            aim: 0,
            speed: 0.05627654373715572,
            reading: 0,
            total: 0.09277267697118925,
        },
        doubleTime: {
            aim: 0,
            speed: 0.07495212110661209,
            reading: 0,
            total: 0.12355962996246042,
        },
        flashlight: 0,
    });
});

describe("Test difficulty calculation sample beatmap 7", () => {
    testDiffCalc("Camellia - crystallized (-ckopoctb-) [Emilia's C9H13NO3]", {
        noMod: {
            aim: 5.229474390239842,
            speed: 2.6054929866461705,
            reading: 1.328135554051456,
            total: 8.900787255741962,
        },
        doubleTime: {
            aim: 6.782998746945465,
            speed: 3.935529263060603,
            reading: 3.9604607839048205,
            total: 12.205789019955104,
        },
        flashlight: 4.127333920549358,
    });
});
