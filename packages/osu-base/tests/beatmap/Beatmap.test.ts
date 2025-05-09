import {
    Beatmap,
    Circle,
    Mod,
    ModCustomSpeed,
    ModDifficultyAdjust,
    ModHardRock,
    ModHidden,
    ModMap,
    ModReallyEasy,
    ModRelax,
    ModScoreV2,
    Modes,
    ObjectTypes,
    PathType,
    PlaceableHitObject,
    Slider,
    SliderPath,
    Spinner,
    TimingControlPoint,
    Vector2,
} from "../../src";

const createGlobalSliderValues = () => {
    const controlPoints = [new Vector2(0, 0), new Vector2(200, 0)];

    return {
        startTime: 1000,
        type: ObjectTypes.slider,
        position: new Vector2(100, 192),
        repeatCount: 0,
        nodeSamples: [],
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

test("Test time offset", () => {
    const beatmap = new Beatmap();

    beatmap.formatVersion = 3;

    expect(beatmap.getOffsetTime(1000)).toBe(1024);

    beatmap.formatVersion = 4;

    expect(beatmap.getOffsetTime(1000)).toBe(1024);

    beatmap.formatVersion = 10;

    expect(beatmap.getOffsetTime(1000)).toBe(1000);
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
            }),
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
                }),
            );

            beatmap.controlPoints.timing.add(
                new TimingControlPoint({
                    time: 1500,
                    msPerBeat: 800,
                    timeSignature: 4,
                }),
            );

            beatmap.hitObjects.add(
                new Circle({
                    startTime: 0,
                    position: new Vector2(0, 0),
                }),
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
                }),
            );

            beatmap.controlPoints.timing.add(
                new TimingControlPoint({
                    time: 1500,
                    msPerBeat: 800,
                    timeSignature: 4,
                }),
            );

            beatmap.hitObjects.add(
                new Circle({
                    startTime: 2000,
                    position: new Vector2(0, 0),
                }),
            );

            expect(beatmap.mostCommonBeatLength).toBe(1000);
        });
    });
});

test("Test slider ticks getter", () => {
    const beatmap = new Beatmap();

    const addSlider = (slider: Slider) => {
        slider.applyDefaults(
            beatmap.controlPoints,
            beatmap.difficulty,
            Modes.osu,
        );

        beatmap.hitObjects.add(slider);
    };

    addSlider(new Slider(createGlobalSliderValues()));
    expect(beatmap.hitObjects.sliderTicks).toBe(1);

    addSlider(
        new Slider({
            ...createGlobalSliderValues(),
            repeatCount: 1,
        }),
    );
    expect(beatmap.hitObjects.sliderTicks).toBe(3);

    addSlider(
        new Slider({
            ...createGlobalSliderValues(),
            repeatCount: 3,
        }),
    );
    expect(beatmap.hitObjects.sliderTicks).toBe(7);

    addSlider(
        new Slider({
            ...createGlobalSliderValues(),
            repeatCount: 7,
        }),
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

    const addSlider = (slider: Slider) => {
        slider.applyDefaults(
            beatmap.controlPoints,
            beatmap.difficulty,
            Modes.osu,
        );

        beatmap.hitObjects.add(slider);
    };

    addSlider(new Slider(createGlobalSliderValues()));
    expect(beatmap.hitObjects.sliderRepeatPoints).toBe(0);

    addSlider(
        new Slider({
            ...createGlobalSliderValues(),
            repeatCount: 1,
        }),
    );
    expect(beatmap.hitObjects.sliderRepeatPoints).toBe(1);

    addSlider(
        new Slider({
            ...createGlobalSliderValues(),
            repeatCount: 3,
        }),
    );
    expect(beatmap.hitObjects.sliderRepeatPoints).toBe(4);

    addSlider(
        new Slider({
            ...createGlobalSliderValues(),
            repeatCount: 7,
        }),
    );
    expect(beatmap.hitObjects.sliderRepeatPoints).toBe(11);
});

test("Test max combo getter", () => {
    const beatmap = new Beatmap();

    const addObject = (object: PlaceableHitObject) => {
        object.applyDefaults(
            beatmap.controlPoints,
            beatmap.difficulty,
            Modes.osu,
        );

        beatmap.hitObjects.add(object);
    };

    expect(beatmap.maxCombo).toBe(0);

    addObject(
        new Circle({
            startTime: 1000,
            position: new Vector2(0, 0),
        }),
    );
    expect(beatmap.maxCombo).toBe(1);

    addObject(new Slider(createGlobalSliderValues()));
    expect(beatmap.maxCombo).toBe(4);

    addObject(
        new Spinner({
            startTime: 1000,
            type: ObjectTypes.spinner,
            endTime: 1100,
        }),
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
        }),
    );

    for (const object of beatmap.hitObjects.objects) {
        object.applyDefaults(
            beatmap.controlPoints,
            beatmap.difficulty,
            Modes.droid,
        );
    }

    test("Without mods and speed multiplier", () => {
        expect(beatmap.maxDroidScore()).toBe(730);
    });

    test("With mods", () => {
        const map = new ModMap();
        map.set(new ModHidden());

        expect(beatmap.maxDroidScore(map)).toBe(773);
    });

    test("With CS > 1x", () => {
        const map = new ModMap();
        map.set(new ModCustomSpeed(1.25));

        expect(beatmap.maxDroidScore(map)).toBe(773);
    });

    test("With CS < 1x", () => {
        const map = new ModMap();
        map.set(new ModCustomSpeed(0.75));

        expect(beatmap.maxDroidScore(map)).toBe(219);
    });

    test("With unranked mods", () => {
        const map = new ModMap();
        map.set(new ModRelax());

        expect(beatmap.maxDroidScore(map)).toBe(0);
    });

    describe("With ScoreV2", () => {
        test("Without extra mods", () => {
            const map = new ModMap();
            map.set(new ModScoreV2());

            expect(beatmap.maxDroidScore(map)).toBe(1e6);
        });

        test("With extra mods", () => {
            const map = new ModMap();
            map.set(new ModScoreV2());
            map.set(new ModHidden());

            expect(beatmap.maxDroidScore(map)).toBe(1.06e6);
        });
    });
});

describe("Test osu!standard max score calculation", () => {
    const constructBeatmap = () => {
        const beatmap = new Beatmap();
        const circle = new Circle({
            startTime: 1000,
            position: new Vector2(0, 0),
        });

        circle.applyDefaults(
            beatmap.controlPoints,
            beatmap.difficulty,
            Modes.osu,
        );

        beatmap.hitObjects.add(circle);

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
        const map = new ModMap();
        map.set(new ModHidden());

        expect(constructBeatmap().maxOsuScore(map)).toBe(300);
    });

    describe("With ScoreV2", () => {
        const beatmap = constructBeatmap();

        test("Without extra mods", () => {
            const map = new ModMap();
            map.set(new ModScoreV2());

            expect(beatmap.maxOsuScore(map)).toBe(1e6);
        });

        test("With extra mods", () => {
            const map = new ModMap();
            map.set(new ModScoreV2());
            map.set(new ModHidden());

            expect(beatmap.maxOsuScore(map)).toBe(1.06e6);
        });
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
            "A - B [D] mapped by C\n\nAR5 OD5 CS5 HP5\n0 circles, 0 sliders, 0 spinners\n0 max combo",
        );
    });

    test("With title unicode", () => {
        const beatmap = constructBeatmap();

        beatmap.metadata.artistUnicode = "E";
        beatmap.metadata.titleUnicode = "F";

        expect(beatmap.toString()).toBe(
            "A - B [(E - F)D] mapped by C\n\nAR5 OD5 CS5 HP5\n0 circles, 0 sliders, 0 spinners\n0 max combo",
        );
    });
});

describe("Test playable beatmap creation", () => {
    const beatmap = new Beatmap();

    beatmap.formatVersion = 14;

    beatmap.hitObjects.add(
        new Circle({
            startTime: 1000,
            position: new Vector2(256, 192),
        }),
        new Circle({
            startTime: 2000,
            position: new Vector2(320, 192),
        }),
        new Circle({
            startTime: 3000,
            position: new Vector2(384, 192),
        }),
    );

    for (const object of beatmap.hitObjects.objects) {
        object.applyDefaults(
            beatmap.controlPoints,
            beatmap.difficulty,
            Modes.osu,
        );
        object.applySamples(beatmap.controlPoints);
    }

    test("Test playable beatmap creation without options", () => {
        const playableBeatmap = beatmap.createOsuPlayableBeatmap();

        const [firstObject, secondObject, thirdObject] =
            playableBeatmap.hitObjects.objects;

        expect(playableBeatmap.formatVersion).toBe(14);
        expect(playableBeatmap.hitObjects.objects.length).toBe(3);

        expect(firstObject.startTime).toBe(1000);
        expect(secondObject.startTime).toBe(2000);
        expect(thirdObject.startTime).toBe(3000);

        expect(firstObject.position).toEqual(new Vector2(256, 192));
        expect(secondObject.position).toEqual(new Vector2(320, 192));
        expect(thirdObject.position).toEqual(new Vector2(384, 192));
    });

    describe("Test playable beatmap creation with options", () => {
        describe("osu!droid game mode", () => {
            const getConvertedFirstObject = (...mods: Mod[]) => {
                const modMap = new ModMap();

                for (const mod of mods) {
                    modMap.set(mod);
                }

                const playableBeatmap =
                    beatmap.createDroidPlayableBeatmap(modMap);

                return playableBeatmap.hitObjects.objects[0];
            };

            test("No Mod", () => {
                const firstObject = getConvertedFirstObject();

                expect(firstObject.scale).toBeCloseTo(0.9802961674103878);
                expect(firstObject.timePreempt).toBe(1200);
            });

            test("Hard Rock", () => {
                const firstObject = getConvertedFirstObject(new ModHardRock());

                expect(firstObject.position.y).toBe(192);
                expect(firstObject.scale).toBeCloseTo(0.8752531174103879);
            });

            test("Hidden", () => {
                const firstObject = getConvertedFirstObject(new ModHidden());

                expect(firstObject.timePreempt).toBeCloseTo(1200);
                expect(firstObject.timeFadeIn).toBeCloseTo(480);
            });

            test("Custom Speed 2x", () => {
                const firstObject = getConvertedFirstObject(
                    new ModCustomSpeed(2),
                );

                expect(firstObject.startTime).toBe(1000);
                expect(firstObject.timePreempt).toBeCloseTo(1200);
            });

            test("Custom Speed 1.25x, Really Easy", () => {
                const firstObject = getConvertedFirstObject(
                    new ModReallyEasy(),
                    new ModCustomSpeed(1.25),
                );

                expect(firstObject.startTime).toBe(1000);
                expect(firstObject.scale).toBeCloseTo(1.1553679174103877);
                expect(firstObject.timePreempt).toBeCloseTo(1290);
            });

            test("Custom Speed 1.25x, Really Easy, Difficulty Adjust (no override)", () => {
                const firstObject = getConvertedFirstObject(
                    new ModReallyEasy(),
                    new ModDifficultyAdjust(),
                    new ModCustomSpeed(1.25),
                );

                expect(firstObject.startTime).toBe(1000);
                expect(firstObject.scale).toBeCloseTo(0.9802961674103878);
                expect(firstObject.timePreempt).toBeCloseTo(1200);
            });

            test("Custom Speed 1.25x, Really Easy, Difficulty Adjust (CS override), Hard Rock", () => {
                const firstObject = getConvertedFirstObject(
                    new ModReallyEasy(),
                    new ModDifficultyAdjust({ cs: 4 }),
                    new ModHardRock(),
                    new ModCustomSpeed(1.25),
                );

                expect(firstObject.startTime).toBe(1000);
                expect(firstObject.scale).toBeCloseTo(1.050324867410388);
                expect(firstObject.timePreempt).toBeCloseTo(900);
            });
        });

        describe("osu!standard game mode", () => {
            const getConvertedFirstObject = (...mods: Mod[]) => {
                const modMap = new ModMap();

                for (const mod of mods) {
                    modMap.set(mod);
                }

                const playableBeatmap =
                    beatmap.createOsuPlayableBeatmap(modMap);

                return playableBeatmap.hitObjects.objects[0];
            };

            test("No Mod", () => {
                const firstObject = getConvertedFirstObject();

                expect(firstObject.scale).toBeCloseTo(0.500205);
                expect(firstObject.timePreempt).toBe(1200);
            });

            test("Hard Rock", () => {
                const firstObject = getConvertedFirstObject(new ModHardRock());

                expect(firstObject.scale).toBeCloseTo(0.39516195000000004);
                expect(firstObject.timePreempt).toBeCloseTo(900);
            });

            test("Hidden", () => {
                const firstObject = getConvertedFirstObject(new ModHidden());

                expect(firstObject.timePreempt).toBeCloseTo(1200);
                expect(firstObject.timeFadeIn).toBeCloseTo(480);
            });

            test("Custom Speed 2x", () => {
                const firstObject = getConvertedFirstObject(
                    new ModCustomSpeed(2),
                );

                expect(firstObject.startTime).toBe(1000);
                expect(firstObject.timePreempt).toBeCloseTo(1200);
            });

            test("Custom Speed 1.25x, Really Easy", () => {
                const firstObject = getConvertedFirstObject(
                    new ModReallyEasy(),
                    new ModCustomSpeed(1.25),
                );

                expect(firstObject.startTime).toBe(1000);
                expect(firstObject.scale).toBeCloseTo(0.500205);
                expect(firstObject.timePreempt).toBeCloseTo(1200);
            });

            test("Custom Speed 1.25x, Really Easy, Difficulty Adjust (no override)", () => {
                const firstObject = getConvertedFirstObject(
                    new ModReallyEasy(),
                    new ModDifficultyAdjust(),
                    new ModCustomSpeed(1.25),
                );

                expect(firstObject.startTime).toBe(1000);
                expect(firstObject.scale).toBeCloseTo(0.500205);
                expect(firstObject.timePreempt).toBeCloseTo(1200);
            });

            test("Custom Speed 1.25x, Really Easy, Difficulty Adjust (CS override), Hard Rock", () => {
                const firstObject = getConvertedFirstObject(
                    new ModReallyEasy(),
                    new ModDifficultyAdjust({ cs: 4 }),
                    new ModHardRock(),
                    new ModCustomSpeed(1.25),
                );

                expect(firstObject.startTime).toBe(1000);
                expect(firstObject.scale).toBeCloseTo(0.5702337);
                expect(firstObject.timePreempt).toBeCloseTo(900);
            });
        });
    });
});
