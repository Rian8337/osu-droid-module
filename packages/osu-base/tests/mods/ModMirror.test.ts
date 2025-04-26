import { Axes, ModMirror } from "../../src";

test("Test serialization", () => {
    const mod = new ModMirror();

    mod.flippedAxes = Axes.x;
    expect(mod.serialize().settings).toEqual({ flippedAxes: 0 });

    mod.flippedAxes = Axes.y;
    expect(mod.serialize().settings).toEqual({ flippedAxes: 1 });

    mod.flippedAxes = Axes.both;
    expect(mod.serialize().settings).toEqual({ flippedAxes: 2 });
});

test("Test toString", () => {
    const mod = new ModMirror();

    mod.flippedAxes = Axes.x;
    expect(mod.toString()).toBe("MR (↔)");

    mod.flippedAxes = Axes.y;
    expect(mod.toString()).toBe("MR (↕)");

    mod.flippedAxes = Axes.both;
    expect(mod.toString()).toBe("MR (↔, ↕)");
});
