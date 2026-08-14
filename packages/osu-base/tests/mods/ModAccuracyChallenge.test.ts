import { AccuracyMode, ModAccuracyChallenge } from "../../src";

test("Test serialization", () => {
    const mod = new ModAccuracyChallenge();

    expect(mod.serialize().settings).toBeUndefined();

    mod.accuracyJudgeMode.value = AccuracyMode.Standard;
    expect(mod.serialize().settings).toEqual({ accuracyJudgeMode: 1 });

    mod.minimumAccuracy.value = 0.95;
    expect(mod.serialize().settings).toEqual({
        minimumAccuracy: 0.95,
        accuracyJudgeMode: 1,
    });

    mod.accuracyJudgeMode.value = AccuracyMode.MaximumAchievable;
    expect(mod.serialize().settings).toEqual({ minimumAccuracy: 0.95 });
});

test("Test deserialization", () => {
    const mod = new ModAccuracyChallenge();

    mod.copySettings({ acronym: "AC", settings: { accuracyJudgeMode: 1 } });

    expect(mod.accuracyJudgeMode.value).toBe(AccuracyMode.Standard);
});

test("Test equals", () => {
    const mod1 = new ModAccuracyChallenge();
    const mod2 = new ModAccuracyChallenge();
    const mod3 = new ModAccuracyChallenge();

    mod1.accuracyJudgeMode.value = AccuracyMode.Standard;
    mod2.accuracyJudgeMode.value = AccuracyMode.Standard;
    mod3.accuracyJudgeMode.value = AccuracyMode.MaximumAchievable;

    expect(mod1.equals(mod2)).toBe(true);
    expect(mod1.equals(mod3)).toBe(false);
});
