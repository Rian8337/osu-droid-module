import {
    BeatmapDifficulty,
    DroidLegacyModConverter,
    ModCustomSpeed,
    ModDifficultyAdjust,
    ModHardRock,
    ModHidden,
    ModSmallCircle,
} from "../../src";

test("Test legacy mod conversion", () => {
    const difficulty = new BeatmapDifficulty();
    difficulty.cs = 5;

    expect(DroidLegacyModConverter.convert()).toEqual([]);
    expect(DroidLegacyModConverter.convert("r")).toEqual([new ModHardRock()]);

    expect(DroidLegacyModConverter.convert("h|x1.25")).toEqual([
        new ModHidden(),
        new ModCustomSpeed(1.25),
    ]);

    expect(DroidLegacyModConverter.convert("h|x1.25|CS8")).toEqual([
        new ModHidden(),
        new ModCustomSpeed(1.25),
        new ModDifficultyAdjust({ cs: 8 }),
    ]);

    expect(DroidLegacyModConverter.convert("m")).toEqual([
        new ModSmallCircle(),
    ]);

    expect(DroidLegacyModConverter.convert("m", difficulty)).toEqual([
        new ModDifficultyAdjust({ cs: difficulty.cs + 4 }),
    ]);
});
