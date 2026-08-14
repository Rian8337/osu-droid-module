import { ModTargetPractice } from "../../src";

test("Test serialization", () => {
    const mod = new ModTargetPractice();

    expect(mod.serialize().settings).toBeUndefined();

    mod.metronome.value = false;
    expect(mod.serialize().settings).toEqual({ metronome: false });

    mod.seed.value = 100;
    expect(mod.serialize().settings).toEqual({
        seed: 100,
        metronome: false,
    });
});

test("Test equals", () => {
    const mod1 = new ModTargetPractice();
    const mod2 = new ModTargetPractice();
    const mod3 = new ModTargetPractice();

    mod1.seed.value = 100;
    mod2.seed.value = 100;
    mod3.seed.value = 200;

    expect(mod1.equals(mod2)).toBe(true);
    expect(mod1.equals(mod3)).toBe(false);
});
