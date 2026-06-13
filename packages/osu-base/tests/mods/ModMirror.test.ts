import { Axes, ModMirror } from "../../src";

test("Test serialization", () => {
    const mod = new ModMirror();

    expect(mod.serialize().settings).toBeUndefined();

    mod.flippedAxes.value = Axes.Y;
    expect(mod.serialize().settings).toEqual({ flippedAxes: 1 });

    mod.flippedAxes.value = Axes.Both;
    expect(mod.serialize().settings).toEqual({ flippedAxes: 2 });

    mod.flippedAxes.value = Axes.X;
    expect(mod.serialize().settings).toBeUndefined();
});

test("Test equals", () => {
    const mod1 = new ModMirror();
    const mod2 = new ModMirror();
    const mod3 = new ModMirror();
    const mod4 = new ModMirror();

    mod1.flippedAxes.value = Axes.X;
    mod2.flippedAxes.value = Axes.X;
    mod3.flippedAxes.value = Axes.Y;
    mod4.flippedAxes.value = Axes.Both;

    expect(mod1.equals(mod2)).toBe(true);
    expect(mod1.equals(mod3)).toBe(false);
    expect(mod1.equals(mod4)).toBe(false);
    expect(mod3.equals(mod4)).toBe(false);
});

test("Test toString", () => {
    const mod = new ModMirror();

    mod.flippedAxes.value = Axes.X;
    expect(mod.toString()).toBe("MR (↔)");

    mod.flippedAxes.value = Axes.Y;
    expect(mod.toString()).toBe("MR (↕)");

    mod.flippedAxes.value = Axes.Both;
    expect(mod.toString()).toBe("MR (↔, ↕)");
});
