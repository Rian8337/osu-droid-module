import { readFileSync } from "fs";
import { join } from "path";
import {
    Accuracy,
    Beatmap,
    Circle,
    DroidHitWindow,
    HitResult,
    ModEasy,
    ModMap,
    ObjectTypes,
    PathType,
    Slider,
    SliderPath,
    Vector2,
} from "@rian8337/osu-base";
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

describe("Test hit window with difficulty-adjusting mods", () => {
    // Easy halves OD 7 to 3.5. Applying it twice would give 1.75, whose wider meh window lets a slider
    // break through as a hit.
    const correctMehWindow = new DroidHitWindow(3.5).mehWindow;
    const doubleAppliedMehWindow = new DroidHitWindow(1.75).mehWindow;
    const sliderBreakAccuracy = Math.round(
        (correctMehWindow + doubleAppliedMehWindow) / 2,
    );

    const createMods = () => {
        const mods = new ModMap();
        mods.set(new ModEasy());

        return mods;
    };

    const createBeatmap = () => {
        const beatmap = new Beatmap();
        beatmap.difficulty.od = 7;

        beatmap.hitObjects.add(
            new Circle({ startTime: 1000, position: new Vector2(100) }),
        );

        beatmap.hitObjects.add(
            new Circle({ startTime: 2000, position: new Vector2(100) }),
        );

        beatmap.hitObjects.add(
            new Slider({
                startTime: 3000,
                position: new Vector2(100),
                repeatCount: 0,
                nodeSamples: [],
                path: new SliderPath({
                    pathType: PathType.Linear,
                    controlPoints: [new Vector2(0), new Vector2(400, 0)],
                    expectedDistance: 400,
                }),
                tickDistanceMultiplier: 1,
                type: ObjectTypes.Slider,
            }),
        );

        return beatmap;
    };

    const createData = () =>
        new ReplayV3Data({
            accuracy: new Accuracy({ n300: 2, n100: 0, n50: 1, nmiss: 0 }),
            convertedMods: createMods(),
            cursorMovement: [],
            fileName: "",
            folderName: "",
            hash: "",
            hit100k: 0,
            hit300k: 0,
            // The circles are hit early, so only the slider head can contribute to the positive average.
            hitObjectData: [
                { accuracy: -10, result: HitResult.Great, tickset: [] },
                { accuracy: -10, result: HitResult.Great, tickset: [] },
                {
                    accuracy: sliderBreakAccuracy,
                    result: HitResult.Meh,
                    tickset: [true],
                },
            ],
            isFullCombo: false,
            maxCombo: 0,
            playerName: "",
            rank: "D",
            replayVersion: 9,
            score: 0,
            time: new Date(0),
        });

    const createAnalyzer = (
        map: Beatmap | ReturnType<Beatmap["createDroidPlayableBeatmap"]>,
    ) => {
        const analyzer = new ReplayAnalyzer({ map });
        analyzer.data = createData();

        return analyzer;
    };

    test("Preconditions", () => {
        expect(sliderBreakAccuracy).toBeGreaterThan(correctMehWindow);
        expect(sliderBreakAccuracy).toBeLessThanOrEqual(doubleAppliedMehWindow);
    });

    test("Playable beatmap does not get its mods applied again", () => {
        const analyzer = createAnalyzer(
            createBeatmap().createDroidPlayableBeatmap(createMods()),
        );

        expect(analyzer.calculateHitError()?.positiveAvg).toBe(0);
    });

    test("Non-playable beatmap gets the replay's mods applied", () => {
        const analyzer = createAnalyzer(createBeatmap());

        expect(analyzer.calculateHitError()?.positiveAvg).toBe(0);
    });

    test("Reassigning the beatmap discards the previous playable beatmap", () => {
        // OD 7 with the replay's Easy gives OD 3.5, so the slider head counts as a slider break.
        const analyzer = createAnalyzer(createBeatmap());

        expect(analyzer.calculateHitError()?.positiveAvg).toBe(0);

        // OD 3.5 with the replay's Easy gives OD 1.75, so the slider head counts as a hit.
        const widerBeatmap = createBeatmap();
        widerBeatmap.difficulty.od = 3.5;
        analyzer.beatmap = widerBeatmap;

        expect(analyzer.calculateHitError()?.positiveAvg).toBe(
            sliderBreakAccuracy,
        );
    });
});
