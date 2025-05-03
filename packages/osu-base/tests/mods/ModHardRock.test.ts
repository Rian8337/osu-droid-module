import { BeatmapDifficulty, ModHardRock, ModMap, Modes } from "../../src";
import { ModReplayV6 } from "../../src/mods/ModReplayV6";

const mod = new ModHardRock();

describe("Test beatmap setting adjustment", () => {
    test("osu!droid game mode", () => {
        const difficulty = new BeatmapDifficulty();

        difficulty.cs = 4;
        difficulty.ar = 9;
        difficulty.od = 7;
        difficulty.hp = 6;

        mod.applyToDifficulty(Modes.droid, difficulty, new ModMap());

        expect(difficulty.cs).toBeCloseTo(5.2);
        expect(difficulty.ar).toBeCloseTo(10);
        expect(difficulty.od).toBeCloseTo(9.8);
        expect(difficulty.hp).toBeCloseTo(8.4);
    });

    test("osu!droid game mode with adjustment mods", () => {
        const difficulty = new BeatmapDifficulty();

        difficulty.cs = 4;
        difficulty.ar = 9;
        difficulty.od = 7;
        difficulty.hp = 6;

        const map = new ModMap();
        map.set(new ModReplayV6());

        mod.applyToDifficulty(Modes.droid, difficulty, map);

        expect(difficulty.cs).toBeCloseTo(4.887156469449936, 5);
        expect(difficulty.ar).toBeCloseTo(10);
        expect(difficulty.od).toBeCloseTo(9.8);
        expect(difficulty.hp).toBeCloseTo(8.4);
    });

    test("osu!standard game mode", () => {
        const difficulty = new BeatmapDifficulty();

        difficulty.cs = 4;
        difficulty.ar = 9;
        difficulty.od = 7;
        difficulty.hp = 6;

        mod.applyToDifficulty(Modes.osu, difficulty, new ModMap());

        expect(difficulty.cs).toBeCloseTo(5.2);
        expect(difficulty.ar).toBeCloseTo(10);
        expect(difficulty.od).toBeCloseTo(9.8);
        expect(difficulty.hp).toBeCloseTo(8.4);
    });
});
