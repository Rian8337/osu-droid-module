import { readFile } from "fs/promises";
import { join } from "path";
import { BeatmapDecoder } from "../../src";

test("Test stacking edge case one", async () => {
    const beatmapFile = await readFile(
        join(
            process.cwd(),
            "tests",
            "files",
            "beatmaps",
            "stacking-edge-case-one.osu",
        ),
        { encoding: "utf-8" },
    );

    const beatmap = new BeatmapDecoder().decode(beatmapFile).result;
    const { objects } = beatmap.hitObjects;

    // The last hitobject triggers the stacking.
    for (let i = 0; i < objects.length - 1; ++i) {
        expect(objects[i].stackHeight).toBe(0);
    }
});

test("Test stacking edge case two", async () => {
    const beatmapFile = await readFile(
        join(
            process.cwd(),
            "tests",
            "files",
            "beatmaps",
            "stacking-edge-case-two.osu",
        ),
        { encoding: "utf-8" },
    );

    const beatmap = new BeatmapDecoder().decode(beatmapFile).result;
    const { objects } = beatmap.hitObjects;

    expect(objects).toHaveLength(3);

    // The last hitobject triggers the stacking.
    for (let i = 0; i < objects.length - 1; ++i) {
        expect(objects[i].stackHeight).toBe(0);
    }
});
