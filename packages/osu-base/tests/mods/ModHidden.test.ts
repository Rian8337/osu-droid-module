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
