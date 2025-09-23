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
                aim: 2.4955866774503237,
                tap: 1.4808324669581225,
                rhythm: 0.812969288725491,
                reading: 0.748850181759938,
                total: 3.839902646612436,
            },
            doubleTime: {
                aim: 3.4130382829133263,
                tap: 2.1566276461936593,
                rhythm: 0.9653275604053236,
                reading: 2.068486199881045,
                total: 5.365912478277665,
            },
            flashlight: 1.49048687715176,
        },
    );
});

describe("Test difficulty calculation sample beatmap 2", () => {
    testDiffCalc("Kenji Ninuma - DISCOPRINCE (peppy) [Normal]", {
        noMod: {
            aim: 1.0321902692473548,
            tap: 0.9901723920963804,
            rhythm: 0.6119724587062164,
            reading: 0.2934192795409531,
            total: 2.147619951453794,
        },
        doubleTime: {
            aim: 1.4068939518492614,
            tap: 1.3845870791416075,
            rhythm: 0.7601331678413251,
            reading: 0.41041299116151053,
            total: 2.82072732639249,
        },
        flashlight: 0.43307010859578976,
    });
});

describe("Test difficulty calculation sample beatmap 3", () => {
    testDiffCalc(
        "sphere - HIGH POWERED (TV Size) (Azunyan-) [POWER OVERLOAD EXPERT]",
        {
            noMod: {
                aim: 2.900817545404419,
                tap: 3.077838281377718,
                rhythm: 1.222133428831228,
                reading: 1.513793779488283,
                total: 5.755294431498623,
            },
            doubleTime: {
                aim: 4.0162528796418675,
                tap: 4.243266798331955,
                rhythm: 1.358265932768112,
                reading: 3.250361788059994,
                total: 7.914311748277573,
            },
            flashlight: 1.754257735959983,
        },
    );
});

describe("Test difficulty calculation sample beatmap 4", () => {
    testDiffCalc("Ocelot - KAEDE (Hollow Wings) [EX EX]", {
        noMod: {
            aim: 2.9399918814177752,
            tap: 1.4332013989674695,
            rhythm: 0.8164433750750241,
            reading: 1.9824313471798514,
            total: 4.6962288968251045,
        },
        doubleTime: {
            aim: 4.078958258899205,
            tap: 2.0374503948541545,
            rhythm: 0.9791548169336958,
            reading: 4.867784838178375,
            total: 6.789046596826308,
        },
        flashlight: 3.620236868634939,
    });
});

describe("Test difficulty calculation sample beatmap 5", () => {
    testDiffCalc(
        "m1dlet - Tell Me Why Speedcore Is So Awesome (None1637) [DROID Ultimate PP CS32 x2]",
        {
            noMod: {
                aim: 844.2640840223498,
                tap: 5.126547190285158,
                rhythm: 0.58682378556379,
                reading: 564.1808298798749,
                total: 356.15674486500234,
            },
            doubleTime: {
                aim: 1084.8669568112875,
                tap: 6.930544796727792,
                rhythm: 0.6154594006084403,
                reading: 1166.634589815585,
                total: 435.79802080846474,
            },
            flashlight: 10690.324875939152,
        },
    );
});

describe("Test difficulty calculation sample beatmap 6", () => {
    testDiffCalc("negativeOD", {
        noMod: {
            aim: 0.0015345404825862288,
            tap: 0.18279086410430911,
            rhythm: 0,
            reading: 0,
            total: 0.31681941056355756,
        },
        doubleTime: {
            aim: 0.001879420585990258,
            tap: 0.2238721733489895,
            rhythm: 0,
            reading: 0,
            total: 0.3833987248977269,
        },
        flashlight: 0,
    });
});

describe("Test difficulty calculation sample beatmap 7", () => {
    testDiffCalc("Camellia - crystallized (-ckopoctb-) [Emilia's C9H13NO3]", {
        noMod: {
            aim: 3.2174338650510528,
            tap: 2.535067079216332,
            rhythm: 1.4402127346126805,
            reading: 1.0115795752745613,
            total: 5.215979938697696,
        },
        doubleTime: {
            aim: 4.567100605731228,
            tap: 3.745672783616189,
            rhythm: 1.599946939466027,
            reading: 5.679486139088523,
            total: 8.23023094252888,
        },
        flashlight: 3.0911649510908648,
    });
});
