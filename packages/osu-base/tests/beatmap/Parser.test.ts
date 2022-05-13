import { Parser } from "../../src";
import { readFile } from "fs/promises";
import { join } from "path";

test("Test beatmap parse", async () => {
    const data = await readFile(
        join(
            process.cwd(),
            "tests",
            "files",
            "beatmaps",
            "YOASOBI - Love Letter (ohm002) [Please accept my overflowing emotions.].osu"
        ),
        { encoding: "utf-8" }
    );

    const parser = new Parser().parse(data);

    const beatmap = parser.map;

    expect(beatmap.ar).toBe(9);
    expect(beatmap.artist).toBe("YOASOBI");
    expect(beatmap.artistUnicode).toBe("YOASOBI");
    expect(beatmap.audioFileName).toBe("audio.mp3");
    expect(beatmap.backgroundFileName).toBe("school.jpg");
    expect(beatmap.beatmapId).toBe(3324715);
    expect(beatmap.beatmapSetId).toBe(1585863);
    expect(beatmap.breakPoints.length).toBe(0);
    expect(beatmap.circles).toBe(198);
    expect(beatmap.creator).toBe("ohm002");
    expect(beatmap.cs).toBe(4);
    expect(beatmap.difficultyTimingPoints.length).toBe(530);
    expect(beatmap.formatVersion).toBe(14);
    expect(beatmap.hp).toBe(5);
    expect(beatmap.maxCombo).toBe(1033);
    expect(beatmap.objects.length).toBe(592);
    expect(beatmap.od).toBe(8);
    expect(beatmap.sliderEnds).toBe(393);
    expect(beatmap.sliderRepeatPoints).toBe(27);
    expect(beatmap.sliders).toBe(393);
    expect(beatmap.spinners).toBe(1);
    expect(beatmap.stackLeniency).toBe(0.2);
    expect(beatmap.sv).toBe(1.9);
    expect(beatmap.tickRate).toBe(1);
    expect(beatmap.timingPoints.length).toBe(5);
    expect(beatmap.title).toBe("Love Letter");
    expect(beatmap.titleUnicode).toBe("ラブレター");
    expect(beatmap.version).toBe("Please accept my overflowing emotions.");
});
