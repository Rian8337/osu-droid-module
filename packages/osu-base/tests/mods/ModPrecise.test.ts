import {
    BeatmapControlPoints,
    BeatmapDifficulty,
    Circle,
    EmptyHitWindow,
    ModPrecise,
    Modes,
    ObjectTypes,
    PathType,
    PreciseDroidHitWindow,
    Slider,
    SliderPath,
    Spinner,
    Vector2,
} from "../../src";

const mod = new ModPrecise();

describe("Test hit window application", () => {
    test("Circle", () => {
        const circle = new Circle({
            startTime: 0,
            position: new Vector2(0),
        });

        circle.applyDefaults(
            new BeatmapControlPoints(),
            new BeatmapDifficulty(),
            Modes.Droid,
        );

        mod.applyToHitObject(Modes.Droid, circle);

        expect(circle.hitWindow).toBeInstanceOf(PreciseDroidHitWindow);
        expect(circle.hitWindow?.overallDifficulty).toBe(5);
    });

    test("Slider", () => {
        const slider = new Slider({
            startTime: 0,
            position: new Vector2(0),
            repeatCount: 0,
            path: new SliderPath({
                pathType: PathType.Linear,
                controlPoints: [new Vector2(0), new Vector2(100, 0)],
                expectedDistance: 100,
            }),
            type: ObjectTypes.Slider,
            tickDistanceMultiplier: 1,
            nodeSamples: [],
        });

        slider.applyDefaults(
            new BeatmapControlPoints(),
            new BeatmapDifficulty(),
            Modes.Droid,
        );

        mod.applyToHitObject(Modes.Droid, slider);

        // Ensure that the hit window is not applied to the slider itself.
        expect(slider.hitWindow).toBeInstanceOf(EmptyHitWindow);
        expect(slider.head.hitWindow).toBeInstanceOf(PreciseDroidHitWindow);
        expect(slider.head.hitWindow?.overallDifficulty).toBe(5);
    });

    test("Spinner", () => {
        const spinner = new Spinner({
            startTime: 0,
            endTime: 1000,
            type: ObjectTypes.Spinner,
        });

        spinner.applyDefaults(
            new BeatmapControlPoints(),
            new BeatmapDifficulty(),
            Modes.Droid,
        );

        mod.applyToHitObject(Modes.Droid, spinner);

        expect(spinner.hitWindow).toBeInstanceOf(EmptyHitWindow);
    });
});
