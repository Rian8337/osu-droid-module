import {
    BeatmapDecoder,
    ModAutopilot,
    ModDoubleTime,
    ModFlashlight,
    ModMap,
    ModNoFail,
    ModRelax,
} from "@rian8337/osu-base";
import { DroidDifficultyCalculator } from "../src";
import { readFileSync } from "fs";
import { join } from "path";

const calculator = new DroidDifficultyCalculator();
const beatmapPath = join(process.cwd(), "tests", "files", "beatmaps");

const testDiffCalc = (
    name: string,
    ratings: Readonly<{
        noMod: Readonly<{
            aim: number;
            tap: number;
            rhythm: number;
            reading: number;
            total: number;
        }>;
        doubleTime: Readonly<{
            aim: number;
            tap: number;
            rhythm: number;
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
        expect(noModAttributes.tapDifficulty).toBeCloseTo(ratings.noMod.tap, 5);

        expect(noModAttributes.rhythmDifficulty).toBeCloseTo(
            ratings.noMod.rhythm,
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
        )} aim, ${noModAttributes.tapDifficulty.toFixed(
            2,
        )} tap, ${noModAttributes.rhythmDifficulty.toFixed(
            2,
        )} rhythm, ${noModAttributes.flashlightDifficulty.toFixed(
            2,
        )} flashlight, ${noModAttributes.readingDifficulty.toFixed(2)} reading)`;

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

        expect(doubleTimeAttributes.tapDifficulty).toBeCloseTo(
            ratings.doubleTime.tap,
            5,
        );

        expect(doubleTimeAttributes.rhythmDifficulty).toBeCloseTo(
            ratings.doubleTime.rhythm,
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

    test("Autopilot aim difficulty calculation", () => {
        const mods = new ModMap();
        mods.set(new ModAutopilot());

        const autopilotAttributes = calculator.calculate(beatmap, mods);

        expect(autopilotAttributes.aimDifficulty).toBe(0);
    });

    test("Relax tap and rhythm difficulty calculation", () => {
        const mods = new ModMap();
        mods.set(new ModRelax());

        const relaxAttributes = calculator.calculate(beatmap, mods);

        expect(relaxAttributes.tapDifficulty).toBe(0);
        expect(relaxAttributes.rhythmDifficulty).toBe(0);
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
                aim: 1.6507599090341118,
                tap: 1.4807455933883245,
                rhythm: 0.7648930259509951,
                reading: 0.22156508175475367,
                total: 3.306269404922253,
            },
            doubleTime: {
                aim: 2.393351493117998,
                tap: 2.256646578570034,
                rhythm: 1.0186082465714876,
                reading: 1.1195998370311808,
                total: 4.961998108017917,
            },
            flashlight: 0.8073829372170443,
        },
    );
});

describe("Test difficulty calculation sample beatmap 2", () => {
    testDiffCalc("Kenji Ninuma - DISCOPRINCE (peppy) [Normal]", {
        noMod: {
            aim: 0.8435605739219768,
            tap: 0.8600662318799216,
            rhythm: 0.51446861377641,
            reading: 0,
            total: 1.7924199891440784,
        },
        doubleTime: {
            aim: 1.1250938618378366,
            tap: 1.2785574953131082,
            rhythm: 0.7033778674402899,
            reading: 0,
            total: 2.5404489075618937,
        },
        flashlight: 0.22632382431866704,
    });
});

describe("Test difficulty calculation sample beatmap 3", () => {
    testDiffCalc(
        "sphere - HIGH POWERED (TV Size) (Azunyan-) [POWER OVERLOAD EXPERT]",
        {
            noMod: {
                aim: 1.9442979118739936,
                tap: 3.0027913872485614,
                rhythm: 1.0546345194593594,
                reading: 0.7348502188112183,
                total: 5.476414273835772,
            },
            doubleTime: {
                aim: 2.7118838528913884,
                tap: 4.362518054307488,
                rhythm: 1.273468835320142,
                reading: 1.5165877013969744,
                total: 7.938819465787499,
            },
            flashlight: 0.9177698133776294,
        },
    );
});

describe("Test difficulty calculation sample beatmap 4", () => {
    testDiffCalc("Ocelot - KAEDE (Hollow Wings) [EX EX]", {
        noMod: {
            aim: 2.4340783461655358,
            tap: 1.3004681751234894,
            rhythm: 0.6341246500251077,
            reading: 0.24483426540455716,
            total: 4.304094098261982,
        },
        doubleTime: {
            aim: 3.28966677894349,
            tap: 1.923090507904823,
            rhythm: 0.8527918655249367,
            reading: 2.158102208462469,
            total: 6.237643099989986,
        },
        flashlight: 1.6766764234446196,
    });
});

describe("Test difficulty calculation sample beatmap 5", () => {
    testDiffCalc(
        "m1dlet - Tell Me Why Speedcore Is So Awesome (None1637) [DROID Ultimate PP CS32 x2]",
        {
            noMod: {
                aim: 11.080019426048887,
                tap: 6.534317807779398,
                rhythm: 1.970157660146092,
                reading: 7.326530273353259,
                total: 21.061003964194384,
            },
            doubleTime: {
                aim: 12.677724093403384,
                tap: 9.316499666065619,
                rhythm: 2.1655754384925676,
                reading: 12.574721536322969,
                total: 27.95666781646306,
            },
            flashlight: 7.263081776209047,
        },
    );
});

describe("Test difficulty calculation sample beatmap 6", () => {
    testDiffCalc("negativeOD", {
        noMod: {
            aim: 0,
            tap: 0.05627654373715572,
            rhythm: 0,
            reading: 0,
            total: 0.09597423135204078,
        },
        doubleTime: {
            aim: 0,
            tap: 0.07495212110661209,
            rhythm: 0,
            reading: 0,
            total: 0.12782363190266052,
        },
        flashlight: 0,
    });
});

describe("Test difficulty calculation sample beatmap 7", () => {
    testDiffCalc("Camellia - crystallized (-ckopoctb-) [Emilia's C9H13NO3]", {
        noMod: {
            aim: 2.2964810577613726,
            tap: 2.5944554805521496,
            rhythm: 1.146111495813188,
            reading: 0.2824887377724137,
            total: 5.16777812882641,
        },
        doubleTime: {
            aim: 3.3711344761801096,
            tap: 3.9436949873732585,
            rhythm: 1.4443327102626575,
            reading: 2.602972833880889,
            total: 8.1035291362925,
        },
        flashlight: 1.5780232019042453,
    });
});
