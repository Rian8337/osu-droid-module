import { Beatmap, BeatmapProcessor, Circle, Modes, Vector2 } from "../../src";

describe("Test post-beatmap processing", () => {
    const createBeatmap = (mode: Modes) => {
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
                mode,
            );
        }

        return beatmap;
    };

    test("osu!droid game mode", () => {
        const beatmap = createBeatmap(Modes.droid);

        new BeatmapProcessor(beatmap).postProcess(Modes.droid);

        expect(beatmap.hitObjects.objects[0].stackHeight).toBe(0);
        expect(beatmap.hitObjects.objects[1].stackHeight).toBe(1);
    });

    test("osu!standard game mode", () => {
        const beatmap = createBeatmap(Modes.osu);

        new BeatmapProcessor(beatmap).postProcess(Modes.osu);

        expect(beatmap.hitObjects.objects[0].stackHeight).toBe(1);
        expect(beatmap.hitObjects.objects[1].stackHeight).toBe(0);
    });
});
