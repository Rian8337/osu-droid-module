import {
    Mod,
    ModClassic,
    ModDaycore,
    ModHalfTime,
    ModTargetPractice,
    OsuScoreMultiplierCalculatorV1,
} from "../../src";

const calculate = (mods: Iterable<Mod>) =>
    new OsuScoreMultiplierCalculatorV1().calculateFor(mods);

describe("Test osu!standard V1 score multiplier calculation", () => {
    test("Daycore multiplier matches HalfTime at the same rate", () => {
        expect(calculate([new ModDaycore()])).toBeCloseTo(
            calculate([new ModHalfTime()]),
            1e-6,
        );
    });

    test("Target Practice multiplier", () => {
        expect(calculate([new ModTargetPractice()])).toBeCloseTo(0.1, 1e-6);
    });

    test("Classic multiplier", () => {
        expect(calculate([new ModClassic()])).toBeCloseTo(0.96, 1e-6);
    });
});
