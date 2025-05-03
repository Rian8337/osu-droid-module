import { BeatmapDifficulty, ModEasy, ModMap, Modes } from "../../src";
import { ModReplayV6 } from "../../src/mods/ModReplayV6";

describe("Test beatmap setting adjustment", () => {
    test("osu!droid game mode", () => {
        const difficulty = new BeatmapDifficulty();

        difficulty.cs = 4;
        difficulty.ar = 9;
        difficulty.od = 7;
        difficulty.hp = 6;

        new ModEasy().applyToDifficulty(Modes.droid, difficulty, new ModMap());

        expect(difficulty.cs).toBeCloseTo(2);
        expect(difficulty.ar).toBeCloseTo(4.5);
        expect(difficulty.od).toBeCloseTo(3.5);
        expect(difficulty.hp).toBeCloseTo(3);
    });

    test("osu!droid game mode with adjustment mods", () => {
        const difficulty = new BeatmapDifficulty();

        difficulty.cs = 4;
        difficulty.ar = 9;
        difficulty.od = 7;
        difficulty.hp = 6;

        const map = new ModMap();
        map.set(new ModReplayV6());

        new ModEasy().applyToDifficulty(Modes.droid, difficulty, map);

        expect(difficulty.cs).toBeCloseTo(3.112843530550064, 5);
        expect(difficulty.ar).toBeCloseTo(4.5);
        expect(difficulty.od).toBeCloseTo(3.5);
        expect(difficulty.hp).toBeCloseTo(3);
    });

    test("osu!standard game mode", () => {
        const difficulty = new BeatmapDifficulty();

        difficulty.cs = 4;
        difficulty.ar = 9;
        difficulty.od = 7;
        difficulty.hp = 6;

        new ModEasy().applyToDifficulty(Modes.osu, difficulty, new ModMap());

        expect(difficulty.cs).toBeCloseTo(2);
        expect(difficulty.ar).toBeCloseTo(4.5);
        expect(difficulty.od).toBeCloseTo(3.5);
        expect(difficulty.hp).toBeCloseTo(3);
    });
});
