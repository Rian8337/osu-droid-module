import {
    BeatmapDifficulty,
    DroidLegacyScoreMultiplierCalculator,
    Mod,
    ModAutopilot,
    ModDifficultyAdjust,
    ModDoubleTime,
    ModEasy,
    ModFlashlight,
    ModHalfTime,
    ModHardRock,
    ModHidden,
    ModNoFail,
    ModPrecise,
    ModReallyEasy,
    ModRelax,
    ModTraceable,
    ModWindDown,
    ModWindUp,
} from "../../src";

const calculate = (mods: Iterable<Mod>, difficulty = new BeatmapDifficulty()) =>
    new DroidLegacyScoreMultiplierCalculator(difficulty).calculateFor(mods);

describe("Test osu!droid legacy score multiplier calculation", () => {
    test("Easy multiplier", () => {
        expect(calculate([new ModEasy()])).toBeCloseTo(0.5, 6);
    });

    test("NoFail multiplier", () => {
        expect(calculate([new ModNoFail()])).toBeCloseTo(0.5, 6);
    });

    test("Really Easy multiplier", () => {
        expect(calculate([new ModReallyEasy()])).toBeCloseTo(0.5, 6);
    });

    test("HardRock multiplier", () => {
        expect(calculate([new ModHardRock()])).toBeCloseTo(1.06, 6);
    });

    test("Precise multiplier", () => {
        expect(calculate([new ModPrecise()])).toBeCloseTo(1.06, 6);
    });

    test("Hidden multiplier with default settings", () => {
        expect(calculate([new ModHidden()])).toBeCloseTo(1.06, 6);
    });

    test("Hidden multiplier with non-default settings", () => {
        const hidden = new ModHidden();
        hidden.onlyFadeApproachCircles.value = true;

        expect(calculate([hidden])).toBeCloseTo(1, 6);
    });

    test("Traceable multiplier", () => {
        expect(calculate([new ModTraceable()])).toBeCloseTo(1.06, 6);
    });

    test("Flashlight multiplier with default settings", () => {
        expect(calculate([new ModFlashlight()])).toBeCloseTo(1.12, 6);
    });

    test("Flashlight multiplier with non-default settings", () => {
        const flashlight = new ModFlashlight();
        flashlight.sizeMultiplier.value = 1.5;

        expect(calculate([flashlight])).toBeCloseTo(1, 6);
    });

    test("Relax multiplier", () => {
        expect(calculate([new ModRelax()])).toBeCloseTo(1e-3, 6);
    });

    test("Autopilot multiplier", () => {
        expect(calculate([new ModAutopilot()])).toBeCloseTo(1e-3, 6);
    });

    test("DoubleTime multiplier", () => {
        // rate 1.5 -> 1 + (1.5 - 1) * 0.24 = 1.12
        expect(calculate([new ModDoubleTime()])).toBeCloseTo(1.12, 6);
    });

    test("HalfTime multiplier", () => {
        // rate 0.75 -> 0.3^((1 - 0.75) * 4) = 0.3^1 = 0.3
        expect(calculate([new ModHalfTime()])).toBeCloseTo(0.3, 6);
    });

    test("Wind Up multiplier", () => {
        // lerp(rateMultiplier(1), rateMultiplier(1.5), 0.75)
        // rateMultiplier(1) = 1, rateMultiplier(1.5) = 1.12
        // lerp(1, 1.12, 0.75) = 1.09
        expect(calculate([new ModWindUp()])).toBeCloseTo(1.09, 6);
    });

    test("Wind Down multiplier", () => {
        // lerp(rateMultiplier(1), rateMultiplier(0.75), 0.75)
        // rateMultiplier(1) = 1, rateMultiplier(0.75) = 0.3
        // lerp(1, 0.3, 0.75) = 0.475
        expect(calculate([new ModWindDown()])).toBeCloseTo(0.475, 6);
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

    describe("Test single-precision floating point (Java float) parity", () => {
        // The osu!droid client (pre-migration) computed score multipliers using Java `float` (32-bit).
        // JavaScript's native number type is 64-bit double precision, so `DroidLegacyScoreMultiplierCalculator`
        // rounds to float precision (`Math.fround`) at each multiplication step to match the client's results.

        test("HD + DT + PR multiplier is float32-representable", () => {
            const multiplier = calculate([
                new ModHidden(),
                new ModDoubleTime(),
                new ModPrecise(),
            ]);

            expect(Math.fround(multiplier)).toBe(multiplier);

            // A naive double-precision calculation would not be float32-representable.
            expect(multiplier).not.toBe(1.06 * 1.06 * 1.12);
        });

        test("Total score with HD + DT + PR matches Java client result", () => {
            // Real-world example: base score 23578940 with HD + DT + PR.
            // Java: (23578940 * (1.06f * 1.06f * 1.12f)).roundToInt() = 29672490.
            // A naive double-precision calculation yields 29672493.
            const baseScore = 23578940;

            const multiplier = calculate([
                new ModHidden(),
                new ModDoubleTime(),
                new ModPrecise(),
            ]);

            expect(Math.round(Math.fround(baseScore * multiplier))).toBe(
                29672490,
            );

            expect(
                Math.round(baseScore * (1.06 * 1.06 * 1.12)),
            ).not.toBe(29672490);
        });
    });
});
