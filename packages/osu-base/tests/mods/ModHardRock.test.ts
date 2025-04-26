import { BeatmapDifficulty, ModHardRock, Modes } from "../../src";

const mod = new ModHardRock();

describe("Test beatmap setting adjustment", () => {
    test("osu!droid game mode", () => {
        const difficulty = new BeatmapDifficulty();

        difficulty.cs = 4;
        difficulty.ar = 9;
        difficulty.od = 7;
        difficulty.hp = 6;

        mod.applyToDifficulty(Modes.droid, difficulty);

        expect(difficulty.cs).toBeCloseTo(5.26);
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

        mod.applyToDifficulty(Modes.osu, difficulty);

        expect(difficulty.cs).toBeCloseTo(5.2);
        expect(difficulty.ar).toBeCloseTo(10);
        expect(difficulty.od).toBeCloseTo(9.8);
        expect(difficulty.hp).toBeCloseTo(8.4);
    });
});
