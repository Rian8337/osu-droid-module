import {
    Circle,
    ModHardRock,
    Modes,
    PathType,
    Slider,
    SliderPath,
    Vector2,
} from "../../src";

const mod = new ModHardRock();

test("Test vertically flipping circle", () => {
    const circle = new Circle({
        startTime: 100,
        position: new Vector2(100, 100),
    });

    mod.applyToHitObject(Modes.droid, circle);

    expect(circle.position.y).toBe(284);
});

test("Test vertically flipping slider", () => {
    const slider = new Slider({
        startTime: 100,
        type: 2,
        nodeSamples: [],
        path: new SliderPath({
            pathType: PathType.Linear,
            controlPoints: [new Vector2(0, 0), new Vector2(10, 10)],
            expectedDistance: 10 * Math.SQRT2,
        }),
        position: new Vector2(100, 100),
        repeatCount: 1,
        tickDistanceMultiplier: 1,
    });

    mod.applyToHitObject(Modes.droid, slider);

    expect(slider.position.y).toBe(284);
    expect(slider.path.controlPoints[1].y).toBe(-10);
});
