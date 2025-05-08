import { Beatmap, BeatmapProcessor, Circle, Modes, Vector2 } from "../../src";

test("Test post-beatmap processing", () => {
    const beatmap = new Beatmap();

    beatmap.hitObjects.add(
        new Circle({
            startTime: 1000,
            position: new Vector2(256, 192),
        }),
        new Circle({
            startTime: 1100,
            position: new Vector2(256, 192),
        }),
    );

    for (const object of beatmap.hitObjects.objects) {
        object.applyDefaults(
            beatmap.controlPoints,
            beatmap.difficulty,
            Modes.osu,
        );
    }

    new BeatmapProcessor(beatmap).postProcess();

    expect(beatmap.hitObjects.objects[0].stackHeight).toBe(1);
    expect(beatmap.hitObjects.objects[1].stackHeight).toBe(0);
});
