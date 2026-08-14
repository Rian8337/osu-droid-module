import {
    BeatmapDifficulty,
    DroidScoreMultiplierCalculator,
    Mod,
    ModApproachDifferent,
    ModDifficultyAdjust,
    ModDoubleTime,
    ModEasy,
    ModFlashlight,
    ModFreezeFrame,
    ModHalfTime,
    ModHardRock,
    ModHidden,
    ModNoFail,
    ModPrecise,
    ModRandom,
    ModReallyEasy,
    ModTraceable,
    ModWindDown,
    ModWindUp,
} from "../../src";

const calculate = (
    mods: Iterable<Mod>,
    difficulty: BeatmapDifficulty | null = new BeatmapDifficulty(),
) => new DroidScoreMultiplierCalculator(difficulty).calculateFor(mods);

describe("Test osu!droid score multiplier calculation", () => {
    test("Easy multiplier", () => {
        expect(calculate([new ModEasy()])).toBeCloseTo(0.8, 6);
    });

    test("NoFail multiplier", () => {
        expect(calculate([new ModNoFail()])).toBeCloseTo(0.5, 6);
    });

    test("Really Easy multiplier", () => {
        expect(calculate([new ModReallyEasy()])).toBeCloseTo(0.3, 6);
    });

    test("HardRock multiplier", () => {
        expect(calculate([new ModHardRock()])).toBeCloseTo(1.04, 6);
    });

    test("Precise multiplier falls back to 1.06 without an applied difficulty", () => {
        expect(calculate([new ModPrecise()], null)).toBeCloseTo(1.06, 6);
    });

    test("Precise multiplier depends on the applied overall difficulty", () => {
        const difficulty = new BeatmapDifficulty();
        difficulty.od = 5;

        // 1.02 + 0.08 * (5 / 10)^2 = 1.04
        expect(calculate([new ModPrecise()], difficulty)).toBeCloseTo(
            1.04,
            6,
        );
    });

    test("Hidden multiplier with default settings", () => {
        expect(calculate([new ModHidden()])).toBeCloseTo(1.06, 6);
    });

    test("Hidden multiplier with non-default settings", () => {
        const hidden = new ModHidden();
        hidden.onlyFadeApproachCircles.value = true;

        expect(calculate([hidden])).toBeCloseTo(1.03, 6);
    });

    test("Traceable multiplier", () => {
        expect(calculate([new ModTraceable()])).toBeCloseTo(1.02, 6);
    });

    test("Flashlight multiplier with default settings", () => {
        expect(calculate([new ModFlashlight()])).toBeCloseTo(1.2, 6);
    });

    test("Flashlight and Freeze Frame combination multiplier", () => {
        expect(
            calculate([new ModFlashlight(), new ModFreezeFrame()]),
        ).toBeCloseTo(1.1, 6);
    });

    test("Random multiplier", () => {
        expect(calculate([new ModRandom()])).toBeCloseTo(0.7, 6);
    });

    test("Approach Different multiplier", () => {
        expect(calculate([new ModApproachDifferent()])).toBeCloseTo(0.7, 6);
    });

    test("DoubleTime multiplier", () => {
        // rate 1.5 -> 1 + (1.5 - 1) * 0.46 = 1.23
        expect(calculate([new ModDoubleTime()])).toBeCloseTo(1.23, 6);
    });

    test("HalfTime multiplier", () => {
        // rate 0.75 -> floor(0.75 * 20) / 20 * 1.4 - 0.5 = 0.55
        expect(calculate([new ModHalfTime()])).toBeCloseTo(0.55, 6);
    });

    test("Wind Up multiplier", () => {
        // minSpeed = 1, maxSpeed = 1.5
        // rateMultiplier(1) = 1, rateMultiplier(1.5) = 1.23
        // 0.8 * 1 + 0.2 * 1.23 = 1.046
        expect(calculate([new ModWindUp()])).toBeCloseTo(1.046, 6);
    });

    test("Wind Down multiplier", () => {
        // minSpeed = 0.75, maxSpeed = 1
        // rateMultiplier(0.75) = 0.55, rateMultiplier(1) = 1
        // 0.8 * 0.55 + 0.2 * 1 = 0.64
        expect(calculate([new ModWindDown()])).toBeCloseTo(0.64, 6);
    });

    test("Difficulty Adjust multiplier", () => {
        const difficulty = new BeatmapDifficulty();
        difficulty.cs = 4;
        difficulty.od = 5;

        const mod = new ModDifficultyAdjust({ cs: 5, od: 6 });

        // cs diff = 1 -> 1 + 0.0075 * 1^1.5 = 1.0075
        // od diff = 1 -> 1 + 0.005 * 1^1.3 = 1.005
        expect(calculate([mod], difficulty)).toBeCloseTo(1.0075 * 1.005, 6);
    });

    test("Difficulty Adjust multiplier without an applied difficulty", () => {
        expect(
            calculate([new ModDifficultyAdjust({ cs: 5 })], null),
        ).toBeCloseTo(1, 6);
    });
});
