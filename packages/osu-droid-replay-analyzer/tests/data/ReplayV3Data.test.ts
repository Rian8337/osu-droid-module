import {
    Accuracy,
    BeatmapDifficulty,
    ModDoubleTime,
    ModHidden,
    ModMap,
    ModPrecise,
} from "@rian8337/osu-base";
import { ReplayV3Data } from "../../src";

const createReplayV3Data = (
    replayVersion: number,
    score: number,
    mods: ModMap,
): ReplayV3Data =>
    new ReplayV3Data({
        replayVersion,
        folderName: "",
        fileName: "",
        hash: "",
        time: new Date(),
        hit300k: 0,
        hit100k: 0,
        score,
        maxCombo: 0,
        accuracy: new Accuracy({ n300: 100 }),
        isFullCombo: true,
        playerName: "",
        rank: "S",
        convertedMods: mods,
        cursorMovement: [],
        hitObjectData: [],
    });

describe("Test getTotalScore", () => {
    test("Returns score directly for replay version < 8", () => {
        const mods = new ModMap();
        mods.set(ModHidden);
        mods.set(ModDoubleTime);
        mods.set(ModPrecise);

        const data = createReplayV3Data(7, 29672490, mods);

        expect(data.getTotalScore()).toBe(29672490);
    });

    test("Applies the current score multiplier for replay version >= 8", () => {
        // Base score 23578940 with HD + DT + PR.
        // Without a difficulty, Precise falls back to its difficulty-independent multiplier (1.06).
        // HD (1.06) * DT (1.23) * PR (1.06) = 1.382028
        const mods = new ModMap();
        mods.set(ModHidden);
        mods.set(ModDoubleTime);
        mods.set(ModPrecise);

        const data = createReplayV3Data(8, 23578940, mods);

        expect(data.getTotalScore()).toBe(32586755);
    });

    test("Uses the supplied difficulty for difficulty-dependent mods", () => {
        const mods = new ModMap();
        mods.set(ModPrecise);

        const data = createReplayV3Data(8, 1000000, mods);

        // Without a difficulty, Precise falls back to a flat 1.06 multiplier.
        expect(data.getTotalScore()).toBe(1060000);

        // With a difficulty, Precise multiplier = 1.02 + 0.08 * (od / 10)^2.
        // od = 5 -> 1.02 + 0.08 * 0.25 = 1.04
        const difficulty = new BeatmapDifficulty();
        difficulty.od = 5;

        expect(data.getTotalScore(difficulty)).toBe(1040000);
    });
});
