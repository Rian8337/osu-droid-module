import { readFileSync } from "fs";
import { join } from "path";
import {
    Accuracy,
    Beatmap,
    Circle,
    DroidHitWindow,
    HitResult,
    ModEasy,
    ModHardRock,
    ModMap,
    ObjectTypes,
    PathType,
    Slider,
    SliderPath,
    Vector2,
} from "@rian8337/osu-base";
import { IExtendedDroidDifficultyAttributes } from "@rian8337/osu-difficulty-calculator";
import { MovementType, ReplayAnalyzer, ReplayV3Data } from "../src";
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

describe("Test slider head hit window in old replays", () => {
    const createBeatmap = () => {
        const beatmap = new Beatmap();
        beatmap.difficulty.od = 7;

        // A slider shorter than its meh window.
        beatmap.hitObjects.add(
            new Slider({
                startTime: 1000,
                position: new Vector2(100),
                repeatCount: 0,
                nodeSamples: [],
                path: new SliderPath({
                    pathType: PathType.Linear,
                    controlPoints: [new Vector2(0), new Vector2(5, 0)],
                    expectedDistance: 5,
                }),
                tickDistanceMultiplier: 1,
                type: ObjectTypes.Slider,
            }),
        );

        return beatmap.createDroidPlayableBeatmap(new ModMap());
    };

    const beatmap = createBeatmap();
    const slider = beatmap.hitObjects.objects[0] as Slider;
    const { mehWindow } = slider.head.hitWindow!;

    // Earlier than the meh window allows.
    const earlyHeadAccuracy = -Math.ceil(mehWindow) - 10;

    const createAnalyzer = (replayVersion: number) => {
        const analyzer = new ReplayAnalyzer({ map: createBeatmap() });

        analyzer.data = new ReplayV3Data({
            accuracy: new Accuracy({ n300: 0, n100: 0, n50: 1, nmiss: 0 }),
            convertedMods: new ModMap(),
            cursorMovement: [],
            fileName: "",
            folderName: "",
            hash: "",
            hit100k: 0,
            hit300k: 0,
            hitObjectData: [
                {
                    accuracy: earlyHeadAccuracy,
                    result: HitResult.Meh,
                    tickset: [true],
                },
            ],
            isFullCombo: false,
            maxCombo: 0,
            playerName: "",
            rank: "D",
            replayVersion,
            score: 0,
            time: new Date(0),
        });

        return analyzer;
    };

    test("Preconditions", () => {
        expect(slider.duration).toBeLessThan(mehWindow);
    });

    test("Before replay version 6, an early head counts as hit", () => {
        const analyzer = createAnalyzer(5);

        expect(analyzer.calculateHitError()?.negativeAvg).toBe(
            earlyHeadAccuracy,
        );
        expect(analyzer.obtainSliderHitInformation()?.head.obtained).toBe(1);
    });

    test("From replay version 6, an early head counts as a slider break", () => {
        const analyzer = createAnalyzer(6);

        expect(analyzer.calculateHitError()?.negativeAvg).toBe(0);
        expect(analyzer.obtainSliderHitInformation()?.head.obtained).toBe(0);
    });
});

describe("Test cursor position parsing", () => {
    /**
     * Builds the movement data of one cursor that touches down at each of the given points, in the format of replay
     * versions before 5.
     */
    const buildMovementData = (points: [number, number][]) => {
        const parts: Buffer[] = [];

        const header = Buffer.alloc(8);
        header.writeInt32BE(1);
        header.writeInt32BE(points.length * 2, 4);
        parts.push(header);

        points.forEach(([x, y], i) => {
            const down = Buffer.alloc(8);
            down.writeInt32BE(((i * 100) << 2) | MovementType.Down);
            down.writeInt16BE(x, 4);
            down.writeInt16BE(y, 6);

            const up = Buffer.alloc(4);
            up.writeInt32BE(((i * 100 + 50) << 2) | MovementType.Up);

            parts.push(down, up);
        });

        return Buffer.concat(parts);
    };

    const createBeatmap = () => {
        const beatmap = new Beatmap();

        beatmap.hitObjects.add(
            new Circle({ startTime: 1000, position: new Vector2(256, 192) }),
        );

        return beatmap;
    };

    const createHardRockMods = () => {
        const mods = new ModMap();
        mods.set(new ModHardRock());

        return mods;
    };

    const parse = (
        analyzer: ReplayAnalyzer,
        replayVersion: number,
        points: [number, number][],
    ) => {
        const information = {
            replayVersion,
            cursorMovement: [],
        } as unknown as ReplayInformation;

        // Movement data parsing is private; reach it directly to avoid building a whole serialized replay.
        (
            analyzer as unknown as {
                parseMovementData(
                    information: ReplayInformation,
                    buffer: Buffer,
                ): void;
            }
        ).parseMovementData(information, buildMovementData(points));

        return information.cursorMovement[0].occurrenceGroups.map(
            (group) => group.down.position,
        );
    };

    test("Replay version 1 positions are converted from screen space", () => {
        // The screen was 1024x600, with the 820x570 playfield centered in it.
        const positions = parse(new ReplayAnalyzer(), 1, [
            [102, 15],
            [512, 300],
            [922, 585],
        ]);

        expect(positions[0]).toEqual(new Vector2(0, 0));
        expect(positions[1]).toEqual(new Vector2(256, 192));
        expect(positions[2]).toEqual(new Vector2(512, 384));
    });

    test("Replay version 1 positions have the Hard Rock flip undone when the beatmap has Hard Rock", () => {
        const analyzer = new ReplayAnalyzer({
            map: createBeatmap().createDroidPlayableBeatmap(
                createHardRockMods(),
            ),
        });

        const [position] = parse(analyzer, 1, [[512, 129]]);

        expect(position.x).toBeCloseTo(256);
        expect(position.y).toBeCloseTo(307.2);
    });

    test("Replay version 1 positions have the Hard Rock flip undone when the difficulty attributes have Hard Rock", () => {
        const analyzer = new ReplayAnalyzer({
            map: createBeatmap(),
            difficultyAttributes: {
                mods: createHardRockMods(),
            } as unknown as IExtendedDroidDifficultyAttributes,
        });

        const [position] = parse(analyzer, 1, [[512, 129]]);

        expect(position.y).toBeCloseTo(307.2);
    });

    test("Replay version 1 positions keep the flip when Hard Rock is not known", () => {
        const analyzer = new ReplayAnalyzer({ map: createBeatmap() });

        const [position] = parse(analyzer, 1, [[512, 129]]);

        expect(position.y).toBeCloseTo(76.8);
    });

    test("Replay version 2 positions are already in playfield space", () => {
        const analyzer = new ReplayAnalyzer({
            map: createBeatmap().createDroidPlayableBeatmap(
                createHardRockMods(),
            ),
        });

        const [position] = parse(analyzer, 2, [[100, 200]]);

        expect(position).toEqual(new Vector2(100, 200));
    });
});
