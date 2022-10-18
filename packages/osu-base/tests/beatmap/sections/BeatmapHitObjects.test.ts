import {
    BeatmapHitObjects,
    Circle,
    ObjectTypes,
    PathType,
    Slider,
    SliderPath,
    Spinner,
    Vector2,
} from "../../../src";

const createCircle = (startTime: number = 1000) =>
    new Circle({
        startTime: startTime,
        position: new Vector2(0, 0),
    });

const createSlider = (startTime: number = 1000) => {
    const controlPoints = [new Vector2(0, 0), new Vector2(200, 0)];

    // Will generate 1 slider tick and repetitions by default
    return new Slider({
        startTime: startTime,
        type: ObjectTypes.slider,
        position: new Vector2(100, 192),
        repetitions: 2,
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
    });
};

const createSpinner = (startTime: number = 1000) =>
    new Spinner({
        startTime: startTime,
        type: ObjectTypes.spinner,
        endTime: startTime + 100,
    });

describe("Test adding hitobjects", () => {
    test("Without existing hitobjects", () => {
        const hitObjects = new BeatmapHitObjects();

        hitObjects.add(createCircle());

        expect(hitObjects.objects.length).toBe(1);
    });

    describe("With 2 existing hitobjects", () => {
        test("Before both", () => {
            const hitObjects = new BeatmapHitObjects();

            hitObjects.add(createCircle(), createCircle(1500));

            hitObjects.add(createCircle(500));

            expect(hitObjects.objects.length).toBe(3);
            expect(hitObjects.objects[0].startTime).toBe(500);
        });

        test("Between both", () => {
            const hitObjects = new BeatmapHitObjects();

            hitObjects.add(createCircle(500), createCircle(1500));

            hitObjects.add(createCircle());

            expect(hitObjects.objects.length).toBe(3);
            expect(hitObjects.objects[1].startTime).toBe(1000);
        });

        test("After both", () => {
            const hitObjects = new BeatmapHitObjects();

            hitObjects.add(createCircle(500), createCircle());

            hitObjects.add(createCircle(1500));

            expect(hitObjects.objects.length).toBe(3);
            expect(hitObjects.objects[2].startTime).toBe(1500);
        });
    });
});

describe("Test hitobject counters", () => {
    const hitObjects = new BeatmapHitObjects();

    test("Circle counter", () => {
        hitObjects.add(createCircle());

        expect(hitObjects.circles).toBe(1);
    });

    test("Slider counters", () => {
        hitObjects.add(createSlider(1500));

        expect(hitObjects.sliders).toBe(1);
        expect(hitObjects.sliderEnds).toBe(1);
        expect(hitObjects.sliderRepeatPoints).toBe(1);
        expect(hitObjects.sliderTicks).toBe(2);
    });

    test("Spinner counter", () => {
        hitObjects.add(createSpinner(3000));

        expect(hitObjects.spinners).toBe(1);
    });
});

describe("Test removing hitobjects", () => {
    test("Without existing hitobjects", () => {
        const hitObjects = new BeatmapHitObjects();

        expect(hitObjects.removeAt(0)).toBeUndefined();
    });

    describe("With 2 hitobjects", () => {
        test("Removing a circle", () => {
            const hitObjects = new BeatmapHitObjects();

            hitObjects.add(createCircle(), createSpinner(1500));

            expect(hitObjects.removeAt(0)).toBeInstanceOf(Circle);
            expect(hitObjects.objects.length).toBe(1);
            expect(hitObjects.circles).toBe(0);
        });

        test("Removing a slider", () => {
            const hitObjects = new BeatmapHitObjects();

            hitObjects.add(createCircle(), createSlider(1500));

            expect(hitObjects.removeAt(1)).toBeInstanceOf(Slider);
            expect(hitObjects.objects.length).toBe(1);
            expect(hitObjects.sliders).toBe(0);
            expect(hitObjects.sliderEnds).toBe(0);
            expect(hitObjects.sliderRepeatPoints).toBe(0);
            expect(hitObjects.sliderTicks).toBe(0);
        });

        test("Removing a spinner", () => {
            const hitObjects = new BeatmapHitObjects();

            hitObjects.add(createCircle(), createSpinner(1500));

            expect(hitObjects.removeAt(1)).toBeInstanceOf(Spinner);
            expect(hitObjects.objects.length).toBe(1);
            expect(hitObjects.spinners).toBe(0);
        });
    });
});
