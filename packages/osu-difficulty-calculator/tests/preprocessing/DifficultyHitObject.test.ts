import {
    BeatmapControlPoints,
    BeatmapDifficulty,
    Circle,
    ModHidden,
    ModMap,
    Modes,
    ObjectTypes,
    PathType,
    Slider,
    SliderPath,
    TimingControlPoint,
    Vector2,
} from "@rian8337/osu-base";
import { DroidDifficultyHitObject } from "../../src";

const createDifficultyHitObjects = () => {
    const objects = [
        new Circle({
            startTime: 1000,
            position: new Vector2(100, 100),
        }),
        new Slider({
            startTime: 1500,
            position: new Vector2(150, 100),
            nodeSamples: [],
            tickDistanceMultiplier: 1,
            type: ObjectTypes.slider,
            repeatCount: 0,
            path: new SliderPath({
                pathType: PathType.Linear,
                controlPoints: [new Vector2(250, 100)],
                expectedDistance: 100,
            }),
        }),
    ];

    const controlPoints = new BeatmapControlPoints();
    controlPoints.timing.add(
        new TimingControlPoint({ time: 0, msPerBeat: 300, timeSignature: 4 }),
    );

    const difficulty = new BeatmapDifficulty();
    difficulty.ar = 9;

    for (const object of objects) {
        object.applyDefaults(controlPoints, difficulty, Modes.osu);
    }

    const difficultyObjects: DroidDifficultyHitObject[] = [];

    for (let i = 0; i < objects.length; ++i) {
        const difficultyObject = new DroidDifficultyHitObject(
            objects[i],
            objects[i - 1] ?? null,
            difficultyObjects,
            1,
            i - 1,
        );

        difficultyObject.computeProperties(1);
        difficultyObjects.push(difficultyObject);
    }

    return difficultyObjects;
};

test("Test previous index", () => {
    const difficultyHitObjects = createDifficultyHitObjects();

    expect(difficultyHitObjects[0].previous(0)).toBeNull();
    expect(difficultyHitObjects[1].previous(0)).not.toBeNull();
});

test("Test next index", () => {
    const difficultyHitObjects = createDifficultyHitObjects();

    expect(difficultyHitObjects[0].next(0)).not.toBeNull();
    expect(difficultyHitObjects[1].next(0)).toBeNull();
});

describe("Test object opacity", () => {
    const object = createDifficultyHitObjects()[0];

    const map = new ModMap();
    const hiddenMap = new ModMap();
    hiddenMap.set(new ModHidden());

    describe("Before and during hit time", () => {
        test("Without Hidden mod", () => {
            expect(object.opacityAt(400, map)).toBe(0);
            expect(object.opacityAt(600, map)).toBeCloseTo(0.5);
            expect(object.opacityAt(800, map)).toBe(1);
            expect(object.opacityAt(1000, map)).toBe(1);
        });

        test("With Hidden mod", () => {
            expect(object.opacityAt(400, hiddenMap)).toBe(0);
            expect(object.opacityAt(600, hiddenMap)).toBeCloseTo(0.5);
            expect(object.opacityAt(800, hiddenMap)).toBe(1);
            expect(object.opacityAt(900, hiddenMap)).toBeCloseTo(0.44);
            expect(object.opacityAt(1000, hiddenMap)).toBe(0);
        });
    });

    test("After hit time", () => {
        expect(object.opacityAt(1100, map)).toBe(0);
        expect(object.opacityAt(1100, map)).toBe(0);
        expect(object.opacityAt(1100, hiddenMap)).toBe(0);
        expect(object.opacityAt(1100, hiddenMap)).toBe(0);
    });
});
