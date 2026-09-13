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
                aim: 1.8881963356554774,
                tap: 1.4803655586283997,
                rhythm: 0.7648930259509951,
                reading: 0.18186157780484502,
                total: 3.6027228928757893,
            },
            doubleTime: {
                aim: 2.589249749372387,
                tap: 2.256403427355511,
                rhythm: 1.0186082465714876,
                reading: 1.0108155477355032,
                total: 5.167370192005792,
            },
            flashlight: 0.8073829372170443,
        },
    );
});

describe("Test difficulty calculation sample beatmap 2", () => {
    testDiffCalc("Kenji Ninuma - DISCOPRINCE (peppy) [Normal]", {
        noMod: {
            aim: 0.8808837804686546,
            tap: 0.8597076945936618,
            rhythm: 0.51446861377641,
            reading: 0,
            total: 1.8314252410450915,
        },
        doubleTime: {
            aim: 1.1785308559114902,
            tap: 1.2781426736832275,
            rhythm: 0.7033778674402899,
            reading: 0,
            total: 2.589312715520045,
        },
        flashlight: 0.22358412263778715,
    });
});

describe("Test difficulty calculation sample beatmap 3", () => {
    testDiffCalc(
        "sphere - HIGH POWERED (TV Size) (Azunyan-) [POWER OVERLOAD EXPERT]",
        {
            noMod: {
                aim: 2.1407091177335555,
                tap: 3.002497516330156,
                rhythm: 1.0546345194593594,
                reading: 0.5871026457805457,
                total: 5.585239398326206,
            },
            doubleTime: {
                aim: 2.9327158874682304,
                tap: 4.362192783400847,
                rhythm: 1.273468835320142,
                reading: 1.2909406352329222,
                total: 8.031807471604946,
            },
            flashlight: 0.9099003657206869,
        },
    );
});

describe("Test difficulty calculation sample beatmap 4", () => {
    testDiffCalc("Ocelot - KAEDE (Hollow Wings) [EX EX]", {
        noMod: {
            aim: 2.5424316316214157,
            tap: 1.3004681751234894,
            rhythm: 0.6341246500251077,
            reading: 0.20147744114638405,
            total: 4.4747917698693565,
        },
        doubleTime: {
            aim: 3.384721029471425,
            tap: 1.923090507904823,
            rhythm: 0.8527918655249367,
            reading: 1.8184419412117263,
            total: 6.225834334467933,
        },
        flashlight: 1.6763999920857215,
    });
});

describe("Test difficulty calculation sample beatmap 5", () => {
    testDiffCalc(
        "m1dlet - Tell Me Why Speedcore Is So Awesome (None1637) [DROID Ultimate PP CS32 x2]",
        {
            noMod: {
                aim: 14.113413593190941,
                tap: 6.534317807779398,
                rhythm: 1.970157660146092,
                reading: 5.23812879885436,
                total: 24.888062807612503,
            },
            doubleTime: {
                aim: 16.313029670336153,
                tap: 9.316499666065619,
                rhythm: 2.1655754384925676,
                reading: 8.766932171942228,
                total: 30.025850680341463,
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
            aim: 2.530738326879249,
            tap: 2.5944554805521496,
            rhythm: 1.146111495813188,
            reading: 0.22632787255257916,
            total: 5.392967189718779,
        },
        doubleTime: {
            aim: 3.6248749358526657,
            tap: 3.9436949873732585,
            rhythm: 1.4443327102626575,
            reading: 2.1704135952190966,
            total: 8.1650571491454,
        },
        flashlight: 1.5780232019042453,
    });
});
