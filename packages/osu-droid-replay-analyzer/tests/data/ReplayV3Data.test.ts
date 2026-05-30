import {
    Accuracy,
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

describe("Test totalScore getter", () => {
    test("Returns score directly for replay version < 8", () => {
        const mods = new ModMap();
        mods.set(ModHidden);
        mods.set(ModDoubleTime);
        mods.set(ModPrecise);

        const data = createReplayV3Data(7, 29672490, mods);

        expect(data.totalScore).toBe(29672490);
    });

    describe("Uses single-precision floating point for replay version >= 8", () => {
        // The osu!droid client computes total score as:
        //   (baseScore * scoreMultiplier).roundToInt()
        // using Java float (32-bit) for the multiplier and the final product.
        // JavaScript's native number is 64-bit, so Math.fround must be applied
        // to match the client's results.

        test("HD + DT + PR with base score 23578940 matches Java client", () => {
            // Java: (23578940 * (1.06f * 1.06f * 1.12f)).roundToInt() = 29672490.
            // A naive double-precision calculation yields 29672493.
            const mods = new ModMap();
            mods.set(ModHidden);
            mods.set(ModDoubleTime);
            mods.set(ModPrecise);

            const data = createReplayV3Data(8, 23578940, mods);

            expect(data.totalScore).toBe(29672490);
        });

        test("Result differs from double-precision calculation", () => {
            const mods = new ModMap();
            mods.set(ModHidden);
            mods.set(ModDoubleTime);
            mods.set(ModPrecise);

            const data = createReplayV3Data(8, 23578940, mods);

            expect(data.totalScore).not.toBe(
                Math.round(23578940 * (1.06 * 1.06 * 1.12)),
            );
        });
    });
});
