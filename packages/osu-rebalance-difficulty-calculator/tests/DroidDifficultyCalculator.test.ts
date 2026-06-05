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
                aim: 1.655502239312744,
                tap: 1.492734818431125,
                rhythm: 0.5910394950606784,
                reading: 0.0801694219632239,
                total: 3.3221388654394457,
            },
            doubleTime: {
                aim: 2.287945479162758,
                tap: 2.22637269107595,
                rhythm: 0.7507595845390408,
                reading: 1.1748089945535194,
                total: 4.831844679251894,
            },
            flashlight: 1.302075153013517,
        },
    );
});

describe("Test difficulty calculation sample beatmap 2", () => {
    testDiffCalc("Kenji Ninuma - DISCOPRINCE (peppy) [Normal]", {
        noMod: {
            aim: 0.7788448235090493,
            tap: 0.9141193217469644,
            rhythm: 0.5124281899842913,
            reading: 0,
            total: 1.793979865748089,
        },
        doubleTime: {
            aim: 1.0665610958276863,
            tap: 1.3271871914264959,
            rhythm: 0.6936207382846453,
            reading: 0,
            total: 2.5520567634582316,
        },
        flashlight: 0.38466803463687144,
    });
});

describe("Test difficulty calculation sample beatmap 3", () => {
    testDiffCalc(
        "sphere - HIGH POWERED (TV Size) (Azunyan-) [POWER OVERLOAD EXPERT]",
        {
            noMod: {
                aim: 1.9110564899183546,
                tap: 3.0875665373113415,
                rhythm: 0.9966311843953229,
                reading: 0.5738700056952152,
                total: 5.5775625468857495,
            },
            doubleTime: {
                aim: 2.6761832721325947,
                tap: 4.412143589015001,
                rhythm: 1.1908604568024859,
                reading: 1.4596168862660335,
                total: 7.9879617140750465,
            },
            flashlight: 1.4034335829221287,
        },
    );
});

describe("Test difficulty calculation sample beatmap 4", () => {
    testDiffCalc("Ocelot - KAEDE (Hollow Wings) [EX EX]", {
        noMod: {
            aim: 2.2563037457872457,
            tap: 1.4333818091815749,
            rhythm: 0.8189354231946722,
            reading: 0.21875988701529403,
            total: 4.091175052402928,
        },
        doubleTime: {
            aim: 3.071333678582437,
            tap: 2.098550903093177,
            rhythm: 1.0791633372145433,
            reading: 2.246397329905675,
            total: 6.085840557423227,
        },
        flashlight: 2.3260580069833208,
    });
});

describe("Test difficulty calculation sample beatmap 5", () => {
    testDiffCalc(
        "m1dlet - Tell Me Why Speedcore Is So Awesome (None1637) [DROID Ultimate PP CS32 x2]",
        {
            noMod: {
                aim: 12.557607531760047,
                tap: 6.068027387851987,
                rhythm: 0.8335870060057355,
                reading: 7.312210999910238,
                total: 22.961541238761182,
            },
            doubleTime: {
                aim: 14.552053956991868,
                tap: 8.556679042177844,
                rhythm: 0.9560640405601507,
                reading: 12.89238230530667,
                total: 29.873144681874127,
            },
            flashlight: 9.244315132416451,
        },
    );
});

describe("Test difficulty calculation sample beatmap 6", () => {
    testDiffCalc("negativeOD", {
        noMod: {
            aim: 0,
            tap: 0.0726997248963158,
            rhythm: 0,
            reading: 0,
            total: 0.12398238685404692,
        },
        doubleTime: {
            aim: 0,
            tap: 0.08903861521834222,
            rhythm: 0,
            reading: 0,
            total: 0.15184679244238197,
        },
        flashlight: 0,
    });
});

describe("Test difficulty calculation sample beatmap 7", () => {
    testDiffCalc("Camellia - crystallized (-ckopoctb-) [Emilia's C9H13NO3]", {
        noMod: {
            aim: 2.2798846504498913,
            tap: 2.6078659973045237,
            rhythm: 0.9938232840574492,
            reading: 0.2825371457099409,
            total: 5.169041150109288,
        },
        doubleTime: {
            aim: 3.304404853247158,
            tap: 3.9294747698179813,
            rhythm: 1.2120473532768323,
            reading: 2.7582210649479144,
            total: 8.108279409793022,
        },
        flashlight: 2.405302389972957,
    });
});
