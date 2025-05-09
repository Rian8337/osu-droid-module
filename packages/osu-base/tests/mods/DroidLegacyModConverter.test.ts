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

    expect(DroidLegacyModConverter.convert().size).toBe(0);

    expect(
        DroidLegacyModConverter.convert("r").get(ModHardRock),
    ).toBeInstanceOf(ModHardRock);

    let map = DroidLegacyModConverter.convert("h|x1.25");

    expect(map.size).toBe(2);
    expect(map.get(ModHidden)).toBeInstanceOf(ModHidden);
    expect(map.get(ModCustomSpeed)).toBeInstanceOf(ModCustomSpeed);
    expect(map.get(ModCustomSpeed)?.trackRateMultiplier.value).toBe(1.25);

    map = DroidLegacyModConverter.convert("h|x1.25|CS8");

    expect(map.size).toBe(3);
    expect(map.get(ModHidden)).toBeInstanceOf(ModHidden);
    expect(map.get(ModCustomSpeed)).toBeInstanceOf(ModCustomSpeed);
    expect(map.get(ModCustomSpeed)?.trackRateMultiplier.value).toBe(1.25);
    expect(map.get(ModDifficultyAdjust)).toBeInstanceOf(ModDifficultyAdjust);
    expect(map.get(ModDifficultyAdjust)?.cs.value).toBe(8);

    expect(
        DroidLegacyModConverter.convert("m").get(ModSmallCircle),
    ).toBeInstanceOf(ModSmallCircle);

    expect(
        DroidLegacyModConverter.convert("m", difficulty)
            .get(ModDifficultyAdjust)
            ?.equals(new ModDifficultyAdjust({ cs: difficulty.cs + 4 })),
    ).toBe(true);

    expect(
        DroidLegacyModConverter.convert("|x1.25")
            .get(ModCustomSpeed)
            ?.equals(new ModCustomSpeed(1.25)),
    ).toBe(true);
});
