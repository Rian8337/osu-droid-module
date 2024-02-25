import { Beatmap, BeatmapConverter, Circle, Modes, Vector2 } from "../../src";

test("Test beatmap conversion", () => {
    const beatmap = new Beatmap();

    beatmap.formatVersion = 14;

    beatmap.hitObjects.add(
        new Circle({
            startTime: 1000,
            position: new Vector2(256, 192),
        }),
        new Circle({
            startTime: 2000,
            position: new Vector2(320, 192),
        }),
        new Circle({
            startTime: 3000,
            position: new Vector2(384, 192),
        }),
    );

    for (const object of beatmap.hitObjects.objects) {
        object.applyDefaults(
            beatmap.controlPoints,
            beatmap.difficulty,
            Modes.osu,
        );
        object.applySamples(beatmap.controlPoints);
    }

    const converted = new BeatmapConverter(beatmap).convert();

    expect(converted.formatVersion).toBe(14);
    expect(converted.hitObjects.objects.length).toBe(3);

    expect(converted.hitObjects.objects[0].startTime).toBe(1000);
    expect(converted.hitObjects.objects[1].startTime).toBe(2000);
    expect(converted.hitObjects.objects[2].startTime).toBe(3000);

    expect(converted.hitObjects.objects[0].position).toEqual(
        new Vector2(256, 192),
    );
    expect(converted.hitObjects.objects[1].position).toEqual(
        new Vector2(320, 192),
    );
    expect(converted.hitObjects.objects[2].position).toEqual(
        new Vector2(384, 192),
    );
});
