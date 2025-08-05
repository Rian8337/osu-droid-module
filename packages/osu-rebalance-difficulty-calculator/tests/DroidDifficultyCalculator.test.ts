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
            visual: number;
            total: number;
        }>;
        doubleTime: Readonly<{
            aim: number;
            tap: number;
            rhythm: number;
            visual: number;
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

        expect(noModAttributes.visualDifficulty).toBeCloseTo(
            ratings.noMod.visual,
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
        )} flashlight, ${noModAttributes.visualDifficulty.toFixed(2)} visual)`;

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

        expect(doubleTimeAttributes.visualDifficulty).toBeCloseTo(
            ratings.doubleTime.visual,
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
                tap: 1.4928164438079188,
                rhythm: 0.8031477030098177,
                visual: 0.8056919696481293,
                total: 4.004467082917377,
            },
            doubleTime: {
                aim: 3.4130382829133263,
                tap: 2.174771069380805,
                rhythm: 0.9519262004677612,
                visual: 0.9321730649994123,
                total: 5.126690273096184,
            },
            flashlight: 1.49048687715176,
        },
    );
});

describe("Test difficulty calculation sample beatmap 2", () => {
    testDiffCalc("Kenji Ninuma - DISCOPRINCE (peppy) [Normal]", {
        noMod: {
            aim: 1.0321902692473548,
            tap: 0.9920702742360272,
            rhythm: 0.6013941332079858,
            visual: 0.7700983157874998,
            total: 2.879188511757053,
        },
        doubleTime: {
            aim: 1.4068939518492614,
            tap: 1.3850570311596002,
            rhythm: 0.7470214696445487,
            visual: 0.8814971446281084,
            total: 3.362690614127282,
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
                tap: 3.246795183751376,
                rhythm: 1.2248841936193657,
                visual: 0.986443099739282,
                total: 5.928611176196442,
            },
            doubleTime: {
                aim: 4.0162528796418675,
                tap: 4.431668248275612,
                rhythm: 1.3590176476591442,
                visual: 1.1153548390456307,
                total: 7.870244889129414,
            },
            flashlight: 1.754257735959983,
        },
    );
});

describe("Test difficulty calculation sample beatmap 4", () => {
    testDiffCalc("Ocelot - KAEDE (Hollow Wings) [EX EX]", {
        noMod: {
            aim: 2.9399918814177752,
            tap: 1.423894584064056,
            rhythm: 0.7702320532709267,
            visual: 1.810105056558719,
            total: 4.968325485580588,
        },
        doubleTime: {
            aim: 4.078958258899205,
            tap: 2.0205091699293516,
            rhythm: 0.9255169946910077,
            visual: 2.545456861191769,
            total: 6.268621014859427,
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
                tap: 5.199552122609969,
                rhythm: 0.8248580204506412,
                visual: 3.306116214675675,
                total: 355.64532746295544,
            },
            doubleTime: {
                aim: 1084.8669568112875,
                tap: 7.025787699952003,
                rhythm: 0.8642772486876512,
                visual: 4.225882745598057,
                total: 434.64160491735095,
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
            visual: 0,
            total: 0.31681941056355756,
        },
        doubleTime: {
            aim: 0.001879420585990258,
            tap: 0.2238721733489895,
            rhythm: 0,
            visual: 0,
            total: 0.3833987248977269,
        },
        flashlight: 0,
    });
});

describe("Test difficulty calculation sample beatmap 7", () => {
    testDiffCalc("Camellia - crystallized (-ckopoctb-) [Emilia's C9H13NO3]", {
        noMod: {
            aim: 3.2174338650510528,
            tap: 2.551165371988442,
            rhythm: 1.4200902706257805,
            visual: 1.0725402712215684,
            total: 5.357166074104835,
        },
        doubleTime: {
            aim: 4.567100605731228,
            tap: 3.76177829209056,
            rhythm: 1.5773283449720115,
            visual: 1.4089802982057478,
            total: 7.3518829848249965,
        },
        flashlight: 3.0911649510908648,
    });
});
