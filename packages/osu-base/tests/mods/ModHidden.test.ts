import { Beatmap, Circle, ModHidden, Modes, Vector2 } from "../../src";

test("Test object fade in adjustment", () => {
    const beatmap = new Beatmap();
    beatmap.difficulty.ar = 5;

    const circle = new Circle({
        startTime: 0,
        position: new Vector2(0),
    });

    circle.applyDefaults(beatmap.controlPoints, beatmap.difficulty, Modes.osu);
    beatmap.hitObjects.add(circle);

    new ModHidden().applyToBeatmap(beatmap);

    expect(circle.timeFadeIn).toBeCloseTo(480, 1e-5);
});

test("Test equals", () => {
    const mod1 = new ModHidden();
    const mod2 = new ModHidden();
    const mod3 = new ModHidden();

    mod1.onlyFadeApproachCircles.value = false;
    mod2.onlyFadeApproachCircles.value = false;
    mod3.onlyFadeApproachCircles.value = true;

    expect(mod1.equals(mod2)).toBe(true);
    expect(mod1.equals(mod3)).toBe(false);
});

test("Test toString", () => {
    const mod = new ModHidden();

    expect(mod.toString()).toBe("HD");

    mod.onlyFadeApproachCircles.value = true;
    expect(mod.toString()).toBe("HD (approach circles only)");
});
