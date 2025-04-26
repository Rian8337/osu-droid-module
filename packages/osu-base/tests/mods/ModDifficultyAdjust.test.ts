import {
    BeatmapControlPoints,
    BeatmapDifficulty,
    ModDifficultyAdjust,
    ModDoubleTime,
    ModHardRock,
    ModMap,
    ModReallyEasy,
    Modes,
    ObjectTypes,
    PathType,
    Slider,
    SliderPath,
    Vector2,
} from "../../src";

test("Test beatmap setting override without additional mods", () => {
    const difficulty = new BeatmapDifficulty();

    new ModDifficultyAdjust({
        cs: 4,
        ar: 8,
        od: 7,
        hp: 6,
    }).applyToDifficultyWithSettings(Modes.droid, difficulty, new ModMap());

    expect(difficulty.cs).toBe(4);
    expect(difficulty.ar).toBe(8);
    expect(difficulty.od).toBe(7);
    expect(difficulty.hp).toBe(6);
});

test("Test beatmap setting override with additional mods", () => {
    const difficulty = new BeatmapDifficulty();
    const modMap = new ModMap();

    modMap.set(ModHardRock);
    modMap.set(ModReallyEasy);

    new ModDifficultyAdjust({
        cs: 6,
        ar: 6,
        od: 6,
        hp: 6,
    }).applyToDifficultyWithSettings(Modes.droid, difficulty, modMap);

    expect(difficulty.cs).toBe(6);
    expect(difficulty.ar).toBe(6);
    expect(difficulty.od).toBe(6);
    expect(difficulty.hp).toBe(6);
});

test("Test AR override with non-1x speed multiplier", () => {
    const difficulty = new BeatmapDifficulty();
    const modMap = new ModMap();

    modMap.set(ModDoubleTime);

    new ModDifficultyAdjust({ ar: 9 }).applyToDifficultyWithSettings(
        Modes.droid,
        difficulty,
        modMap,
    );

    expect(difficulty.ar).toBe(7);
});

test("Test object fade in adjustments with non-1x speed multiplier AR override", () => {
    const modMap = new ModMap();
    modMap.set(ModDoubleTime);

    const difficulty = new BeatmapDifficulty();
    const difficultyAdjust = new ModDifficultyAdjust({ ar: 9 });

    difficultyAdjust.applyToDifficultyWithSettings(
        Modes.droid,
        difficulty,
        modMap,
    );

    const slider = new Slider({
        startTime: 0,
        position: new Vector2(0),
        repeatCount: 0,
        path: new SliderPath({
            pathType: PathType.Linear,
            controlPoints: [new Vector2(0), new Vector2(256, 0)],
            expectedDistance: 256,
        }),
        type: ObjectTypes.slider,
        tickDistanceMultiplier: 1,
        nodeSamples: [],
    });

    slider.applyDefaults(new BeatmapControlPoints(), difficulty, Modes.droid);
    difficultyAdjust.applyToHitObjectWithSettings(Modes.droid, slider, modMap);

    expect(slider.timePreempt).toBeCloseTo(900);
    expect(slider.timeFadeIn).toBeCloseTo(600);

    expect(slider.head.timePreempt).toBeCloseTo(900);
    expect(slider.head.timeFadeIn).toBeCloseTo(600);

    const tick = slider.nestedHitObjects[1];

    expect(tick.timePreempt).toBeCloseTo(1094);
    expect(tick.timeFadeIn).toBeCloseTo(600);
});

test("Test serialization", () => {
    const mod = new ModDifficultyAdjust();

    expect(mod.serialize().settings).toBeUndefined();

    mod.cs = 4;
    mod.ar = 9;

    expect(mod.serialize().settings).toEqual({ cs: 4, ar: 9 });

    mod.od = 8;
    mod.hp = 6;

    expect(mod.serialize().settings).toEqual({ cs: 4, ar: 9, od: 8, hp: 6 });
});

test("Test toString", () => {
    const mod = new ModDifficultyAdjust();

    expect(mod.toString()).toBe("DA");

    mod.cs = 4;
    mod.ar = 9;
    mod.od = 8;
    mod.hp = 6;

    expect(mod.toString()).toBe("DA (CS4.0, AR9.0, OD8.0, HP6.0)");
});
