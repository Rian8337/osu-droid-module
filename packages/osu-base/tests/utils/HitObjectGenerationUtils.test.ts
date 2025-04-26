import {
    BeatmapControlPoints,
    BeatmapDifficulty,
    HitObjectGenerationUtils,
    Modes,
    ObjectTypes,
    PathType,
    Slider,
    SliderPath,
    Vector2,
} from "../../src";

const createSlider = () => {
    const slider = new Slider({
        startTime: 0,
        position: new Vector2(100),
        repeatCount: 0,
        path: new SliderPath({
            pathType: PathType.Linear,
            controlPoints: [new Vector2(0), new Vector2(200, 0)],
            expectedDistance: 200,
        }),
        type: ObjectTypes.slider,
        tickDistanceMultiplier: 1,
        nodeSamples: [],
    });

    slider.applyDefaults(
        new BeatmapControlPoints(),
        new BeatmapDifficulty(),
        Modes.droid,
    );

    return slider;
};

test("Test horizontal reflection", () => {
    const slider = createSlider();

    HitObjectGenerationUtils.reflectHorizontallyAlongPlayfield(slider);

    expect(slider.position).toEqual(new Vector2(412, 100));
    expect(slider.endPosition).toEqual(new Vector2(212, 100));
    expect(slider.nestedHitObjects[1].position).toEqual(new Vector2(312, 100));
});

test("Test vertical reflection", () => {
    const slider = createSlider();

    HitObjectGenerationUtils.reflectVerticallyAlongPlayfield(slider);

    expect(slider.position).toEqual(new Vector2(100, 284));
    expect(slider.endPosition).toEqual(new Vector2(300, 284));
    expect(slider.nestedHitObjects[1].position).toEqual(new Vector2(200, 284));
});
