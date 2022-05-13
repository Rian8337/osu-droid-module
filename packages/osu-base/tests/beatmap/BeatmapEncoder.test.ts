import { readFile } from "fs/promises";
import { join } from "path";
import { Beatmap, BeatmapDecoder, BeatmapEncoder, Slider } from "../../src";

let originalBeatmap = new Beatmap();
let parsedBeatmap = new Beatmap();

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

    originalBeatmap = new BeatmapDecoder().decode(data).map;

    parsedBeatmap = new BeatmapDecoder().decode(
        new BeatmapEncoder(originalBeatmap).encode()
    ).map;
});

test("Test colors section", () => {
    const { colors: original } = originalBeatmap;
    const { colors: parsed } = parsedBeatmap;

    expect(parsed.combo.length).toBe(original.combo.length);
    expect(parsed.combo[0]).toEqual(original.combo[0]);
    expect(parsed.combo[1]).toEqual(original.combo[1]);
    expect(parsed.combo[2]).toEqual(original.combo[2]);
    expect(parsed.combo[3]).toEqual(original.combo[3]);
    expect(parsed.sliderBorder).toBe(original.sliderBorder);
    expect(parsed.sliderTrackOverride).toBe(original.sliderTrackOverride);
});

test("Test control points section", () => {
    const { controlPoints: original } = originalBeatmap;
    const { controlPoints: parsed } = parsedBeatmap;

    expect(parsed.difficulty.points.length).toBe(
        original.difficulty.points.length
    );
    expect(parsed.effect.points.length).toBe(original.effect.points.length);
    expect(parsed.timing.points.length).toBe(original.timing.points.length);
    expect(parsed.sample.points.length).toBe(original.sample.points.length);
});

test("Test difficulty section", () => {
    const { difficulty: original } = originalBeatmap;
    const { difficulty: parsed } = parsedBeatmap;

    expect(parsed.ar).toBe(original.ar);
    expect(parsed.cs).toBe(original.cs);
    expect(parsed.hp).toBe(original.hp);
    expect(parsed.od).toBe(original.od);
    expect(parsed.sliderMultiplier).toBe(original.sliderMultiplier);
    expect(parsed.sliderTickRate).toBe(original.sliderTickRate);
});

test("Test editor section", () => {
    const { editor: original } = originalBeatmap;
    const { editor: parsed } = parsedBeatmap;

    expect(parsed.beatDivisor).toBe(original.beatDivisor);
    expect(parsed.bookmarks.length).toBe(original.bookmarks.length);
    expect(parsed.distanceSnap).toBe(original.distanceSnap);
    expect(parsed.gridSize).toBe(original.gridSize);
    expect(parsed.timelineZoom).toBeCloseTo(original.timelineZoom);
});

test("Test events section", () => {
    const { events: original } = originalBeatmap;
    const { events: parsed } = parsedBeatmap;

    expect(parsed.background?.filename).toBe(original.background?.filename);
    expect(parsed.background?.offset).toEqual(original.background?.offset);
    expect(parsed.breaks.length).toBe(original.breaks.length);
    expect(parsed.video?.filename).toBe(original.video?.filename);
    expect(parsed.video?.offset).toEqual(original.video?.offset);
});

test("Test format version header", () => {
    expect(parsedBeatmap.formatVersion).toBe(originalBeatmap.formatVersion);
});

test("Test general section", () => {
    const { general: original } = originalBeatmap;
    const { general: parsed } = parsedBeatmap;

    expect(parsed.audioFilename).toBe(original.audioFilename);
    expect(parsed.audioLeadIn).toBe(original.audioLeadIn);
    expect(parsed.countdown).toBe(original.countdown);
    expect(parsed.countdownOffset).toBe(original.countdownOffset);
    expect(parsed.epilepsyWarning).toBe(original.epilepsyWarning);
    expect(parsed.letterBoxInBreaks).toBe(original.letterBoxInBreaks);
    expect(parsed.mode).toBe(original.mode);
    expect(parsed.overlayPosition).toBe(original.overlayPosition);
    expect(parsed.previewTime).toBe(original.previewTime);
    expect(parsed.sampleBank).toBe(original.sampleBank);
    expect(parsed.sampleVolume).toBe(original.sampleVolume);
    expect(parsed.samplesMatchPlaybackRate).toBe(
        original.samplesMatchPlaybackRate
    );
    expect(parsed.skinPreference).toBe(original.skinPreference);
    expect(parsed.stackLeniency).toBe(original.stackLeniency);
    expect(parsed.useSkinSprites).toBe(original.useSkinSprites);
    expect(parsed.widescreenStoryboard).toBe(original.widescreenStoryboard);
});

test("Test counters", () => {
    const { hitObjects: original } = originalBeatmap;
    const { hitObjects: parsed } = parsedBeatmap;

    expect(parsed.circles).toBe(original.circles);
    expect(parsed.objects.length).toBe(original.objects.length);
    expect(parsed.sliderEnds).toBe(original.sliderEnds);
    expect(parsed.sliderRepeatPoints).toBe(original.sliderRepeatPoints);
    expect(parsed.sliders).toBe(original.sliders);
    expect(parsed.spinners).toBe(original.spinners);
});

test("Test hit object samples", () => {
    const originalSlider = <Slider>originalBeatmap.hitObjects.objects[1];
    const parsedSlider = <Slider>parsedBeatmap.hitObjects.objects[1];

    const [originalFirstBank, originalSecondBank] = originalSlider.samples;
    const [parsedFirstBank, parsedSecondBank] = parsedSlider.samples;

    expect(parsedSlider.samples.length).toBe(originalSlider.samples.length);
    expect(parsedFirstBank.name).toBe(originalFirstBank.name);
    expect(parsedFirstBank.bank).toBe(originalFirstBank.bank);
    expect(parsedFirstBank.customSampleBank).toBe(
        originalFirstBank.customSampleBank
    );
    expect(parsedFirstBank.volume).toBe(originalFirstBank.volume);
    expect(parsedFirstBank.isLayered).toBe(originalFirstBank.isLayered);
    expect(parsedFirstBank.isCustom).toBe(originalFirstBank.isCustom);
    expect(parsedSecondBank.name).toBe(originalSecondBank.name);
    expect(parsedSecondBank.bank).toBe(originalSecondBank.bank);
    expect(parsedSecondBank.customSampleBank).toBe(
        originalSecondBank.customSampleBank
    );
    expect(parsedSecondBank.volume).toBe(originalSecondBank.volume);
    expect(parsedSecondBank.isLayered).toBe(originalSecondBank.isLayered);
    expect(parsedSecondBank.isCustom).toBe(originalSecondBank.isCustom);
});

test("Test hit object per-node samples", () => {
    const originalSlider = <Slider>originalBeatmap.hitObjects.objects[1];
    const parsedSlider = <Slider>parsedBeatmap.hitObjects.objects[1];

    expect(parsedSlider.nodeSamples.length).toBe(
        originalSlider.nodeSamples.length
    );

    for (let i = 0; i < parsedSlider.nodeSamples.length; ++i) {
        const [originalFirstSample, originalLastSample] =
            originalSlider.nodeSamples[i];
        const [parsedFirstSample, parsedLastSample] =
            parsedSlider.nodeSamples[i];

        expect(parsedFirstSample.name).toBe(originalFirstSample.name);
        expect(parsedFirstSample.bank).toBe(originalFirstSample.bank);
        expect(parsedFirstSample.customSampleBank).toBe(
            originalFirstSample.customSampleBank
        );
        expect(parsedFirstSample.volume).toBe(originalFirstSample.volume);
        expect(parsedFirstSample.isLayered).toBe(originalFirstSample.isLayered);
        expect(parsedFirstSample.isCustom).toBe(originalFirstSample.isCustom);

        expect(parsedLastSample.name).toBe(originalLastSample.name);
        expect(parsedLastSample.bank).toBe(originalLastSample.bank);
        expect(parsedLastSample.customSampleBank).toBe(
            originalLastSample.customSampleBank
        );
        expect(parsedLastSample.volume).toBe(originalLastSample.volume);
        expect(parsedLastSample.isLayered).toBe(originalLastSample.isLayered);
        expect(parsedLastSample.isCustom).toBe(originalLastSample.isCustom);
    }
});

test("Test max combo getter", () => {
    expect(parsedBeatmap.maxCombo).toBe(originalBeatmap.maxCombo);
});

test("Test metadata section", () => {
    const { metadata: original } = originalBeatmap;
    const { metadata: parsed } = parsedBeatmap;

    expect(parsed.artist).toBe(original.artist);
    expect(parsed.artistUnicode).toBe(original.artistUnicode);
    expect(parsed.beatmapId).toBe(original.beatmapId);
    expect(parsed.beatmapSetId).toBe(original.beatmapSetId);
    expect(parsed.creator).toBe(original.creator);
    expect(parsed.title).toBe(original.title);
    expect(parsed.titleUnicode).toBe(original.titleUnicode);
    expect(parsed.version).toBe(original.version);
    expect(parsed.source).toBe(original.source);
    expect(parsed.tags.length).toBe(original.tags.length);
});
