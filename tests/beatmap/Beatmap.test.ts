import {
    Beatmap,
    Circle,
    DifficultyControlPoint,
    objectTypes,
    PathType,
    Slider,
    SliderPath,
    Spinner,
    TimingControlPoint,
    Vector2,
} from "../../src";

const createGlobalSliderValues = () => {
    const controlPoints = [new Vector2(0, 0), new Vector2(200, 0)];

    // Will generate 1 slider tick by default
    return {
        startTime: 1000,
        type: objectTypes.slider,
        position: new Vector2(100, 192),
        repetitions: 1,
        path: new SliderPath({
            pathType: PathType.Linear,
            controlPoints: controlPoints,
            expectedDistance: controlPoints
                .at(-1)!
                .getDistance(controlPoints[0]),
        }),
        speedMultiplier: 1,
        msPerBeat: 1000,
        mapSliderVelocity: 1,
        mapTickRate: 1,
        tickDistanceMultiplier: 1,
    };
};

test("Test time offset", () => {
    const beatmap = new Beatmap();

    beatmap.formatVersion = 3;

    expect(beatmap.getOffsetTime(1000)).toBe(1024);

    beatmap.formatVersion = 4;

    expect(beatmap.getOffsetTime(1000)).toBe(1024);

    beatmap.formatVersion = 10;

    expect(beatmap.getOffsetTime(1000)).toBe(1000);
});

test("Test timing control point getter", () => {
    const beatmap = new Beatmap();

    beatmap.timingPoints.push(
        new TimingControlPoint({
            time: 1000,
            msPerBeat: 100,
        }),
        new TimingControlPoint({
            time: 5000,
            msPerBeat: 100,
        })
    );

    let timingPoint = beatmap.timingControlPointAt(0);

    expect(timingPoint.time).toBe(1000);

    timingPoint = beatmap.timingControlPointAt(7000);

    expect(timingPoint.time).toBe(5000);
});

test("Test difficulty control point getter", () => {
    const beatmap = new Beatmap();

    beatmap.difficultyTimingPoints.push(
        new DifficultyControlPoint({
            time: 1000,
            speedMultiplier: 1,
        }),
        new DifficultyControlPoint({
            time: 5000,
            speedMultiplier: 1,
        })
    );

    let timingPoint = beatmap.difficultyControlPointAt(0);

    expect(timingPoint.time).toBe(1000);

    timingPoint = beatmap.difficultyControlPointAt(7000);

    expect(timingPoint.time).toBe(5000);
});

test("Test slider ticks getter", () => {
    const beatmap = new Beatmap();

    beatmap.objects.push(new Slider(createGlobalSliderValues()));

    expect(beatmap.sliderTicks).toBe(1);

    beatmap.objects.push(
        new Slider({
            ...createGlobalSliderValues(),
            repetitions: 2,
        })
    );

    expect(beatmap.sliderTicks).toBe(3);

    beatmap.objects.push(
        new Slider({
            ...createGlobalSliderValues(),
            repetitions: 4,
        })
    );

    expect(beatmap.sliderTicks).toBe(7);

    beatmap.objects.push(
        new Slider({
            ...createGlobalSliderValues(),
            repetitions: 8,
        })
    );

    expect(beatmap.sliderTicks).toBe(15);
});

test("Test slider ends getter", () => {
    const beatmap = new Beatmap();

    beatmap.objects.push(new Slider(createGlobalSliderValues()));
    ++beatmap.sliders;

    expect(beatmap.sliderEnds).toBe(1);

    beatmap.objects.push(new Slider(createGlobalSliderValues()));
    beatmap.objects.push(new Slider(createGlobalSliderValues()));
    beatmap.sliders += 2;

    expect(beatmap.sliderEnds).toBe(3);

    beatmap.objects.pop();
    --beatmap.sliders;

    expect(beatmap.sliderEnds).toBe(2);

    beatmap.objects.length = beatmap.sliders = 0;

    expect(beatmap.sliderEnds).toBe(0);
});

test("Test slider repeat points getter", () => {
    const beatmap = new Beatmap();

    beatmap.objects.push(new Slider(createGlobalSliderValues()));
    ++beatmap.sliders;

    expect(beatmap.sliderRepeatPoints).toBe(0);

    beatmap.objects.push(
        new Slider({
            ...createGlobalSliderValues(),
            repetitions: 2,
        })
    );
    ++beatmap.sliders;

    expect(beatmap.sliderRepeatPoints).toBe(1);

    beatmap.objects.push(
        new Slider({
            ...createGlobalSliderValues(),
            repetitions: 4,
        })
    );
    ++beatmap.sliders;

    expect(beatmap.sliderRepeatPoints).toBe(4);

    beatmap.objects.push(
        new Slider({
            ...createGlobalSliderValues(),
            repetitions: 8,
        })
    );
    ++beatmap.sliders;

    expect(beatmap.sliderRepeatPoints).toBe(11);
});

test("Test max combo getter", () => {
    const beatmap = new Beatmap();

    expect(beatmap.maxCombo).toBe(0);

    beatmap.objects.push(
        new Circle({
            startTime: 1000,
            position: new Vector2(0, 0),
        })
    );
    ++beatmap.circles;

    expect(beatmap.maxCombo).toBe(1);

    beatmap.objects.push(new Slider(createGlobalSliderValues()));
    ++beatmap.sliders;

    expect(beatmap.maxCombo).toBe(4);

    beatmap.objects.push(
        new Spinner({
            startTime: 1000,
            type: objectTypes.spinner,
            duration: 100,
        })
    );
    ++beatmap.spinners;

    expect(beatmap.maxCombo).toBe(5);
});
