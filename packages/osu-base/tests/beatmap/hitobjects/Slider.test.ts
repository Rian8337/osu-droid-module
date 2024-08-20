import {
    SliderHead,
    ObjectTypes,
    PathType,
    SliderRepeat,
    Slider,
    SliderPath,
    SliderTick,
    SliderTail,
    Vector2,
    Modes,
    BeatmapControlPoints,
    BeatmapDifficulty,
    DifficultyControlPoint,
    CircleSizeCalculator,
} from "../../../src";

const createGlobalSliderValues = (newCombo?: boolean) => {
    const controlPoints = [new Vector2(0, 0), new Vector2(200, 0)];

    return {
        startTime: 1000,
        type: ObjectTypes.slider,
        position: new Vector2(100, 192),
        repeatCount: 0,
        nodeSamples: [],
        newCombo: newCombo,
        path: new SliderPath({
            pathType: PathType.Linear,
            controlPoints: controlPoints,
            expectedDistance: controlPoints
                .at(-1)!
                .getDistance(controlPoints[0]),
        }),
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

    describe("Slider stacked position", () => {
        test("Without height", () => {
            const slider = new Slider(createGlobalSliderValues());

            expect(slider.getStackedPosition(Modes.droid)).toEqual(
                slider.position,
            );
            expect(slider.getStackedPosition(Modes.osu)).toEqual(
                slider.position,
            );
        });

        describe("With height", () => {
            const executeTest = (mode: Modes) => {
                const slider = new Slider(createGlobalSliderValues());

                const scale =
                    mode === Modes.droid
                        ? CircleSizeCalculator.standardScaleToDroidScale(
                              slider.scale,
                              true,
                          )
                        : slider.scale;

                const stackMultiplier = mode === Modes.droid ? 4 : -6.4;

                slider.stackHeight = 1;

                let positionOffset = slider
                    .getStackedPosition(mode)
                    .subtract(slider.position);

                expect(positionOffset.x).toBeCloseTo(
                    scale * slider.stackHeight * stackMultiplier,
                );
                expect(positionOffset.y).toBeCloseTo(
                    scale * slider.stackHeight * stackMultiplier,
                );

                slider.stackHeight = 2;

                positionOffset = slider
                    .getStackedPosition(mode)
                    .subtract(slider.position);

                expect(positionOffset.x).toBeCloseTo(
                    scale * slider.stackHeight * stackMultiplier,
                );
                expect(positionOffset.y).toBeCloseTo(
                    scale * slider.stackHeight * stackMultiplier,
                );

                slider.stackHeight = 0.5;

                positionOffset = slider
                    .getStackedPosition(mode)
                    .subtract(slider.position);

                expect(positionOffset.x).toBeCloseTo(
                    scale * slider.stackHeight * stackMultiplier,
                );
                expect(positionOffset.y).toBeCloseTo(
                    scale * slider.stackHeight * stackMultiplier,
                );
            };

            test("osu!droid gamemode", () => executeTest(Modes.droid));
            test("osu!standard gamemode", () => executeTest(Modes.osu));
        });
    });

    describe("Slider stacked end position", () => {
        test("Without height", () => {
            const slider = new Slider(createGlobalSliderValues());

            expect(slider.getStackedEndPosition(Modes.droid)).toEqual(
                slider.endPosition,
            );
            expect(slider.getStackedEndPosition(Modes.osu)).toEqual(
                slider.endPosition,
            );
        });

        describe("With height", () => {
            const executeTest = (mode: Modes) => {
                const slider = new Slider(createGlobalSliderValues());

                const scale =
                    mode === Modes.droid
                        ? CircleSizeCalculator.standardScaleToDroidScale(
                              slider.scale,
                              true,
                          )
                        : slider.scale;

                const stackMultiplier = mode === Modes.droid ? 4 : -6.4;

                slider.stackHeight = 1;

                let positionOffset = slider
                    .getStackedEndPosition(mode)
                    .subtract(slider.endPosition);

                expect(positionOffset.x).toBeCloseTo(
                    scale * slider.stackHeight * stackMultiplier,
                );
                expect(positionOffset.y).toBeCloseTo(
                    scale * slider.stackHeight * stackMultiplier,
                );

                slider.stackHeight = 2;

                positionOffset = slider
                    .getStackedEndPosition(mode)
                    .subtract(slider.endPosition);

                expect(positionOffset.x).toBeCloseTo(
                    scale * slider.stackHeight * stackMultiplier,
                );
                expect(positionOffset.y).toBeCloseTo(
                    scale * slider.stackHeight * stackMultiplier,
                );

                slider.stackHeight = 0.5;

                positionOffset = slider
                    .getStackedEndPosition(mode)
                    .subtract(slider.endPosition);

                expect(positionOffset.x).toBeCloseTo(
                    scale * slider.stackHeight * stackMultiplier,
                );
                expect(positionOffset.y).toBeCloseTo(
                    scale * slider.stackHeight * stackMultiplier,
                );
            };

            test("osu!droid gamemode", () => executeTest(Modes.droid));
            test("osu!standard gamemode", () => executeTest(Modes.osu));
        });
    });
});

describe("Test slider without slider ticks", () => {
    const sliderValues = createGlobalSliderValues();

    const slider = new Slider(sliderValues);

    const difficulty = new BeatmapDifficulty();
    difficulty.sliderMultiplier = 2;

    slider.applyDefaults(new BeatmapControlPoints(), difficulty, Modes.osu);

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
            slider.endTime - Slider.legacyLastTickOffset,
        );

        expect(tail.position.x).toBeCloseTo(300);
        expect(tail.position.y).toBeCloseTo(192);
    });
});

describe("Test slider with 1 slider tick", () => {
    const slider = new Slider(createGlobalSliderValues());

    slider.applyDefaults(
        new BeatmapControlPoints(),
        new BeatmapDifficulty(),
        Modes.osu,
    );

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
            slider.endTime - Slider.legacyLastTickOffset,
        );

        expect(tail.position.x).toBeCloseTo(300);
        expect(tail.position.y).toBeCloseTo(192);
    });
});

describe("Test slider with 3 slider ticks", () => {
    const sliderValues = createGlobalSliderValues();

    const slider = new Slider(sliderValues);

    const difficulty = new BeatmapDifficulty();
    difficulty.sliderTickRate = 2;

    slider.applyDefaults(new BeatmapControlPoints(), difficulty, Modes.osu);

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
            (v) => v instanceof SliderTick,
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
            slider.endTime - Slider.legacyLastTickOffset,
        );

        expect(tail.position.x).toBeCloseTo(300);
        expect(tail.position.y).toBeCloseTo(192);
    });
});

describe("Test slider repeat points", () => {
    test("Slider with no repeat points", () => {
        const slider = new Slider(createGlobalSliderValues());

        slider.applyDefaults(
            new BeatmapControlPoints(),
            new BeatmapDifficulty(),
            Modes.osu,
        );

        expect(slider.repeatCount).toBe(0);
    });

    test("Slider with 1 repeat point", () => {
        const sliderValues = createGlobalSliderValues();

        sliderValues.repeatCount = 1;

        const slider = new Slider(sliderValues);

        slider.applyDefaults(
            new BeatmapControlPoints(),
            new BeatmapDifficulty(),
            Modes.osu,
        );

        expect(slider.repeatCount).toBe(1);

        const repeatPoint = slider.nestedHitObjects[2];

        expect(repeatPoint).toBeInstanceOf(SliderRepeat);

        expect(repeatPoint.startTime).toBeCloseTo(3000);
        expect(repeatPoint.endTime).toBeCloseTo(3000);

        const position = new Vector2(300, 192);

        expect(repeatPoint.position).toEqual(position);
        expect(repeatPoint.getStackedPosition(Modes.droid)).toEqual(position);
        expect(repeatPoint.getStackedPosition(Modes.osu)).toEqual(position);
        expect(repeatPoint.endPosition).toEqual(position);
        expect(repeatPoint.getStackedEndPosition(Modes.droid)).toEqual(
            position,
        );
        expect(repeatPoint.getStackedEndPosition(Modes.osu)).toEqual(position);

        expect(slider.endTime).toBeCloseTo(5000);
    });

    test("Slider with 3 repeat points", () => {
        const sliderValues = createGlobalSliderValues();

        sliderValues.repeatCount = 3;

        const slider = new Slider(sliderValues);

        slider.applyDefaults(
            new BeatmapControlPoints(),
            new BeatmapDifficulty(),
            Modes.osu,
        );

        const repeatPoints = slider.nestedHitObjects.filter(
            (v) => v instanceof SliderRepeat,
        );

        expect(repeatPoints.length).toBe(3);

        for (let i = 0; i < repeatPoints.length; ++i) {
            const repeatPoint = repeatPoints[i];

            expect(repeatPoint).toBeInstanceOf(SliderRepeat);

            expect(repeatPoint.startTime).toBeCloseTo(1000 + 2000 * (i + 1));
            expect(repeatPoint.endTime).toBeCloseTo(1000 + 2000 * (i + 1));

            const position = new Vector2(i % 2 ? 100 : 300, 192);

            expect(repeatPoint.position).toEqual(position);
            expect(repeatPoint.getStackedPosition(Modes.droid)).toEqual(
                position,
            );
            expect(repeatPoint.getStackedPosition(Modes.osu)).toEqual(position);
            expect(repeatPoint.endPosition).toEqual(position);
            expect(repeatPoint.getStackedEndPosition(Modes.droid)).toEqual(
                position,
            );
            expect(repeatPoint.getStackedEndPosition(Modes.osu)).toEqual(
                position,
            );
        }

        expect(slider.endTime).toBeCloseTo(9000);
    });
});

test("Test slider velocity", () => {
    const sliderValues = createGlobalSliderValues();

    const slider = new Slider(sliderValues);
    const controlPoints = new BeatmapControlPoints();
    const difficulty = new BeatmapDifficulty();

    slider.applyDefaults(controlPoints, difficulty, Modes.osu);

    const scoringDistance =
        100 *
        difficulty.sliderMultiplier *
        controlPoints.difficulty.defaultControlPoint.speedMultiplier;

    expect(slider.velocity).toBeCloseTo(
        scoringDistance / controlPoints.timing.defaultControlPoint.msPerBeat,
    );
});

test("Test slider tick distance", () => {
    const sliderValues = createGlobalSliderValues();

    const slider = new Slider(sliderValues);

    const controlPoints = new BeatmapControlPoints();
    const difficultyPoint = new DifficultyControlPoint({
        time: 0,
        speedMultiplier: 1,
        generateTicks: true,
    });

    controlPoints.difficulty.add(difficultyPoint);

    const difficulty = new BeatmapDifficulty();

    slider.applyDefaults(controlPoints, difficulty, Modes.osu);

    const scoringDistance =
        100 * difficulty.sliderMultiplier * difficultyPoint.speedMultiplier;

    expect(slider.tickDistance).toBeCloseTo(
        (scoringDistance * sliderValues.tickDistanceMultiplier) /
            difficulty.sliderTickRate,
    );
});

test("Test slider span duration", () => {
    const slider = new Slider(createGlobalSliderValues());

    slider.applyDefaults(
        new BeatmapControlPoints(),
        new BeatmapDifficulty(),
        Modes.osu,
    );

    expect(slider.spanDuration).toBeCloseTo(2000);
});

test("Test slider duration", () => {
    const sliderValues = createGlobalSliderValues();
    const controlPoints = new BeatmapControlPoints();
    const difficulty = new BeatmapDifficulty();

    sliderValues.repeatCount = 1;

    let slider = new Slider(sliderValues);

    slider.applyDefaults(controlPoints, difficulty, Modes.osu);

    expect(slider.duration).toBeCloseTo(4000);

    sliderValues.repeatCount = 4;

    slider = new Slider(sliderValues);

    slider.applyDefaults(controlPoints, difficulty, Modes.osu);

    expect(slider.duration).toBeCloseTo(10000);
});

test("Test new combo", () => {
    const sliderValues = createGlobalSliderValues(true);

    sliderValues.type |= 1 << 2;

    const slider = new Slider(sliderValues);

    expect(slider.isNewCombo).toBe(true);
});

test("Test type string", () => {
    const slider = new Slider(createGlobalSliderValues());

    expect(slider.typeStr).toBe("slider");
});

test("Test string concatenation", () => {
    const slider = new Slider(createGlobalSliderValues());

    const controlPoints = new BeatmapControlPoints();
    const difficultyPoint = new DifficultyControlPoint({
        time: 0,
        speedMultiplier: 1,
        generateTicks: true,
    });

    controlPoints.difficulty.add(difficultyPoint);

    const difficulty = new BeatmapDifficulty();

    slider.applyDefaults(controlPoints, difficulty, Modes.osu);

    expect(slider.toString()).toBe(
        "Position: [100, 192], distance: 200, repeat count: 0, slider ticks: 1",
    );
});
