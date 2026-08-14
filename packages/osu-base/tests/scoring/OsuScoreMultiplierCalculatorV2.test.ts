import {
    BeatmapDifficulty,
    Mod,
    ModClassic,
    ModDaycore,
    ModHalfTime,
    ModTargetPractice,
    OsuScoreMultiplierCalculatorV2,
} from "../../src";

const calculate = (mods: Iterable<Mod>) =>
    new OsuScoreMultiplierCalculatorV2(new BeatmapDifficulty()).calculateFor(
        mods,
    );

describe("Test osu!standard V2 score multiplier calculation", () => {
    test("Daycore multiplier matches HalfTime at the same rate", () => {
        // Default Daycore rate (0.75x) = 0.55, identical to HalfTime's formula.
        expect(calculate([new ModDaycore()])).toBeCloseTo(0.55, 1e-6);
        expect(calculate([new ModDaycore()])).toBeCloseTo(
            calculate([new ModHalfTime()]),
            1e-6,
        );
    });

    test("Target Practice multiplier", () => {
        expect(calculate([new ModTargetPractice()])).toBeCloseTo(0.01, 1e-6);
    });

    test("Classic multiplier with default settings", () => {
        expect(calculate([new ModClassic()])).toBeCloseTo(0.985, 1e-6);
    });

    test("Classic multiplier with note lock disabled", () => {
        const classic = new ModClassic();
        classic.classicNoteLock.value = false;

        expect(calculate([classic])).toBeCloseTo(0.96, 1e-6);
    });
});
