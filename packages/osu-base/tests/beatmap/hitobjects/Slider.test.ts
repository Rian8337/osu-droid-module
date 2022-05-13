import {
    SliderHead,
    objectTypes,
    PathType,
    SliderRepeat,
    Slider,
    SliderPath,
    SliderTick,
    SliderTail,
    Vector2,
} from "../../../src";

const createGlobalSliderValues = (newCombo?: boolean) => {
    const controlPoints = [new Vector2(0, 0), new Vector2(200, 0)];

    // Will generate 1 slider tick by default
    return {
        startTime: 1000,
        type: objectTypes.slider,
        position: new Vector2(100, 192),
        repetitions: 1,
        nodeSamples: [],
        newCombo: newCombo,
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

describe("Test slider position", () => {
    test("Slider position", () => {
        const slider = new Slider(createGlobalSliderValues());

        expect(slider.position).toEqual(new Vector2(100, 192));
    });

    test("Slider end position same as last control point", () => {
        const slider = new Slider(createGlobalSliderValues());

        expect(slider.endPosition).toEqual(new Vector2(300, 192));
    });

    test("Slider stacked position without height", () => {
        const slider = new Slider(createGlobalSliderValues());

        expect(slider.stackedPosition).toEqual(slider.position);
    });

    test("Slider stacked end position without height", () => {
        const slider = new Slider(createGlobalSliderValues());

        expect(slider.stackedEndPosition).toEqual(slider.endPosition);
    });

    test("Slider stacked position with height", () => {
        const slider = new Slider(createGlobalSliderValues());

        slider.stackHeight = 1;

        let positionOffset = slider.stackedPosition.subtract(slider.position);

        expect(positionOffset.x).toBeCloseTo(
            slider.scale * slider.stackHeight * -6.4
        );
        expect(positionOffset.y).toBeCloseTo(
            slider.scale * slider.stackHeight * -6.4
        );

        slider.stackHeight = 2;

        positionOffset = slider.stackedPosition.subtract(slider.position);

        expect(positionOffset.x).toBeCloseTo(
            slider.scale * slider.stackHeight * -6.4
        );
        expect(positionOffset.y).toBeCloseTo(
            slider.scale * slider.stackHeight * -6.4
        );

        slider.stackHeight = 0.5;

        positionOffset = slider.stackedPosition.subtract(slider.position);

        expect(positionOffset.x).toBeCloseTo(
            slider.scale * slider.stackHeight * -6.4
        );
        expect(positionOffset.y).toBeCloseTo(
            slider.scale * slider.stackHeight * -6.4
        );
    });

    test("Slider stacked end position with height", () => {
        const slider = new Slider(createGlobalSliderValues());

        slider.stackHeight = 1;

        let positionOffset = slider.stackedEndPosition.subtract(
            slider.endPosition
        );

        expect(positionOffset.x).toBeCloseTo(
            slider.scale * slider.stackHeight * -6.4
        );
        expect(positionOffset.y).toBeCloseTo(
            slider.scale * slider.stackHeight * -6.4
        );

        slider.stackHeight = 2;

        positionOffset = slider.stackedEndPosition.subtract(slider.endPosition);

        expect(positionOffset.x).toBeCloseTo(
            slider.scale * slider.stackHeight * -6.4
        );
        expect(positionOffset.y).toBeCloseTo(
            slider.scale * slider.stackHeight * -6.4
        );

        slider.stackHeight = 4;

        positionOffset = slider.stackedEndPosition.subtract(slider.endPosition);

        expect(positionOffset.x).toBeCloseTo(
            slider.scale * slider.stackHeight * -6.4
        );
        expect(positionOffset.y).toBeCloseTo(
            slider.scale * slider.stackHeight * -6.4
        );
    });
});

describe("Test slider without slider ticks", () => {
    const sliderValues = createGlobalSliderValues();

    sliderValues.mapSliderVelocity = 2;

    const slider = new Slider(sliderValues);

    test("Slider nested hit objects count", () => {
        expect(slider.nestedHitObjects.length).toBe(2);
        expect(slider.ticks).toBe(0);
    });

    test("Slider head", () => {
        const head = slider.nestedHitObjects[0];

        expect(head).toBeInstanceOf(SliderHead);

        expect(head).toEqual(slider.head);

        expect(head.startTime).toBeCloseTo(slider.startTime);

        expect(head.position.x).toBeCloseTo(100);
        expect(head.position.y).toBeCloseTo(192);
    });

    test("Slider tail", () => {
        const tail = slider.nestedHitObjects.at(-1)!;

        expect(tail).toBeInstanceOf(SliderTail);

        expect(tail).toEqual(slider.tail);

        expect(tail.startTime).toBeCloseTo(
            slider.endTime - Slider.legacyLastTickOffset
        );

        expect(tail.position.x).toBeCloseTo(300);
        expect(tail.position.y).toBeCloseTo(192);
    });
});

describe("Test slider with 1 slider tick", () => {
    const slider = new Slider(createGlobalSliderValues());

    test("Slider nested hit objects count", () => {
        expect(slider.nestedHitObjects.length).toBe(3);
        expect(slider.ticks).toBe(1);
    });

    test("Slider head", () => {
        const head = slider.nestedHitObjects[0];

        expect(head).toBeInstanceOf(SliderHead);

        expect(head).toEqual(slider.head);

        expect(head.startTime).toBeCloseTo(slider.startTime);

        expect(head.position.x).toBeCloseTo(100);
        expect(head.position.y).toBeCloseTo(192);
    });

    test("Slider tick", () => {
        const tick = slider.nestedHitObjects[1];

        expect(tick).toBeInstanceOf(SliderTick);

        expect(tick.startTime).toBeCloseTo(2000);

        expect(tick.position.x).toBeCloseTo(200);
        expect(tick.position.y).toBeCloseTo(192);
    });

    test("Slider tail", () => {
        const tail = slider.nestedHitObjects.at(-1)!;

        expect(tail).toBeInstanceOf(SliderTail);

        expect(tail).toEqual(slider.tail);

        expect(tail.startTime).toBeCloseTo(
            slider.endTime - Slider.legacyLastTickOffset
        );

        expect(tail.position.x).toBeCloseTo(300);
        expect(tail.position.y).toBeCloseTo(192);
    });
});

describe("Test slider with 3 slider ticks", () => {
    const sliderValues = createGlobalSliderValues();

    sliderValues.mapTickRate = 2;

    const slider = new Slider(sliderValues);

    test("Slider nested hit objects count", () => {
        expect(slider.nestedHitObjects.length).toBe(5);
        expect(slider.ticks).toBe(3);
    });

    test("Slider head", () => {
        const head = slider.nestedHitObjects[0];

        expect(head).toBeInstanceOf(SliderHead);

        expect(head).toEqual(slider.head);

        expect(head.startTime).toBeCloseTo(slider.startTime);

        expect(head.position.x).toBeCloseTo(100);
        expect(head.position.y).toBeCloseTo(192);
    });

    test("Slider ticks", () => {
        const ticks = slider.nestedHitObjects.filter(
            (v) => v instanceof SliderTick
        );

        expect(ticks.length).toBe(3);

        for (let i = 0; i < ticks.length; ++i) {
            const tick = ticks[i];

            expect(tick.startTime).toBeCloseTo(1000 + 500 * (i + 1));

            expect(tick.position.x).toBeCloseTo(100 + 50 * (i + 1));
            expect(tick.position.y).toBeCloseTo(192);
        }
    });

    test("Slider tail", () => {
        const tail = slider.nestedHitObjects.at(-1)!;

        expect(tail).toBeInstanceOf(SliderTail);

        expect(tail).toEqual(slider.tail);

        expect(tail.startTime).toBeCloseTo(
            slider.endTime - Slider.legacyLastTickOffset
        );

        expect(tail.position.x).toBeCloseTo(300);
        expect(tail.position.y).toBeCloseTo(192);
    });
});

describe("Test slider repeat points", () => {
    test("Slider with no repeat points", () => {
        const slider = new Slider(createGlobalSliderValues());

        expect(slider.repeats).toBe(0);
    });

    test("Slider with 1 repeat point", () => {
        const sliderValues = createGlobalSliderValues();

        sliderValues.repetitions = 2;

        const slider = new Slider(sliderValues);

        expect(slider.repeats).toBe(1);

        const repeatPoint = slider.nestedHitObjects[2];

        expect(repeatPoint).toBeInstanceOf(SliderRepeat);

        expect(repeatPoint.startTime).toBeCloseTo(3000);
        expect(repeatPoint.endTime).toBeCloseTo(3000);

        const position = new Vector2(300, 192);

        expect(repeatPoint.position).toEqual(position);
        expect(repeatPoint.stackedPosition).toEqual(position);
        expect(repeatPoint.endPosition).toEqual(position);
        expect(repeatPoint.stackedEndPosition).toEqual(position);

        expect(slider.endTime).toBeCloseTo(5000);
    });

    test("Slider with 3 repeat points", () => {
        const sliderValues = createGlobalSliderValues();

        sliderValues.repetitions = 4;

        const slider = new Slider(sliderValues);

        const repeatPoints = slider.nestedHitObjects.filter(
            (v) => v instanceof SliderRepeat
        );

        expect(repeatPoints.length).toBe(3);

        for (let i = 0; i < repeatPoints.length; ++i) {
            const repeatPoint = repeatPoints[i];

            expect(repeatPoint).toBeInstanceOf(SliderRepeat);

            expect(repeatPoint.startTime).toBeCloseTo(1000 + 2000 * (i + 1));
            expect(repeatPoint.endTime).toBeCloseTo(1000 + 2000 * (i + 1));

            const position = new Vector2(i % 2 ? 100 : 300, 192);

            expect(repeatPoint.position).toEqual(position);
            expect(repeatPoint.stackedPosition).toEqual(position);
            expect(repeatPoint.endPosition).toEqual(position);
            expect(repeatPoint.stackedEndPosition).toEqual(position);
        }

        expect(slider.endTime).toBeCloseTo(9000);
    });
});

test("Test slider velocity", () => {
    const sliderValues = createGlobalSliderValues();

    const slider = new Slider(sliderValues);

    const scoringDistance =
        100 * sliderValues.mapSliderVelocity * sliderValues.speedMultiplier;

    expect(slider.velocity).toBeCloseTo(
        scoringDistance / sliderValues.msPerBeat
    );
});

test("Test slider tick distance", () => {
    const sliderValues = createGlobalSliderValues();

    const slider = new Slider(sliderValues);

    const scoringDistance =
        100 * sliderValues.mapSliderVelocity * sliderValues.speedMultiplier;

    expect(slider.tickDistance).toBeCloseTo(
        (scoringDistance * sliderValues.tickDistanceMultiplier) /
            sliderValues.mapTickRate
    );
});

test("Test slider span duration", () => {
    const slider = new Slider(createGlobalSliderValues());

    expect(slider.spanDuration).toBeCloseTo(2000);
});

test("Test slider duration", () => {
    const sliderValues = createGlobalSliderValues();

    sliderValues.repetitions = 2;

    let slider = new Slider(sliderValues);

    expect(slider.duration).toBeCloseTo(4000);

    sliderValues.repetitions = 4;

    slider = new Slider(sliderValues);

    expect(slider.duration).toBeCloseTo(8000);
});

test("Test new combo", () => {
    const sliderValues = createGlobalSliderValues(true);

    sliderValues.type |= 1 << 2;

    const slider = new Slider(sliderValues);

    expect(slider.isNewCombo).toBe(true);
});
