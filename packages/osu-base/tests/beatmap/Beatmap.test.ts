import {
    Beatmap,
    Circle,
    DifficultyControlPoint,
    EffectControlPoint,
    MapStats,
    ModHidden,
    objectTypes,
    PathType,
    SampleBank,
    SampleControlPoint,
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
        nodeSamples: [],
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

    beatmap.controlPoints.timing.points.push(
        new TimingControlPoint({
            time: 1000,
            msPerBeat: 100,
            timeSignature: 4,
        }),
        new TimingControlPoint({
            time: 5000,
            msPerBeat: 100,
            timeSignature: 4,
        })
    );

    let timingPoint = beatmap.controlPoints.timing.controlPointAt(0);

    expect(timingPoint.time).toBe(1000);

    timingPoint = beatmap.controlPoints.timing.controlPointAt(3000);

    expect(timingPoint.time).toBe(1000);

    timingPoint = beatmap.controlPoints.timing.controlPointAt(7000);

    expect(timingPoint.time).toBe(5000);
});

test("Test difficulty control point getter", () => {
    const beatmap = new Beatmap();

    beatmap.controlPoints.difficulty.points.push(
        new DifficultyControlPoint({
            time: 1000,
            speedMultiplier: 1,
        }),
        new DifficultyControlPoint({
            time: 5000,
            speedMultiplier: 1,
        })
    );

    let timingPoint = beatmap.controlPoints.difficulty.controlPointAt(0);

    expect(timingPoint.time).toBe(0);

    timingPoint = beatmap.controlPoints.difficulty.controlPointAt(3000);

    expect(timingPoint?.time).toBe(1000);

    timingPoint = beatmap.controlPoints.difficulty.controlPointAt(7000);

    expect(timingPoint?.time).toBe(5000);
});

test("Test effect control point getter", () => {
    const beatmap = new Beatmap();

    beatmap.controlPoints.effect.points.push(
        new EffectControlPoint({
            time: 1000,
            isKiai: false,
            omitFirstBarLine: false,
        }),
        new EffectControlPoint({
            time: 5000,
            isKiai: false,
            omitFirstBarLine: false,
        })
    );

    let timingPoint = beatmap.controlPoints.effect.controlPointAt(0);

    expect(timingPoint.time).toBe(0);

    timingPoint = beatmap.controlPoints.effect.controlPointAt(3000);

    expect(timingPoint.time).toBe(1000);

    timingPoint = beatmap.controlPoints.effect.controlPointAt(7000);

    expect(timingPoint.time).toBe(5000);
});

test("Test sample control point getter", () => {
    const beatmap = new Beatmap();

    beatmap.controlPoints.sample.points.push(
        new SampleControlPoint({
            time: 1000,
            sampleBank: SampleBank.none,
            sampleVolume: 100,
            customSampleBank: 0,
        }),
        new SampleControlPoint({
            time: 5000,
            sampleBank: SampleBank.none,
            sampleVolume: 100,
            customSampleBank: 0,
        })
    );

    let timingPoint = beatmap.controlPoints.sample.controlPointAt(0);

    expect(timingPoint.time).toBe(0);

    timingPoint = beatmap.controlPoints.sample.controlPointAt(3000);

    expect(timingPoint.time).toBe(1000);

    timingPoint = beatmap.controlPoints.sample.controlPointAt(7000);

    expect(timingPoint.time).toBe(5000);
});

test("Test slider ticks getter", () => {
    const beatmap = new Beatmap();

    beatmap.hitObjects.objects.push(new Slider(createGlobalSliderValues()));

    expect(beatmap.hitObjects.sliderTicks).toBe(1);

    beatmap.hitObjects.objects.push(
        new Slider({
            ...createGlobalSliderValues(),
            repetitions: 2,
        })
    );

    expect(beatmap.hitObjects.sliderTicks).toBe(3);

    beatmap.hitObjects.objects.push(
        new Slider({
            ...createGlobalSliderValues(),
            repetitions: 4,
        })
    );

    expect(beatmap.hitObjects.sliderTicks).toBe(7);

    beatmap.hitObjects.objects.push(
        new Slider({
            ...createGlobalSliderValues(),
            repetitions: 8,
        })
    );

    expect(beatmap.hitObjects.sliderTicks).toBe(15);
});

test("Test slider ends getter", () => {
    const beatmap = new Beatmap();

    beatmap.hitObjects.objects.push(new Slider(createGlobalSliderValues()));
    ++beatmap.hitObjects.sliders;

    expect(beatmap.hitObjects.sliderEnds).toBe(1);

    beatmap.hitObjects.objects.push(new Slider(createGlobalSliderValues()));
    beatmap.hitObjects.objects.push(new Slider(createGlobalSliderValues()));
    beatmap.hitObjects.sliders += 2;

    expect(beatmap.hitObjects.sliderEnds).toBe(3);

    beatmap.hitObjects.objects.pop();
    --beatmap.hitObjects.sliders;

    expect(beatmap.hitObjects.sliderEnds).toBe(2);

    beatmap.hitObjects.objects.length = beatmap.hitObjects.sliders = 0;

    expect(beatmap.hitObjects.sliderEnds).toBe(0);
});

test("Test slider repeat points getter", () => {
    const beatmap = new Beatmap();

    beatmap.hitObjects.objects.push(new Slider(createGlobalSliderValues()));
    ++beatmap.hitObjects.sliders;

    expect(beatmap.hitObjects.sliderRepeatPoints).toBe(0);

    beatmap.hitObjects.objects.push(
        new Slider({
            ...createGlobalSliderValues(),
            repetitions: 2,
        })
    );
    ++beatmap.hitObjects.sliders;

    expect(beatmap.hitObjects.sliderRepeatPoints).toBe(1);

    beatmap.hitObjects.objects.push(
        new Slider({
            ...createGlobalSliderValues(),
            repetitions: 4,
        })
    );
    ++beatmap.hitObjects.sliders;

    expect(beatmap.hitObjects.sliderRepeatPoints).toBe(4);

    beatmap.hitObjects.objects.push(
        new Slider({
            ...createGlobalSliderValues(),
            repetitions: 8,
        })
    );
    ++beatmap.hitObjects.sliders;

    expect(beatmap.hitObjects.sliderRepeatPoints).toBe(11);
});

test("Test max combo getter", () => {
    const beatmap = new Beatmap();

    expect(beatmap.maxCombo).toBe(0);

    beatmap.hitObjects.objects.push(
        new Circle({
            startTime: 1000,
            position: new Vector2(0, 0),
        })
    );
    ++beatmap.hitObjects.circles;

    expect(beatmap.maxCombo).toBe(1);

    beatmap.hitObjects.objects.push(new Slider(createGlobalSliderValues()));
    ++beatmap.hitObjects.sliders;

    expect(beatmap.maxCombo).toBe(4);

    beatmap.hitObjects.objects.push(
        new Spinner({
            startTime: 1000,
            type: objectTypes.spinner,
            endTime: 1100,
        })
    );
    ++beatmap.hitObjects.spinners;

    expect(beatmap.maxCombo).toBe(5);
});

test("Test osu!droid max score calculation", () => {
    const beatmap = new Beatmap();

    const stats = new MapStats();

    expect(beatmap.maxDroidScore(stats)).toBe(0);

    beatmap.hitObjects.objects.push(
        new Circle({
            startTime: 1000,
            position: new Vector2(0, 0),
        })
    );

    ++beatmap.hitObjects.circles;

    expect(beatmap.maxDroidScore(stats)).toBe(300);

    stats.mods.push(new ModHidden());

    expect(beatmap.maxDroidScore(stats)).toBeCloseTo(300);
});

test("Test osu!standard max score calculation", () => {
    const beatmap = new Beatmap();

    expect(beatmap.maxOsuScore()).toBe(0);

    beatmap.hitObjects.objects.push(
        new Circle({
            startTime: 1000,
            position: new Vector2(0, 0),
        })
    );

    ++beatmap.hitObjects.circles;

    expect(beatmap.maxOsuScore()).toBe(300);

    expect(beatmap.maxOsuScore([new ModHidden()])).toBeCloseTo(300);
});