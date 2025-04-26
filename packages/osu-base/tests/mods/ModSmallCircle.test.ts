import {
    BeatmapDifficulty,
    ModDifficultyAdjust,
    ModSmallCircle,
    Modes,
} from "../../src";

test("Test migration", () => {
    const mod = new ModSmallCircle();
    const difficulty = new BeatmapDifficulty();

    difficulty.cs = 4;

    const migratedMod = mod.migrateDroidMod(difficulty);

    expect(migratedMod).toBeInstanceOf(ModDifficultyAdjust);
    expect((migratedMod as ModDifficultyAdjust).cs).toBe(8);
});

describe("Test beatmap setting adjustment", () => {
    test("osu!droid game mode", () => {
        const difficulty = new BeatmapDifficulty();
        difficulty.cs = 3;

        new ModSmallCircle().applyToDifficulty(Modes.droid, difficulty);

        expect(difficulty.cs).toBeCloseTo(7);
    });

    test("osu!standard game mode", () => {
        const difficulty = new BeatmapDifficulty();
        difficulty.cs = 3;

        new ModSmallCircle().applyToDifficulty(Modes.osu, difficulty);

        expect(difficulty.cs).toBeCloseTo(7);
    });
});
