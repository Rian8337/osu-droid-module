import {
    BeatmapDifficulty,
    ModDifficultyAdjust,
    ModMap,
    ModSmallCircle,
    Modes,
} from "../../src";
import { ModReplayV6 } from "../../src/mods/ModReplayV6";

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

        new ModSmallCircle().applyToDifficulty(
            Modes.droid,
            difficulty,
            new ModMap(),
        );

        expect(difficulty.cs).toBeCloseTo(7);
    });

    test("osu!droid game mode with adjustment mods", () => {
        const difficulty = new BeatmapDifficulty();
        difficulty.cs = 3;

        const map = new ModMap();
        map.set(new ModReplayV6());

        new ModSmallCircle().applyToDifficulty(Modes.droid, difficulty, map);

        expect(difficulty.cs).toBeCloseTo(7);
    });

    test("osu!standard game mode", () => {
        const difficulty = new BeatmapDifficulty();
        difficulty.cs = 3;

        new ModSmallCircle().applyToDifficulty(
            Modes.osu,
            difficulty,
            new ModMap(),
        );

        expect(difficulty.cs).toBeCloseTo(7);
    });
});
