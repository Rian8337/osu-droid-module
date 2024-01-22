import {
    Circle,
    Modes,
    ObjectTypes,
    PathType,
    Slider,
    SliderPath,
    Vector2,
} from "@rian8337/osu-base";
import { DifficultyHitObjectCreator } from "../../src";

const createDifficultyHitObjects = () => {
    const objects = [
        new Circle({
            startTime: 1000,
            position: new Vector2(100, 100),
        }),
        new Slider({
            startTime: 1500,
            position: new Vector2(150, 100),
            mapSliderVelocity: 1,
            mapTickRate: 1,
            msPerBeat: 300,
            nodeSamples: [],
            speedMultiplier: 1,
            tickDistanceMultiplier: 1,
            type: ObjectTypes.slider,
            repetitions: 1,
            path: new SliderPath({
                pathType: PathType.Linear,
                controlPoints: [new Vector2(250, 100)],
                expectedDistance: 100,
            }),
        }),
    ];

    return new DifficultyHitObjectCreator().generateDifficultyObjects({
        objects: objects,
        mods: [],
        speedMultiplier: 1,
        mode: Modes.osu,
    });
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
    const difficultyHitObjects = createDifficultyHitObjects();

    const object = difficultyHitObjects[0];

    describe("Before and during hit time", () => {
        describe("Without Hidden mod", () => {
            test("osu!droid", () => {
                expect(object.opacityAt(400, false)).toBe(0);
                expect(object.opacityAt(600, false)).toBeCloseTo(0.5);
                expect(object.opacityAt(800, false)).toBe(1);
                expect(object.opacityAt(1000, false)).toBe(1);
            });

            test("osu!standard", () => {
                expect(object.opacityAt(400, false)).toBe(0);
                expect(object.opacityAt(600, false)).toBeCloseTo(0.5);
                expect(object.opacityAt(800, false)).toBe(1);
                expect(object.opacityAt(1000, false)).toBe(1);
            });
        });

        describe("With Hidden mod", () => {
            test("osu!droid", () => {
                expect(object.opacityAt(400, true)).toBe(0);
                expect(object.opacityAt(600, true)).toBeCloseTo(0.5);
                expect(object.opacityAt(800, true)).toBe(1);
                expect(object.opacityAt(900, true)).toBeCloseTo(
                    0.4444444444444444,
                );
                expect(object.opacityAt(1000, true)).toBeCloseTo(0);
                expect(object.opacityAt(1100, true)).toBe(0);
            });

            test("osu!standard", () => {
                expect(object.opacityAt(400, true)).toBe(0);
                expect(object.opacityAt(600, true)).toBeCloseTo(0.5);
                expect(object.opacityAt(800, true)).toBe(1);
                expect(object.opacityAt(900, true)).toBeCloseTo(0.44);
                expect(object.opacityAt(1000, true)).toBe(0);
            });
        });
    });

    test("After hit time", () => {
        expect(object.opacityAt(1100, false)).toBe(0);
        expect(object.opacityAt(1100, false)).toBe(0);
        expect(object.opacityAt(1100, true)).toBe(0);
        expect(object.opacityAt(1100, true)).toBe(0);
    });
});
