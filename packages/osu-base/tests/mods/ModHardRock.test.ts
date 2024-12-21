import {
    BeatmapControlPoints,
    BeatmapDifficulty,
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
    const mode = Modes.droid;

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
        repeatCount: 0,
        tickDistanceMultiplier: 1,
    });

    slider.applyDefaults(
        new BeatmapControlPoints(),
        new BeatmapDifficulty(),
        mode,
    );

    mod.applyToHitObject(mode, slider);

    expect(slider.position.y).toBe(284);
    expect(slider.head.position.y).toBe(284);
    expect(slider.tail.position.y).toBe(274);
    expect(slider.path.controlPoints[1].y).toBe(-10);
});
