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
});

describe("Test difficulty calculation sample beatmap 1", () => {
    testDiffCalc(
        "YOASOBI - Love Letter (ohm002) [Please accept my overflowing emotions.]",
        {
            noMod: {
                aim: 2.5680864039445948,
                speed: 1.5633418805901897,
                reading: 0.671503092809193,
                total: 4.481158070486303,
            },
            doubleTime: {
                aim: 3.5848709364192026,
                speed: 2.401439886201353,
                reading: 1.4873343769807743,
                total: 6.430493616158623,
            },
            flashlight: 1.6008693071588762,
        },
    );
});

describe("Test difficulty calculation sample beatmap 2", () => {
    testDiffCalc("Kenji Ninuma - DISCOPRINCE (peppy) [Normal]", {
        noMod: {
            aim: 1.3317713346133628,
            speed: 0.8773462600180841,
            reading: 0.6041372010627798,
            total: 2.391371045338246,
        },
        doubleTime: {
            aim: 1.8402680492448769,
            speed: 1.290430853499453,
            reading: 0.6070965344902095,
            total: 3.3118325798238524,
        },
        flashlight: 0.40884336612390054,
    });
});

describe("Test difficulty calculation sample beatmap 3", () => {
    testDiffCalc(
        "sphere - HIGH POWERED (TV Size) (Azunyan-) [POWER OVERLOAD EXPERT]",
        {
            noMod: {
                aim: 3.200294226076428,
                speed: 3.058694770215503,
                reading: 1.1792720052865389,
                total: 6.406780276225073,
            },
            doubleTime: {
                aim: 4.488277946415209,
                speed: 4.654790128080277,
                reading: 2.1782761546874174,
                total: 9.421362202620175,
            },
            flashlight: 1.8550096676245036,
        },
    );
});

describe("Test difficulty calculation sample beatmap 4", () => {
    testDiffCalc("Ocelot - KAEDE (Hollow Wings) [EX EX]", {
        noMod: {
            aim: 4.772559189013598,
            speed: 1.3014247028204295,
            reading: 0.9062995204824486,
            total: 7.910023053954891,
        },
        doubleTime: {
            aim: 6.009489713629747,
            speed: 1.9248793693746318,
            reading: 3.0441790604217873,
            total: 10.278716930310054,
        },
        flashlight: 2.9591686949109857,
    });
});

describe("Test difficulty calculation sample beatmap 5", () => {
    testDiffCalc(
        "m1dlet - Tell Me Why Speedcore Is So Awesome (None1637) [DROID Ultimate PP CS32 x2]",
        {
            noMod: {
                aim: 41.10032456062176,
                speed: 9.497580060175245,
                reading: 10.404891953616387,
                total: 68.13584883014202,
            },
            doubleTime: {
                aim: 47.65916418019422,
                speed: 13.289606301933905,
                reading: 24.836269854802815,
                total: 81.55664631725493,
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
            aim: 5.250491405379691,
            speed: 2.6054929866461705,
            reading: 1.328135554051456,
            total: 8.932993850884323,
        },
        doubleTime: {
            aim: 6.61666427253981,
            speed: 3.935529263060603,
            reading: 3.9604607839048205,
            total: 11.983255210311532,
        },
        flashlight: 4.127333920549358,
    });
});
