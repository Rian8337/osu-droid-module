import { readFileSync } from "fs";
import { join } from "path";
import { HitResult } from "@rian8337/osu-base";
import { ReplayAnalyzer, ReplayV3Data } from "../src";
import { ReplayInformation } from "../src/data/ReplayInformation";

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

describe("Test hit object data parsing", () => {
    const buildHitObjectData = (
        objects: { accuracy: number; tickset: number[]; result: number }[],
    ) => {
        const parts: Buffer[] = [];

        const count = Buffer.alloc(4);
        count.writeInt32BE(objects.length);
        parts.push(count);

        for (const object of objects) {
            const header = Buffer.alloc(3);
            header.writeInt16BE(object.accuracy);
            // The client writes the low byte of the length, so 128-255 bytes are stored intact.
            header.writeUInt8(object.tickset.length & 0xff, 2);

            parts.push(
                header,
                Buffer.from(object.tickset),
                Buffer.from([object.result]),
            );
        }

        return Buffer.concat(parts);
    };

    const parse = (buffer: Buffer) => {
        const analyzer = new ReplayAnalyzer();
        const information = {
            replayVersion: 9,
            hitObjectData: [],
        } as unknown as ReplayInformation;

        // Hit object data parsing is private; reach it directly to avoid building a whole serialized replay.
        (
            analyzer as unknown as {
                parseHitObjectData(
                    information: ReplayInformation,
                    buffer: Buffer,
                ): void;
            }
        ).parseHitObjectData(information, buffer);

        return information.hitObjectData;
    };

    test("Tickset longer than 127 bytes", () => {
        // 200 bytes hold the ticks of a slider with up to 1600 nested objects. The last byte comes first.
        const tickset = new Array<number>(200).fill(0);
        tickset[0] = 0x80;
        tickset[199] = 0x01;

        const [slider, circle] = parse(
            buildHitObjectData([
                { accuracy: 12, tickset, result: HitResult.Good },
                { accuracy: -5, tickset: [], result: HitResult.Great },
            ]),
        );

        expect(slider.tickset).toHaveLength(1600);
        expect(slider.tickset[0]).toBe(true);
        expect(slider.tickset[1599]).toBe(true);
        expect(slider.tickset.filter(Boolean)).toHaveLength(2);
        expect(slider.result).toBe(HitResult.Good);

        expect(circle.accuracy).toBe(-5);
        expect(circle.tickset).toHaveLength(0);
        expect(circle.result).toBe(HitResult.Great);
    });
});
