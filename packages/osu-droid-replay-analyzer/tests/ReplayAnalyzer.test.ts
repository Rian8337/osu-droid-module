import { readFileSync } from "fs";
import { join } from "path";
import { ReplayAnalyzer, ReplayV3Data } from "../src";

const replay = readFileSync(
    join(process.cwd(), "tests", "files", "replay.odr"),
);

const analyze = async (file: Buffer) => {
    const analyzer = new ReplayAnalyzer();
    analyzer.originalODR = file;

    return analyzer.analyze();
};

describe("Test replay analysis", () => {
    test("Complete replay", async () => {
        const analyzer = await analyze(replay);

        expect(analyzer.data).not.toBeNull();
        expect(analyzer.data?.isReplayV3()).toBe(true);
        expect((analyzer.data as ReplayV3Data).playerName).toBe("Rian8337");
    });

    test.each([0.02, 0.5, 0.9])(
        "Replay truncated inside its data entry (%s of the file)",
        async (fraction) => {
            const analyzer = await analyze(
                replay.subarray(0, Math.floor(replay.length * fraction)),
            );

            expect(analyzer.data).toBeNull();
        },
    );
});
