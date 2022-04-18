import {
    BeatmapCountdown,
    BeatmapOverlayPosition,
    EditorGridSize,
    GameMode,
    Parser,
    RGBColor,
    SampleBank,
    Vector2,
} from "../../src";
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

    expect(beatmap.colors.combo.length).toBe(4);
    expect(beatmap.colors.combo[0]).toEqual(new RGBColor(98, 243, 255));
    expect(beatmap.colors.combo[1]).toEqual(new RGBColor(251, 170, 251));
    expect(beatmap.colors.combo[2]).toEqual(new RGBColor(102, 171, 255));
    expect(beatmap.colors.combo[3]).toEqual(new RGBColor(162, 205, 232));
    expect(beatmap.colors.sliderBorder).toBeUndefined();
    expect(beatmap.colors.sliderTrackOverride).toBeUndefined();
    expect(beatmap.controlPoints.difficulty.points.length).toBe(530);
    expect(beatmap.controlPoints.effect.points.length).toBe(530);
    expect(beatmap.controlPoints.timing.points.length).toBe(5);
    expect(beatmap.controlPoints.sample.points.length).toBe(530);
    expect(beatmap.difficulty.ar).toBe(9);
    expect(beatmap.difficulty.cs).toBe(4);
    expect(beatmap.difficulty.hp).toBe(5);
    expect(beatmap.difficulty.od).toBe(8);
    expect(beatmap.difficulty.sliderMultiplier).toBe(1.9);
    expect(beatmap.difficulty.sliderTickRate).toBe(1);
    expect(beatmap.editor.beatDivisor).toBe(4);
    expect(beatmap.editor.bookmarks.length).toBe(0);
    expect(beatmap.editor.distanceSnap).toBe(0.2);
    expect(beatmap.editor.gridSize).toBe(EditorGridSize.small);
    expect(beatmap.editor.timelineZoom).toBeCloseTo(3);
    expect(beatmap.events.background?.filename).toBe("school.jpg");
    expect(beatmap.events.background?.offset).toEqual(new Vector2(0, 0));
    expect(beatmap.events.breaks.length).toBe(0);
    expect(beatmap.events.video?.filename).toBe("Yoasobi.mp4");
    expect(beatmap.events.video?.offset).toEqual(new Vector2(0, 0));
    expect(beatmap.formatVersion).toBe(14);
    expect(beatmap.general.audioFilename).toBe("audio.mp3");
    expect(beatmap.general.audioLeadIn).toBe(0);
    expect(beatmap.general.countdown).toBe(BeatmapCountdown.noCountDown);
    expect(beatmap.general.countdownOffset).toBe(0);
    expect(beatmap.general.epilepsyWarning).toBe(false);
    expect(beatmap.general.letterBoxInBreaks).toBe(false);
    expect(beatmap.general.mode).toBe(GameMode.osu);
    expect(beatmap.general.overlayPosition).toBe(
        BeatmapOverlayPosition.noChange
    );
    expect(beatmap.general.previewTime).toBe(49037);
    expect(beatmap.general.sampleBank).toBe(SampleBank.soft);
    expect(beatmap.general.samplesMatchPlaybackRate).toBe(false);
    expect(beatmap.general.skinPreference).toBe("");
    expect(beatmap.general.stackLeniency).toBe(0.2);
    expect(beatmap.general.useSkinSprites).toBe(false);
    expect(beatmap.general.widescreenStoryboard).toBe(true);
    expect(beatmap.hitObjects.circles).toBe(198);
    expect(beatmap.hitObjects.objects.length).toBe(592);
    expect(beatmap.hitObjects.sliderEnds).toBe(393);
    expect(beatmap.hitObjects.sliderRepeatPoints).toBe(27);
    expect(beatmap.hitObjects.sliders).toBe(393);
    expect(beatmap.hitObjects.spinners).toBe(1);
    expect(beatmap.maxCombo).toBe(1033);
    expect(beatmap.metadata.artist).toBe("YOASOBI");
    expect(beatmap.metadata.artistUnicode).toBe("YOASOBI");
    expect(beatmap.metadata.beatmapId).toBe(3324715);
    expect(beatmap.metadata.beatmapSetId).toBe(1585863);
    expect(beatmap.metadata.creator).toBe("ohm002");
    expect(beatmap.metadata.title).toBe("Love Letter");
    expect(beatmap.metadata.titleUnicode).toBe("ラブレター");
    expect(beatmap.metadata.version).toBe(
        "Please accept my overflowing emotions."
    );
});
