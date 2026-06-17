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
    const data = readFileSync(
        join(process.cwd(), "tests", "files", "beatmaps", `${name}.osu`),
        { encoding: "utf-8" },
    );

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

describe("Test difficulty calculation sample beatmap 1", () => {
    testDiffCalc(
        "YOASOBI - Love Letter (ohm002) [Please accept my overflowing emotions.]",
        {
            noMod: {
                aim: 1.4720535213477834,
                tap: 1.774388302704116,
                rhythm: 0.7649500351332285,
                reading: 0.0801694219632239,
                total: 3.4489917224786892,
            },
            doubleTime: {
                aim: 2.0301825449419875,
                tap: 2.6146221027877194,
                rhythm: 1.0186746358956213,
                reading: 1.1748870650192136,
                total: 5.047325911036732,
            },
            flashlight: 0.8073829372170443,
        },
    );
});

describe("Test difficulty calculation sample beatmap 2", () => {
    testDiffCalc("Kenji Ninuma - DISCOPRINCE (peppy) [Normal]", {
        noMod: {
            aim: 0.8648797620851061,
            tap: 1.029117901182237,
            rhythm: 0.51446861377641,
            reading: 0,
            total: 2.009563416343524,
        },
        doubleTime: {
            aim: 1.1899926920251067,
            tap: 1.3404848720042442,
            rhythm: 0.7033778674402899,
            reading: 0,
            total: 2.672857754773739,
        },
        flashlight: 0.22358412263778715,
    });
});

describe("Test difficulty calculation sample beatmap 3", () => {
    testDiffCalc(
        "sphere - HIGH POWERED (TV Size) (Azunyan-) [POWER OVERLOAD EXPERT]",
        {
            noMod: {
                aim: 1.9118596303773616,
                tap: 3.0646382925643985,
                rhythm: 1.0547413688823237,
                reading: 0.5738700056952152,
                total: 5.543764659305218,
            },
            doubleTime: {
                aim: 2.845137878143377,
                tap: 4.394568040187749,
                rhythm: 1.2735971353260924,
                reading: 1.4596892089649933,
                total: 8.046917656292944,
            },
            flashlight: 0.9099003657206869,
        },
    );
});

describe("Test difficulty calculation sample beatmap 4", () => {
    testDiffCalc("Ocelot - KAEDE (Hollow Wings) [EX EX]", {
        noMod: {
            aim: 2.303332981719435,
            tap: 1.8729473188050656,
            rhythm: 0.6351225782838762,
            reading: 0.21875988701529403,
            total: 4.446792646097145,
        },
        doubleTime: {
            aim: 3.085755379866233,
            tap: 2.7522428414223588,
            rhythm: 0.8534578186453801,
            reading: 2.246397329905675,
            total: 6.528019006421626,
        },
        flashlight: 1.6763999920857215,
    });
});

describe("Test difficulty calculation sample beatmap 5", () => {
    testDiffCalc(
        "m1dlet - Tell Me Why Speedcore Is So Awesome (None1637) [DROID Ultimate PP CS32 x2]",
        {
            noMod: {
                aim: 4.71953944370686,
                tap: 7.2640879043459945,
                rhythm: 1.970157660146092,
                reading: 7.312210999910238,
                total: 15.86677567035984,
            },
            doubleTime: {
                aim: 6.9340876088769,
                tap: 10.126633952399613,
                rhythm: 2.1655754384925676,
                reading: 12.89238230530667,
                total: 25.255326837165693,
            },
            flashlight: 7.263081776209047,
        },
    );
});

describe("Test difficulty calculation sample beatmap 6", () => {
    testDiffCalc("negativeOD", {
        noMod: {
            aim: 0,
            tap: 0,
            rhythm: 0,
            reading: 0,
            total: 0,
        },
        doubleTime: {
            aim: 0,
            tap: 0,
            rhythm: 0,
            reading: 0,
            total: 0,
        },
        flashlight: 0,
    });
});

describe("Test difficulty calculation sample beatmap 7", () => {
    testDiffCalc("Camellia - crystallized (-ckopoctb-) [Emilia's C9H13NO3]", {
        noMod: {
            aim: 2.1992078180856094,
            tap: 2.7900215482053046,
            rhythm: 1.1463009156166077,
            reading: 0.2825371457099409,
            total: 5.332436393570331,
        },
        doubleTime: {
            aim: 3.211798823415175,
            tap: 4.114648562684997,
            rhythm: 1.4445218506740933,
            reading: 2.7582210649479144,
            total: 8.254013596413534,
        },
        flashlight: 1.5780232019042453,
    });
});
