import {
    BeatmapDifficulty,
    LegacyModConverter,
    ModCustomSpeed,
    ModDifficultyAdjust,
    ModHardRock,
    ModHidden,
    ModSmallCircle,
} from "../../src";

test("Test legacy mod conversion", () => {
    const difficulty = new BeatmapDifficulty();
    difficulty.cs = 5;

    expect(LegacyModConverter.convert()).toEqual([]);
    expect(LegacyModConverter.convert("r")).toEqual([new ModHardRock()]);

    expect(LegacyModConverter.convert("h|x1.25")).toEqual([
        new ModHidden(),
        new ModCustomSpeed(1.25),
    ]);

    expect(LegacyModConverter.convert("h|x1.25|CS8")).toEqual([
        new ModHidden(),
        new ModCustomSpeed(1.25),
        new ModDifficultyAdjust({ cs: 8 }),
    ]);

    expect(LegacyModConverter.convert("m")).toEqual([new ModSmallCircle()]);

    expect(LegacyModConverter.convert("m", difficulty)).toEqual([
        new ModDifficultyAdjust({ cs: difficulty.cs + 4 }),
    ]);
});
