import { BeatmapDifficulty, Mod, ModDoubleTime, ModEasy, ModHalfTime, ModHardRock, ModRateAdjust, ScoreMultiplierCalculator } from "../../src";

class TestScoreMultiplierCalculator extends ScoreMultiplierCalculator {
    constructor(difficulty: BeatmapDifficulty | null) {
        super(difficulty);

        // Flat constant; doubles as difficulty-dependent via construction-time check.
        this.single(ModEasy, () => (this.difficulty ? 0.5 : 0.8));
        // Setting-dependent: (1 + rate) / 4.
        // At default HT (0.75x) = 0.4375.
        this.single(ModHalfTime, (ht) => (1 + ht.rate) / 4)
        // Flat constant.
        this.single(ModHardRock, 1.04);
        // Combination: replaces both singles when both are present.
        this.combination(ModEasy, ModHalfTime, () => 0.003);
    }
}

class TestGroupScoreMultiplierCalculator extends ScoreMultiplierCalculator {
    constructor(difficulty: BeatmapDifficulty | null) {
        super(difficulty);

        // Returns the product of all ModRateAdjust.rate values as the multiplier.
        this.group(
            ModRateAdjust,
            (mods) => mods.reduce((acc, mod) => acc * mod.rate, 1)
        );
    }
}

const calculateMultiplier = (
    mods: Iterable<Mod>,
    difficulty: BeatmapDifficulty | null = null
) => new TestScoreMultiplierCalculator(difficulty).calculateFor(mods);

const calculateGroupMultiplier = (
    mods: Iterable<Mod>,
    difficulty: BeatmapDifficulty | null = null
) => new TestGroupScoreMultiplierCalculator(difficulty).calculateFor(mods);

describe("Test score multiplier calculation", () => {
    test("No mods yields 1", () => {
        expect(calculateMultiplier([])).toBe(1);
    });

    test("Flat multiplier", () => {
        expect(calculateMultiplier([new ModHardRock()])).toBeCloseTo(1.04, 1e-6);
    });

    test("Setting-dependent multiplier", () => {
        // Default HT rate = 0.75
        // (1 + 0.75) / 4 = 0.4375
        expect(calculateMultiplier([new ModHalfTime()])).toBeCloseTo(0.4375, 1e-6);
    });

    test("Difficulty-dependent multiplier", () => {
        expect(calculateMultiplier([new ModEasy()])).toBeCloseTo(0.8, 1e-6);
        expect(calculateMultiplier([new ModEasy()], new BeatmapDifficulty())).toBeCloseTo(0.5, 1e-6);
    });

    test("Combination multiplier replaces individual singles", () => {
        expect(calculateMultiplier([new ModEasy(), new ModHalfTime()])).toBeCloseTo(0.003, 1e-6);
    });

    test("Combination and flat multipliers", () => {
        // Easy+HT: combination (0.003)
        // HR: flat single (1.4)
        // product = 1.4 * 0.003 = 0.0042
        expect(calculateMultiplier([new ModEasy(), new ModHalfTime(), new ModHardRock()])).toBeCloseTo(0.0042, 1e-6);
    });

    test("Group multiplier collects all matching mods", () => {
        // group(ModRateAdjust): HT (0.75) * DT (1.5) = 1.125 combined rate
        // Group result is combined rate itself
        expect(calculateGroupMultiplier([new ModHalfTime(), new ModDoubleTime()])).toBeCloseTo(0.75 * 1.5, 1e-6);
    });

    test("Group multiplier with single mod", () => {
        // Only HT present
        // Group receives [HT], combined rate = 0.75
        expect(calculateGroupMultiplier([new ModHalfTime()])).toBeCloseTo(0.75, 1e-6);
    })
});