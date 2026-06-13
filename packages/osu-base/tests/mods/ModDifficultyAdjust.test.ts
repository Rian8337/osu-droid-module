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

function setOriginals(
    mod: ModDifficultyAdjust,
    options: { cs?: number; ar?: number; od?: number; hp?: number },
) {
    if (options.cs !== undefined) {
        mod.cs.defaultValue = options.cs;
        mod.cs.originalValue = options.cs;
    }
    if (options.ar !== undefined) {
        mod.ar.defaultValue = options.ar;
        mod.ar.originalValue = options.ar;
    }
    if (options.od !== undefined) {
        mod.od.defaultValue = options.od;
        mod.od.originalValue = options.od;
    }
    if (options.hp !== undefined) {
        mod.hp.defaultValue = options.hp;
        mod.hp.originalValue = options.hp;
    }
}

function roundTrip(mod: ModDifficultyAdjust): ModDifficultyAdjust {
    return ModUtil.deserializeMods(ModUtil.serializeMods([mod])).get(
        ModDifficultyAdjust,
    )!;
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

test("Test serialization embeds original value", () => {
    const mod = new ModDifficultyAdjust();
    mod.cs.value = 7;
    mod.od.value = 9;
    setOriginals(mod, { cs: 4, od: 8 });

    const settings = mod.serialize().settings!;

    const csSetting = settings.cs as {
        adjusted: number;
        original: number | null;
    };
    expect(csSetting.adjusted).toBe(7);
    expect(csSetting.original).toBe(4);

    const odSetting = settings.od as {
        adjusted: number;
        original: number | null;
    };
    expect(odSetting.adjusted).toBe(9);
    expect(odSetting.original).toBe(8);
});

test("Test serialization writes null original when beatmap is unknown", () => {
    const mod = new ModDifficultyAdjust();
    mod.cs.value = 7;

    const settings = mod.serialize().settings!;

    const csSetting = settings.cs as {
        adjusted: number;
        original: number | null;
    };
    expect(csSetting.adjusted).toBe(7);
    expect(csSetting.original).toBeNull();
});

test("Test deserialization of new format", () => {
    const mod = new ModDifficultyAdjust();
    mod.cs.value = 7;
    mod.od.value = 9;
    setOriginals(mod, { cs: 4, od: 8 });

    const deserialized = roundTrip(mod);

    expect(deserialized.cs.value).toBe(7);
    expect(deserialized.cs.originalValue).toBe(4);
    expect(deserialized.od.value).toBe(9);
    expect(deserialized.od.originalValue).toBe(8);
});

test("Test deserialization of old scalar format", () => {
    const json = `[{"acronym":"DA","settings":{"cs":7.0,"od":9.0}}]`;
    const deserialized =
        ModUtil.deserializeMods(json).get(ModDifficultyAdjust)!;

    expect(deserialized.cs.value).toBe(7);
    expect(deserialized.cs.originalValue).toBeNull();
    expect(deserialized.od.value).toBe(9);
    expect(deserialized.od.originalValue).toBeNull();
});

test("Test deserialization of new format with null original", () => {
    const json = `[{"acronym":"DA","settings":{"cs":{"adjusted":7.0,"original":null}}}]`;
    const deserialized =
        ModUtil.deserializeMods(json).get(ModDifficultyAdjust)!;

    expect(deserialized.cs.value).toBe(7);
    expect(deserialized.cs.originalValue).toBeNull();
});

test("Test score multiplier uses embedded original", () => {
    const mod = new ModDifficultyAdjust();
    mod.cs.value = 7;
    mod.od.value = 9;
    setOriginals(mod, { cs: 4, od: 8 });

    const csDiff = 7 - 4;
    const odDiff = 9 - 8;
    const expected =
        (1 + 0.0075 * Math.pow(csDiff, 1.5)) *
        (1 + 0.005 * Math.pow(odDiff, 1.3));

    expect(mod.droidScoreMultiplier).toBeCloseTo(expected, 10);
});

test("Test score multiplier is 1 without original or default", () => {
    const mod = new ModDifficultyAdjust();
    mod.cs.value = 7;
    mod.od.value = 9;

    expect(mod.droidScoreMultiplier).toBe(1);
});

test("Test score multiplier falls back to defaultValue when original is absent", () => {
    const mod = new ModDifficultyAdjust();
    mod.cs.value = 7;
    mod.cs.defaultValue = 4;

    const diff = 7 - 4;
    const expected = 1 + 0.0075 * Math.pow(diff, 1.5);

    expect(mod.droidScoreMultiplier).toBeCloseTo(expected, 10);
});

test("Test copySettings preserves original values", () => {
    const mod = new ModDifficultyAdjust();
    mod.cs.value = 7;
    mod.od.value = 9;
    setOriginals(mod, { cs: 4, od: 8 });

    const copy = new ModDifficultyAdjust();
    copy.copySettings(mod.serialize());

    expect(copy.cs.value).toBe(7);
    expect(copy.cs.originalValue).toBe(4);
    expect(copy.od.value).toBe(9);
    expect(copy.od.originalValue).toBe(8);
});
