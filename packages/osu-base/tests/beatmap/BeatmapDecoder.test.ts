import {
    Beatmap,
    BeatmapCountdown,
    BeatmapDecoder,
    BeatmapOverlayPosition,
    EditorGridSize,
    GameMode,
    RGBColor,
    SampleBank,
    Slider,
    Vector2,
} from "../../src";
import { readFile } from "fs/promises";
import { join } from "path";

let beatmap = new Beatmap();

beforeAll(async () => {
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

    beatmap = new BeatmapDecoder().decode(data).result;
});

test("Test colors section", () => {
    const { colors } = beatmap;

    expect(colors.combo.length).toBe(4);
    expect(colors.combo[0]).toEqual(new RGBColor(98, 243, 255));
    expect(colors.combo[1]).toEqual(new RGBColor(251, 170, 251));
    expect(colors.combo[2]).toEqual(new RGBColor(102, 171, 255));
    expect(colors.combo[3]).toEqual(new RGBColor(162, 205, 232));
    expect(colors.sliderBorder).toBeUndefined();
    expect(colors.sliderTrackOverride).toBeUndefined();
});

test("Test control points section", () => {
    const { controlPoints } = beatmap;

    expect(controlPoints.difficulty.points.length).toBe(14);
    expect(controlPoints.effect.points.length).toBe(14);
    expect(controlPoints.timing.points.length).toBe(5);
    expect(controlPoints.sample.points.length).toBe(526);
});

test("Test difficulty section", () => {
    const { difficulty } = beatmap;

    expect(difficulty.ar).toBe(9);
    expect(difficulty.cs).toBe(4);
    expect(difficulty.hp).toBe(5);
    expect(difficulty.od).toBe(8);
    expect(difficulty.sliderMultiplier).toBe(1.9);
    expect(difficulty.sliderTickRate).toBe(1);
});

test("Test editor section", () => {
    const { editor } = beatmap;

    expect(editor.beatDivisor).toBe(4);
    expect(editor.bookmarks.length).toBe(0);
    expect(editor.distanceSnap).toBe(0.2);
    expect(editor.gridSize).toBe(EditorGridSize.small);
    expect(editor.timelineZoom).toBeCloseTo(3);
});

test("Test events section", () => {
    const { events } = beatmap;

    expect(events.background?.filename).toBe("school.jpg");
    expect(events.background?.offset).toEqual(new Vector2(0, 0));
    expect(events.breaks.length).toBe(0);
    expect(events.video?.filename).toBe("Yoasobi.mp4");
    expect(events.video?.offset).toEqual(new Vector2(0, 0));
});

test("Test format version header", () => {
    expect(beatmap.formatVersion).toBe(14);
});

test("Test general section", () => {
    const { general } = beatmap;

    expect(general.audioFilename).toBe("audio.mp3");
    expect(general.audioLeadIn).toBe(0);
    expect(general.countdown).toBe(BeatmapCountdown.noCountDown);
    expect(general.countdownOffset).toBe(0);
    expect(general.epilepsyWarning).toBe(false);
    expect(general.letterBoxInBreaks).toBe(false);
    expect(general.mode).toBe(GameMode.osu);
    expect(general.overlayPosition).toBe(BeatmapOverlayPosition.noChange);
    expect(general.previewTime).toBe(49037);
    expect(general.sampleBank).toBe(SampleBank.soft);
    expect(general.sampleVolume).toBe(100);
    expect(general.samplesMatchPlaybackRate).toBe(true);
    expect(general.skinPreference).toBe("");
    expect(general.stackLeniency).toBe(0.2);
    expect(general.useSkinSprites).toBe(false);
    expect(general.widescreenStoryboard).toBe(true);
});

test("Test hitobject counters", () => {
    const { hitObjects } = beatmap;

    expect(hitObjects.circles).toBe(198);
    expect(hitObjects.objects.length).toBe(592);
    expect(hitObjects.sliderEnds).toBe(393);
    expect(hitObjects.sliderRepeatPoints).toBe(27);
    expect(hitObjects.sliders).toBe(393);
    expect(hitObjects.spinners).toBe(1);
});

test("Test hit object samples", () => {
    const slider = <Slider>beatmap.hitObjects.objects[1];

    const [firstSample, lastSample] = slider.samples;

    expect(slider.samples.length).toBe(2);
    expect(firstSample.name).toBe("hitnormal");
    expect(firstSample.bank).toBe(SampleBank.soft);
    expect(firstSample.customSampleBank).toBe(0);
    expect(firstSample.volume).toBe(0);
    expect(firstSample.isLayered).toBe(true);
    expect(lastSample.name).toBe("hitclap");
    expect(lastSample.bank).toBe(SampleBank.drum);
    expect(lastSample.customSampleBank).toBe(0);
    expect(lastSample.volume).toBe(0);
    expect(lastSample.isLayered).toBe(false);
});

test("Test hit object per-node samples", () => {
    const slider = <Slider>beatmap.hitObjects.objects[1];

    for (const nodeSample of slider.nodeSamples) {
        const [firstSample, lastSample] = nodeSample;

        expect(firstSample.name).toBe("hitnormal");
        expect(firstSample.bank).toBe(SampleBank.soft);
        expect(firstSample.customSampleBank).toBe(0);
        expect(firstSample.volume).toBe(0);
        expect(firstSample.isLayered).toBe(true);
        expect(firstSample.isCustom).toBe(false);

        expect(lastSample.name).toBe("hitclap");
        expect(lastSample.bank).toBe(SampleBank.drum);
        expect(lastSample.customSampleBank).toBe(0);
        expect(lastSample.volume).toBe(0);
        expect(lastSample.isLayered).toBe(false);
        expect(lastSample.isCustom).toBe(false);
    }
});

test("Test max combo getter", () => {
    expect(beatmap.maxCombo).toBe(1033);
});

test("Test metadata section", () => {
    const { metadata } = beatmap;

    expect(metadata.artist).toBe("YOASOBI");
    expect(metadata.artistUnicode).toBe("YOASOBI");
    expect(metadata.beatmapId).toBe(3324715);
    expect(metadata.beatmapSetId).toBe(1585863);
    expect(metadata.creator).toBe("ohm002");
    expect(metadata.title).toBe("Love Letter");
    expect(metadata.titleUnicode).toBe("ラブレター");
    expect(metadata.version).toBe("Please accept my overflowing emotions.");
    expect(metadata.source).toBe("");
    expect(metadata.tags.length).toBe(27);
});
