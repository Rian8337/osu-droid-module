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
                aim: 2.5005290337081734,
                tap: 1.4808324669581225,
                rhythm: 0.812969288725491,
                reading: 0.739872321975066,
                total: 3.840570379351984,
            },
            doubleTime: {
                aim: 3.4175775551816368,
                tap: 2.1566276461936593,
                rhythm: 0.9653275604053236,
                reading: 1.8177511677587463,
                total: 5.279983323898323,
            },
            flashlight: 1.49048687715176,
        },
    );
});

describe("Test difficulty calculation sample beatmap 2", () => {
    testDiffCalc("Kenji Ninuma - DISCOPRINCE (peppy) [Normal]", {
        noMod: {
            aim: 1.0382359393004181,
            tap: 0.9901723920963804,
            rhythm: 0.6119724587062164,
            reading: 0.2803790012058804,
            total: 2.1425769604060365,
        },
        doubleTime: {
            aim: 1.4146733020692146,
            tap: 1.3845870791416075,
            rhythm: 0.7601331678413251,
            reading: 0.3956433619844582,
            total: 2.8185393713965987,
        },
        flashlight: 0.43307010859578976,
    });
});

describe("Test difficulty calculation sample beatmap 3", () => {
    testDiffCalc(
        "sphere - HIGH POWERED (TV Size) (Azunyan-) [POWER OVERLOAD EXPERT]",
        {
            noMod: {
                aim: 2.9045700037032076,
                tap: 3.077838281377718,
                rhythm: 1.222133428831228,
                reading: 1.5627673845750574,
                total: 5.768850452517354,
            },
            doubleTime: {
                aim: 4.021308274260325,
                tap: 4.243266798331955,
                rhythm: 1.358265932768112,
                reading: 3.0111287478454973,
                total: 7.8675051037524915,
            },
            flashlight: 1.754257735959983,
        },
    );
});

describe("Test difficulty calculation sample beatmap 4", () => {
    testDiffCalc("Ocelot - KAEDE (Hollow Wings) [EX EX]", {
        noMod: {
            aim: 2.9558713804559007,
            tap: 1.4332013989674695,
            rhythm: 0.8164433750750241,
            reading: 1.9602860666971609,
            total: 4.696091769792871,
        },
        doubleTime: {
            aim: 4.1012933582649955,
            tap: 2.0374503948541545,
            rhythm: 0.9791548169336958,
            reading: 4.424345952647874,
            total: 6.622822392091113,
        },
        flashlight: 3.620236868634939,
    });
});

describe("Test difficulty calculation sample beatmap 5", () => {
    testDiffCalc(
        "m1dlet - Tell Me Why Speedcore Is So Awesome (None1637) [DROID Ultimate PP CS32 x2]",
        {
            noMod: {
                aim: 843.0988750423347,
                tap: 5.126547190285158,
                rhythm: 0.58682378556379,
                reading: 512.1038228663765,
                total: 355.68508052169494,
            },
            doubleTime: {
                aim: 1083.0052732258089,
                tap: 6.930544796727792,
                rhythm: 0.6154594006084403,
                reading: 947.6301256878664,
                total: 434.85011776639334,
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
            aim: 3.2259354820884583,
            tap: 2.535067079216332,
            rhythm: 1.4402127346126805,
            reading: 0.9863431839603258,
            total: 5.2154291519205,
        },
        doubleTime: {
            aim: 4.579833388092296,
            tap: 3.745672783616189,
            rhythm: 1.599946939466027,
            reading: 4.733985427578511,
            total: 7.96990716183488,
        },
        flashlight: 3.0911649510908648,
    });
});
