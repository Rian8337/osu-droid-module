import {
    Beatmap,
    Circle,
    DifficultyControlPoint,
    EffectControlPoint,
    MapStats,
    ModHidden,
    ModRelax,
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

    expect(
        beatmap.controlPoints.timing.add(
            new TimingControlPoint({
                time: 1000,
                msPerBeat: 100,
                timeSignature: 4,
            })
        )
    ).toBe(true);

    // Redundant control point, but should be added
    expect(
        beatmap.controlPoints.timing.add(
            new TimingControlPoint({
                time: 5000,
                msPerBeat: 100,
                timeSignature: 4,
            })
        )
    ).toBe(true);

    let timingPoint = beatmap.controlPoints.timing.controlPointAt(0);

    expect(timingPoint.time).toBe(1000);

    timingPoint = beatmap.controlPoints.timing.controlPointAt(3000);

    expect(timingPoint.time).toBe(1000);

    timingPoint = beatmap.controlPoints.timing.controlPointAt(7000);

    expect(timingPoint.time).toBe(5000);
});

test("Test difficulty control point getter", () => {
    const beatmap = new Beatmap();

    expect(
        beatmap.controlPoints.difficulty.add(
            new DifficultyControlPoint({
                time: 1000,
                speedMultiplier: 0.9,
            })
        )
    ).toBe(true);

    // Redundant control point
    expect(
        beatmap.controlPoints.difficulty.add(
            new DifficultyControlPoint({
                time: 5000,
                speedMultiplier: 0.9,
            })
        )
    ).toBe(false);

    let timingPoint = beatmap.controlPoints.difficulty.controlPointAt(0);

    expect(timingPoint.time).toBe(0);

    timingPoint = beatmap.controlPoints.difficulty.controlPointAt(3000);

    expect(timingPoint.time).toBe(1000);

    timingPoint = beatmap.controlPoints.difficulty.controlPointAt(7000);

    expect(timingPoint.time).toBe(1000);

    expect(
        beatmap.controlPoints.difficulty.add(
            new DifficultyControlPoint({
                time: 5000,
                speedMultiplier: 0.5,
            })
        )
    ).toBe(true);

    timingPoint = beatmap.controlPoints.difficulty.controlPointAt(7000);

    expect(timingPoint.time).toBe(5000);
});

test("Test effect control point getter", () => {
    const beatmap = new Beatmap();

    expect(
        beatmap.controlPoints.effect.add(
            new EffectControlPoint({
                time: 1000,
                isKiai: true,
                omitFirstBarLine: false,
            })
        )
    ).toBe(true);

    // Redundant control point
    expect(
        beatmap.controlPoints.effect.add(
            new EffectControlPoint({
                time: 5000,
                isKiai: true,
                omitFirstBarLine: false,
            })
        )
    ).toBe(false);

    let timingPoint = beatmap.controlPoints.effect.controlPointAt(0);

    expect(timingPoint.time).toBe(0);

    timingPoint = beatmap.controlPoints.effect.controlPointAt(3000);

    expect(timingPoint.time).toBe(1000);

    timingPoint = beatmap.controlPoints.effect.controlPointAt(7000);

    expect(timingPoint.time).toBe(1000);

    expect(
        beatmap.controlPoints.effect.add(
            new EffectControlPoint({
                time: 5000,
                isKiai: false,
                omitFirstBarLine: false,
            })
        )
    ).toBe(true);

    timingPoint = beatmap.controlPoints.effect.controlPointAt(7000);

    expect(timingPoint.time).toBe(5000);
});

test("Test sample control point getter", () => {
    const beatmap = new Beatmap();

    expect(
        beatmap.controlPoints.sample.add(
            new SampleControlPoint({
                time: 1000,
                sampleBank: SampleBank.none,
                sampleVolume: 100,
                customSampleBank: 0,
            })
        )
    ).toBe(true);

    // Redundant control point
    expect(
        beatmap.controlPoints.sample.add(
            new SampleControlPoint({
                time: 5000,
                sampleBank: SampleBank.none,
                sampleVolume: 100,
                customSampleBank: 0,
            })
        )
    ).toBe(false);

    let timingPoint = beatmap.controlPoints.sample.controlPointAt(0);

    expect(timingPoint.time).toBe(0);

    timingPoint = beatmap.controlPoints.sample.controlPointAt(3000);

    expect(timingPoint.time).toBe(1000);

    timingPoint = beatmap.controlPoints.sample.controlPointAt(7000);

    expect(timingPoint.time).toBe(1000);

    expect(
        beatmap.controlPoints.sample.add(
            new SampleControlPoint({
                time: 5000,
                sampleBank: SampleBank.none,
                sampleVolume: 90,
                customSampleBank: 0,
            })
        )
    ).toBe(true);

    timingPoint = beatmap.controlPoints.sample.controlPointAt(7000);

    expect(timingPoint.time).toBe(5000);
});

describe("Test most common beat length getter", () => {
    test("Without hitobjects and timing points", () => {
        const beatmap = new Beatmap();

        expect(beatmap.mostCommonBeatLength).toBe(0);
    });

    test("With a timing point", () => {
        const beatmap = new Beatmap();

        beatmap.controlPoints.timing.add(
            new TimingControlPoint({
                time: 1000,
                msPerBeat: 1000,
                timeSignature: 4,
            })
        );

        expect(beatmap.mostCommonBeatLength).toBe(1000);
    });

    describe("With 2 timing points and a hitobject", () => {
        test("Hitobject before timing points", () => {
            const beatmap = new Beatmap();

            beatmap.controlPoints.timing.add(
                new TimingControlPoint({
                    time: 1000,
                    msPerBeat: 1000,
                    timeSignature: 4,
                })
            );

            beatmap.controlPoints.timing.add(
                new TimingControlPoint({
                    time: 1500,
                    msPerBeat: 800,
                    timeSignature: 4,
                })
            );

            beatmap.hitObjects.add(
                new Circle({
                    startTime: 0,
                    position: new Vector2(0, 0),
                })
            );

            expect(beatmap.mostCommonBeatLength).toBe(1000);
        });

        test("Hitobject after timing points", () => {
            const beatmap = new Beatmap();

            beatmap.controlPoints.timing.add(
                new TimingControlPoint({
                    time: 1000,
                    msPerBeat: 1000,
                    timeSignature: 4,
                })
            );

            beatmap.controlPoints.timing.add(
                new TimingControlPoint({
                    time: 1500,
                    msPerBeat: 800,
                    timeSignature: 4,
                })
            );

            beatmap.hitObjects.add(
                new Circle({
                    startTime: 2000,
                    position: new Vector2(0, 0),
                })
            );

            expect(beatmap.mostCommonBeatLength).toBe(1000);
        });
    });
});

test("Test slider ticks getter", () => {
    const beatmap = new Beatmap();

    beatmap.hitObjects.add(new Slider(createGlobalSliderValues()));

    expect(beatmap.hitObjects.sliderTicks).toBe(1);

    beatmap.hitObjects.add(
        new Slider({
            ...createGlobalSliderValues(),
            repetitions: 2,
        })
    );

    expect(beatmap.hitObjects.sliderTicks).toBe(3);

    beatmap.hitObjects.add(
        new Slider({
            ...createGlobalSliderValues(),
            repetitions: 4,
        })
    );

    expect(beatmap.hitObjects.sliderTicks).toBe(7);

    beatmap.hitObjects.add(
        new Slider({
            ...createGlobalSliderValues(),
            repetitions: 8,
        })
    );

    expect(beatmap.hitObjects.sliderTicks).toBe(15);
});

test("Test slider ends getter", () => {
    const beatmap = new Beatmap();

    beatmap.hitObjects.add(new Slider(createGlobalSliderValues()));

    expect(beatmap.hitObjects.sliderEnds).toBe(1);

    beatmap.hitObjects.add(new Slider(createGlobalSliderValues()));
    beatmap.hitObjects.add(new Slider(createGlobalSliderValues()));

    expect(beatmap.hitObjects.sliderEnds).toBe(3);

    beatmap.hitObjects.removeAt(beatmap.hitObjects.objects.length - 1);

    expect(beatmap.hitObjects.sliderEnds).toBe(2);

    beatmap.hitObjects.clear();

    expect(beatmap.hitObjects.sliderEnds).toBe(0);
});

test("Test slider repeat points getter", () => {
    const beatmap = new Beatmap();

    beatmap.hitObjects.add(new Slider(createGlobalSliderValues()));

    expect(beatmap.hitObjects.sliderRepeatPoints).toBe(0);

    beatmap.hitObjects.add(
        new Slider({
            ...createGlobalSliderValues(),
            repetitions: 2,
        })
    );

    expect(beatmap.hitObjects.sliderRepeatPoints).toBe(1);

    beatmap.hitObjects.add(
        new Slider({
            ...createGlobalSliderValues(),
            repetitions: 4,
        })
    );

    expect(beatmap.hitObjects.sliderRepeatPoints).toBe(4);

    beatmap.hitObjects.add(
        new Slider({
            ...createGlobalSliderValues(),
            repetitions: 8,
        })
    );

    expect(beatmap.hitObjects.sliderRepeatPoints).toBe(11);
});

test("Test max combo getter", () => {
    const beatmap = new Beatmap();

    expect(beatmap.maxCombo).toBe(0);

    beatmap.hitObjects.add(
        new Circle({
            startTime: 1000,
            position: new Vector2(0, 0),
        })
    );

    expect(beatmap.maxCombo).toBe(1);

    beatmap.hitObjects.add(new Slider(createGlobalSliderValues()));

    expect(beatmap.maxCombo).toBe(4);

    beatmap.hitObjects.add(
        new Spinner({
            startTime: 1000,
            type: objectTypes.spinner,
            endTime: 1100,
        })
    );

    expect(beatmap.maxCombo).toBe(5);
});

describe("Test osu!droid max score calculation", () => {
    const beatmap = new Beatmap();

    beatmap.hitObjects.add(
        new Circle({
            startTime: 1000,
            position: new Vector2(0, 0),
        }),
        new Slider({
            ...createGlobalSliderValues(),
            startTime: 1500,
        })
    );

    test("Without mods and speed multiplier", () => {
        const stats = new MapStats();

        expect(beatmap.maxDroidScore(stats)).toBe(730);
    });

    test("With mods", () => {
        const stats = new MapStats({
            mods: [new ModHidden()],
        });

        expect(beatmap.maxDroidScore(stats)).toBe(735);
    });

    test("With speed multiplier > 1", () => {
        const stats = new MapStats({
            speedMultiplier: 1.25,
        });

        expect(beatmap.maxDroidScore(stats)).toBe(735);
    });

    test("With speed multiplier < 1", () => {
        const stats = new MapStats({
            speedMultiplier: 0.75,
        });

        expect(beatmap.maxDroidScore(stats)).toBe(667);
    });

    test("With unranked mods", () => {
        const stats = new MapStats({
            mods: [new ModRelax()],
        });

        expect(beatmap.maxDroidScore(stats)).toBe(640);
    });
});

describe("Test osu!standard max score calculation", () => {
    const constructBeatmap = () => {
        const beatmap = new Beatmap();

        beatmap.hitObjects.add(
            new Circle({
                startTime: 1000,
                position: new Vector2(0, 0),
            })
        );

        return beatmap;
    };

    test("Difficulty multiplier: 2", () => {
        const beatmap = constructBeatmap();

        beatmap.difficulty.cs = 1;
        beatmap.difficulty.od = 1;
        beatmap.difficulty.hp = 1;

        expect(beatmap.maxOsuScore()).toBe(300);
    });

    test("Difficulty multiplier: 3", () => {
        const beatmap = constructBeatmap();

        beatmap.difficulty.cs = 2;
        beatmap.difficulty.od = 2;
        beatmap.difficulty.hp = 2;

        expect(beatmap.maxOsuScore()).toBe(300);
    });

    test("Difficulty multiplier: 4", () => {
        const beatmap = constructBeatmap();

        beatmap.difficulty.cs = 5;
        beatmap.difficulty.od = 5;
        beatmap.difficulty.hp = 5;

        expect(beatmap.maxOsuScore()).toBe(300);
    });

    test("Difficulty multiplier: 5", () => {
        const beatmap = constructBeatmap();

        beatmap.difficulty.cs = 6;
        beatmap.difficulty.od = 6;
        beatmap.difficulty.hp = 6;

        expect(beatmap.maxOsuScore()).toBe(300);
    });

    test("Difficulty multiplier: 6", () => {
        const beatmap = constructBeatmap();

        beatmap.difficulty.cs = 10;
        beatmap.difficulty.od = 10;
        beatmap.difficulty.hp = 10;

        expect(beatmap.maxOsuScore()).toBe(300);
    });

    test("With mods", () => {
        expect(constructBeatmap().maxOsuScore([new ModHidden()])).toBe(300);
    });
});

describe("Test string concatenation", () => {
    const constructBeatmap = () => {
        const beatmap = new Beatmap();

        beatmap.difficulty.ar = 5;

        beatmap.metadata.artist = "A";
        beatmap.metadata.title = "B";
        beatmap.metadata.creator = "C";
        beatmap.metadata.version = "D";

        return beatmap;
    };

    test("Without title unicode", () => {
        expect(constructBeatmap().toString()).toBe(
            "A - B [D] mapped by C\n\nAR5 OD5 CS5 HP5\n0 circles, 0 sliders, 0 spinners\n0 max combo"
        );
    });

    test("With title unicode", () => {
        const beatmap = constructBeatmap();

        beatmap.metadata.artistUnicode = "E";
        beatmap.metadata.titleUnicode = "F";

        expect(beatmap.toString()).toBe(
            "A - B [(E - F)D] mapped by C\n\nAR5 OD5 CS5 HP5\n0 circles, 0 sliders, 0 spinners\n0 max combo"
        );
    });
});
