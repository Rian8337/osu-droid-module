import {
    Circle,
    modes,
    objectTypes,
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
            type: objectTypes.slider,
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
        circleSize: 5.5,
        speedMultiplier: 1,
        mode: modes.osu,
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
                expect(object.opacityAt(400, false, modes.droid)).toBe(0);
                expect(object.opacityAt(600, false, modes.droid)).toBeCloseTo(
                    0.5
                );
                expect(object.opacityAt(800, false, modes.droid)).toBe(1);
                expect(object.opacityAt(1000, false, modes.droid)).toBe(1);
            });

            test("osu!standard", () => {
                expect(object.opacityAt(400, false, modes.osu)).toBe(0);
                expect(object.opacityAt(600, false, modes.osu)).toBeCloseTo(
                    0.5
                );
                expect(object.opacityAt(800, false, modes.osu)).toBe(1);
                expect(object.opacityAt(1000, false, modes.osu)).toBe(1);
            });
        });

        describe("With Hidden mod", () => {
            test("osu!droid", () => {
                expect(object.opacityAt(400, true, modes.droid)).toBe(0);
                expect(object.opacityAt(600, true, modes.droid)).toBeCloseTo(
                    0.5
                );
                expect(object.opacityAt(800, true, modes.droid)).toBe(1);
                expect(object.opacityAt(900, true, modes.droid)).toBeCloseTo(
                    0.5238095238095238
                );
                expect(object.opacityAt(1000, true, modes.droid)).toBeCloseTo(
                    0.04761904761904767
                );
                expect(object.opacityAt(1100, true, modes.droid)).toBe(0);
            });

            test("osu!standard", () => {
                expect(object.opacityAt(400, true, modes.osu)).toBe(0);
                expect(object.opacityAt(600, true, modes.osu)).toBeCloseTo(0.5);
                expect(object.opacityAt(800, true, modes.osu)).toBe(1);
                expect(object.opacityAt(900, true, modes.osu)).toBeCloseTo(
                    0.44
                );
                expect(object.opacityAt(1000, true, modes.osu)).toBe(0);
            });
        });
    });

    test("After hit time", () => {
        expect(object.opacityAt(1100, false, modes.droid)).toBe(0);
        expect(object.opacityAt(1100, false, modes.osu)).toBe(0);
        expect(object.opacityAt(1100, true, modes.droid)).toBe(0);
        expect(object.opacityAt(1100, true, modes.osu)).toBe(0);
    });
});
