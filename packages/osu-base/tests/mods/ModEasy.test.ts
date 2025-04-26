import { BeatmapDifficulty, ModEasy, Modes } from "../../src";

describe("Test beatmap setting adjustment", () => {
    test("osu!droid game mode", () => {
        const difficulty = new BeatmapDifficulty();

        difficulty.cs = 4;
        difficulty.ar = 9;
        difficulty.od = 7;
        difficulty.hp = 6;

        new ModEasy().applyToDifficulty(Modes.droid, difficulty);

        expect(difficulty.cs).toBeCloseTo(2.74);
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

        new ModEasy().applyToDifficulty(Modes.osu, difficulty);

        expect(difficulty.cs).toBeCloseTo(2);
        expect(difficulty.ar).toBeCloseTo(4.5);
        expect(difficulty.od).toBeCloseTo(3.5);
        expect(difficulty.hp).toBeCloseTo(3);
    });
});
