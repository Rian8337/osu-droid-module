import { Axes, ModMirror } from "../../src";

test("Test serialization", () => {
    const mod = new ModMirror();

    mod.flippedAxes.value = Axes.x;
    expect(mod.serialize().settings).toEqual({ flippedAxes: 0 });

    mod.flippedAxes.value = Axes.y;
    expect(mod.serialize().settings).toEqual({ flippedAxes: 1 });

    mod.flippedAxes.value = Axes.both;
    expect(mod.serialize().settings).toEqual({ flippedAxes: 2 });
});

test("Test equals", () => {
    const mod1 = new ModMirror();
    const mod2 = new ModMirror();
    const mod3 = new ModMirror();
    const mod4 = new ModMirror();

    mod1.flippedAxes.value = Axes.x;
    mod2.flippedAxes.value = Axes.x;
    mod3.flippedAxes.value = Axes.y;
    mod4.flippedAxes.value = Axes.both;

    expect(mod1.equals(mod2)).toBe(true);
    expect(mod1.equals(mod3)).toBe(false);
    expect(mod1.equals(mod4)).toBe(false);
    expect(mod3.equals(mod4)).toBe(false);
});

test("Test toString", () => {
    const mod = new ModMirror();

    mod.flippedAxes.value = Axes.x;
    expect(mod.toString()).toBe("MR (↔)");

    mod.flippedAxes.value = Axes.y;
    expect(mod.toString()).toBe("MR (↕)");

    mod.flippedAxes.value = Axes.both;
    expect(mod.toString()).toBe("MR (↔, ↕)");
});
