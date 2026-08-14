import {
    BeatmapControlPoints,
    BeatmapDifficulty,
    ModDifficultyAdjust,
    ModDoubleTime,
    ModHardRock,
    ModMap,
    ModReallyEasy,
    ModReplayV6,
    ModUtil,
    Modes,
    ObjectTypes,
    PathType,
    Slider,
    SliderPath,
    Vector2,
} from "../../src";

function setDefaults(
    mod: ModDifficultyAdjust,
    options: { cs?: number; ar?: number; od?: number; hp?: number },
) {
    if (options.cs !== undefined) {
        mod.cs.defaultValue = options.cs;
    }
    if (options.ar !== undefined) {
        mod.ar.defaultValue = options.ar;
    }
    if (options.od !== undefined) {
        mod.od.defaultValue = options.od;
    }
    if (options.hp !== undefined) {
        mod.hp.defaultValue = options.hp;
    }
}

test("Test beatmap setting override without additional mods", () => {
    const difficulty = new BeatmapDifficulty();

    new ModDifficultyAdjust({
        cs: 4,
        ar: 8,
        od: 7,
        hp: 6,
    }).applyToDifficultyWithMods(Modes.Droid, difficulty, new ModMap());

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
    }).applyToDifficultyWithMods(Modes.Droid, difficulty, modMap);

    expect(difficulty.cs).toBe(6);
    expect(difficulty.ar).toBe(6);
    expect(difficulty.od).toBe(6);
    expect(difficulty.hp).toBe(6);
});

test("Test AR override with non-1x speed multiplier", () => {
    const difficulty = new BeatmapDifficulty();
    const modMap = new ModMap();

    modMap.set(ModDoubleTime);

    new ModDifficultyAdjust({ ar: 9 }).applyToDifficultyWithMods(
        Modes.Droid,
        difficulty,
        modMap,
    );

    expect(difficulty.ar).toBe(9);
});

test("Test AR override with non-1x speed multiplier with old scaling", () => {
    const difficulty = new BeatmapDifficulty();
    const modMap = new ModMap();

    modMap.set(ModDoubleTime);
    modMap.set(ModReplayV6);

    new ModDifficultyAdjust({ ar: 9 }).applyToDifficultyWithMods(
        Modes.Droid,
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

    difficultyAdjust.applyToDifficultyWithMods(Modes.Droid, difficulty, modMap);

    const slider = new Slider({
        startTime: 0,
        position: new Vector2(0),
        repeatCount: 0,
        path: new SliderPath({
            pathType: PathType.Linear,
            controlPoints: [new Vector2(0), new Vector2(256, 0)],
            expectedDistance: 256,
        }),
        type: ObjectTypes.Slider,
        tickDistanceMultiplier: 1,
        nodeSamples: [],
    });

    slider.applyDefaults(new BeatmapControlPoints(), difficulty, Modes.Droid);
    difficultyAdjust.applyToHitObjectWithMods(Modes.Droid, slider, modMap);

    expect(slider.timePreempt).toBeCloseTo(600);
    expect(slider.timeFadeIn).toBeCloseTo(400);

    expect(slider.head.timePreempt).toBeCloseTo(600);
    expect(slider.head.timeFadeIn).toBeCloseTo(400);

    const tick = slider.nestedHitObjects[1];

    expect(tick.timePreempt).toBeCloseTo(896);
    expect(tick.timeFadeIn).toBeCloseTo(400);
});

test("Test object fade in adjustments with non-1x speed multiplier AR override with old scaling", () => {
    const modMap = new ModMap();

    modMap.set(ModDoubleTime);
    modMap.set(ModReplayV6);

    const difficulty = new BeatmapDifficulty();
    const difficultyAdjust = new ModDifficultyAdjust({ ar: 9 });

    difficultyAdjust.applyToDifficultyWithMods(Modes.Droid, difficulty, modMap);

    const slider = new Slider({
        startTime: 0,
        position: new Vector2(0),
        repeatCount: 0,
        path: new SliderPath({
            pathType: PathType.Linear,
            controlPoints: [new Vector2(0), new Vector2(256, 0)],
            expectedDistance: 256,
        }),
        type: ObjectTypes.Slider,
        tickDistanceMultiplier: 1,
        nodeSamples: [],
    });

    slider.applyDefaults(new BeatmapControlPoints(), difficulty, Modes.Droid);
    difficultyAdjust.applyToHitObjectWithMods(Modes.Droid, slider, modMap);

    expect(slider.timePreempt).toBeCloseTo(900);
    expect(slider.timeFadeIn).toBeCloseTo(600);

    expect(slider.head.timePreempt).toBeCloseTo(900);
    expect(slider.head.timeFadeIn).toBeCloseTo(600);

    const tick = slider.nestedHitObjects[1];

    expect(tick.timePreempt).toBeCloseTo(1094);
    expect(tick.timeFadeIn).toBeCloseTo(600);
});

test("Test equals", () => {
    const mod1 = new ModDifficultyAdjust({
        cs: 4,
        ar: 9,
        od: 8,
        hp: 6,
    });

    const mod2 = new ModDifficultyAdjust({
        cs: 4,
        ar: 9,
        od: 8,
        hp: 6,
    });

    const mod3 = new ModDifficultyAdjust({
        cs: 5,
        ar: 9,
        od: 8,
        hp: 6,
    });

    const mod4 = new ModDifficultyAdjust({
        cs: 4,
        ar: 9,
        od: 8,
    });

    expect(mod1.equals(mod2)).toBe(true);
    expect(mod1.equals(mod3)).toBe(false);
    expect(mod1.equals(mod4)).toBe(false);
});

test("Test toString", () => {
    const mod = new ModDifficultyAdjust();

    expect(mod.toString()).toBe("DA");

    mod.cs.value = 4;
    mod.ar.value = 9;
    mod.od.value = 8;
    mod.hp.value = 6;

    expect(mod.toString()).toBe("DA (CS4.0, AR9.0, OD8.0, HP6.0)");
});

test("Test serialization writes a plain scalar", () => {
    const mod = new ModDifficultyAdjust();
    mod.cs.value = 7;
    mod.od.value = 9;
    setDefaults(mod, { cs: 4, od: 8 });

    const settings = mod.serialize().settings!;

    expect(settings.cs).toBe(7);
    expect(settings.od).toBe(9);
});

test("Test isDefault is unaffected by defaultValue", () => {
    const mod = new ModDifficultyAdjust();
    setDefaults(mod, { cs: 4 });

    // `value` is still null (no override active), regardless of `defaultValue`.
    expect(mod.cs.isDefault).toBe(true);

    mod.cs.value = 4;

    expect(mod.cs.isDefault).toBe(false);
});

test("Test deserialization of the new scalar format", () => {
    const json = `[{"acronym":"DA","settings":{"cs":7.0,"od":9.0}}]`;
    const deserialized =
        ModUtil.deserializeMods(json).get(ModDifficultyAdjust)!;

    expect(deserialized.cs.value).toBe(7);
    expect(deserialized.od.value).toBe(9);
});

test("Test deserialization of the legacy object format", () => {
    const json = `[{"acronym":"DA","settings":{"cs":{"adjusted":7.0,"original":4.0},"od":{"adjusted":9.0,"original":8.0}}}]`;
    const deserialized =
        ModUtil.deserializeMods(json).get(ModDifficultyAdjust)!;

    expect(deserialized.cs.value).toBe(7);
    expect(deserialized.cs.defaultValue).toBe(4);
    expect(deserialized.od.value).toBe(9);
    expect(deserialized.od.defaultValue).toBe(8);
});

test("Test deserialization of the legacy object format with null original", () => {
    const json = `[{"acronym":"DA","settings":{"cs":{"adjusted":7.0,"original":null}}}]`;
    const deserialized =
        ModUtil.deserializeMods(json).get(ModDifficultyAdjust)!;

    expect(deserialized.cs.value).toBe(7);
    expect(deserialized.cs.defaultValue).toBeNull();
});

test("Test copySettings copies the adjusted value only", () => {
    const mod = new ModDifficultyAdjust();
    mod.cs.value = 7;
    mod.od.value = 9;
    setDefaults(mod, { cs: 4, od: 8 });

    const copy = new ModDifficultyAdjust();
    copy.copySettings(mod.serialize());

    expect(copy.cs.value).toBe(7);
    expect(copy.od.value).toBe(9);

    // `defaultValue` is not part of the serialized format, so it is not carried over.
    expect(copy.cs.defaultValue).toBeNull();
    expect(copy.od.defaultValue).toBeNull();
});
