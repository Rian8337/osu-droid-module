import {
    Anchor,
    Beatmap,
    BeatmapCountdown,
    BeatmapDecoder,
    BeatmapOverlayPosition,
    Circle,
    EditorGridSize,
    GameMode,
    RGBColor,
    SampleBank,
    Slider,
    StoryboardLayerType,
    StoryboardSprite,
    Vector2,
} from "../../src";
import { readFile } from "fs/promises";
import { join } from "path";

let v3Beatmap = new Beatmap();
let v14Beatmap = new Beatmap();
let beatmapWithStoryboard = new Beatmap();
let nanBeatmap = new Beatmap();

beforeAll(async () => {
    const v3Data = await readFile(
        join(
            process.cwd(),
            "tests",
            "files",
            "beatmaps",
            "Kenji Ninuma - DISCOPRINCE (peppy) [Normal].osu"
        ),
        { encoding: "utf-8" }
    );

    const v14Data = await readFile(
        join(
            process.cwd(),
            "tests",
            "files",
            "beatmaps",
            "YOASOBI - Love Letter (ohm002) [Please accept my overflowing emotions.].osu"
        ),
        { encoding: "utf-8" }
    );

    const beatmapWithStoryboardData = await readFile(
        join(
            process.cwd(),
            "tests",
            "files",
            "beatmaps",
            "Himeringo - Yotsuya-san ni Yoroshiku (RLC) [Winber1's Extreme].osu"
        ),
        { encoding: "utf-8" }
    );

    const nanBeatmapData = await readFile(
        join(
            process.cwd(),
            "tests",
            "files",
            "beatmaps",
            "nan-control-points.osu"
        ),
        { encoding: "utf-8" }
    );

    v3Beatmap = new BeatmapDecoder().decode(v3Data, [], false).result;
    v14Beatmap = new BeatmapDecoder().decode(v14Data, [], false).result;
    beatmapWithStoryboard = new BeatmapDecoder().decode(
        beatmapWithStoryboardData
    ).result;
    nanBeatmap = new BeatmapDecoder().decode(nanBeatmapData).result;
});

describe("Test colors section", () => {
    test("v3 file format", () => {
        const { colors } = v3Beatmap;

        expect(colors.combo.length).toBe(0);
    });

    test("v14 file format", () => {
        const { colors } = v14Beatmap;

        expect(colors.combo.length).toBe(4);
        expect(colors.combo[0]).toEqual(new RGBColor(98, 243, 255));
        expect(colors.combo[1]).toEqual(new RGBColor(251, 170, 251));
        expect(colors.combo[2]).toEqual(new RGBColor(102, 171, 255));
        expect(colors.combo[3]).toEqual(new RGBColor(162, 205, 232));
        expect(colors.sliderBorder).toBeUndefined();
        expect(colors.sliderTrackOverride).toBeUndefined();
    });
});

describe("Test control points section", () => {
    test("v3 file format", () => {
        const { controlPoints } = v3Beatmap;

        expect(controlPoints.difficulty.points.length).toBe(0);
        expect(controlPoints.effect.points.length).toBe(0);
        expect(controlPoints.sample.points.length).toBe(0);
        expect(controlPoints.timing.points.length).toBe(1);
    });

    test("v14 file format", () => {
        const { controlPoints } = v14Beatmap;

        expect(controlPoints.difficulty.points.length).toBe(14);
        expect(controlPoints.effect.points.length).toBe(14);
        expect(controlPoints.sample.points.length).toBe(526);
        expect(controlPoints.timing.points.length).toBe(5);
    });
});

describe("Test difficulty section", () => {
    test("v13 file format", () => {
        const { difficulty } = v3Beatmap;

        expect(difficulty.ar).toBe(6);
        expect(difficulty.cs).toBe(4);
        expect(difficulty.hp).toBe(6);
        expect(difficulty.od).toBe(6);
        expect(difficulty.sliderMultiplier).toBe(1.4);
        expect(difficulty.sliderTickRate).toBe(2);
    });

    test("v14 file format", () => {
        const { difficulty } = v14Beatmap;

        expect(difficulty.ar).toBe(9);
        expect(difficulty.cs).toBe(4);
        expect(difficulty.hp).toBe(5);
        expect(difficulty.od).toBe(8);
        expect(difficulty.sliderMultiplier).toBe(1.9);
        expect(difficulty.sliderTickRate).toBe(1);
    });
});

describe("Test editor section", () => {
    test("v3 file format", () => {
        const { editor } = v3Beatmap;

        expect(editor.beatDivisor).toBe(4);
        expect(editor.bookmarks.length).toBe(0);
        expect(editor.distanceSnap).toBe(1);
        expect(editor.gridSize).toBe(EditorGridSize.small);
        expect(editor.timelineZoom).toBe(1);
    });

    test("v14 file format", () => {
        const { editor } = v14Beatmap;

        expect(editor.beatDivisor).toBe(4);
        expect(editor.bookmarks.length).toBe(0);
        expect(editor.distanceSnap).toBe(0.2);
        expect(editor.gridSize).toBe(EditorGridSize.small);
        expect(editor.timelineZoom).toBeCloseTo(3);
    });
});

describe("Test events section", () => {
    test("v3 file format", () => {
        const { events } = v3Beatmap;

        expect(events.background?.filename).toBe("katamari2.jpg");
        expect(events.background?.offset).toEqual(new Vector2(0, 0));
        expect(events.breaks.length).toBe(3);
        expect(events.video).toBeUndefined();
        expect(events.storyboardReplacesBackground).toBe(false);
    });

    test("v14 file format", () => {
        const { events } = v14Beatmap;

        expect(events.background?.filename).toBe("school.jpg");
        expect(events.background?.offset).toEqual(new Vector2(0, 0));
        expect(events.breaks.length).toBe(0);
        expect(events.video?.filename).toBe("Yoasobi.mp4");
        expect(events.video?.offset).toEqual(new Vector2(0, 0));
        expect(events.storyboardReplacesBackground).toBe(false);
    });
});

describe("Test format version header", () => {
    test("v3 file format", () => {
        expect(v3Beatmap.formatVersion).toBe(3);
    });

    test("v14 file format", () => {
        expect(v14Beatmap.formatVersion).toBe(14);
    });
});

describe("Test general section", () => {
    test("v3 file format", () => {
        const { general } = v3Beatmap;

        expect(general.audioFilename).toBe("20.mp3");
        expect(general.audioLeadIn).toBe(0);
        expect(general.countdown).toBe(BeatmapCountdown.normal);
        expect(general.countdownOffset).toBe(0);
        expect(general.epilepsyWarning).toBe(false);
        expect(general.letterBoxInBreaks).toBe(false);
        expect(general.mode).toBe(GameMode.osu);
        expect(general.overlayPosition).toBe(BeatmapOverlayPosition.noChange);
        expect(general.previewTime).toBe(-1);
        expect(general.sampleBank).toBe(SampleBank.normal);
        expect(general.sampleVolume).toBe(100);
        expect(general.samplesMatchPlaybackRate).toBe(true);
        expect(general.skinPreference).toBe("");
        expect(general.stackLeniency).toBe(0.7);
        expect(general.useSkinSprites).toBe(false);
        expect(general.widescreenStoryboard).toBe(false);
    });

    test("v14 file format", () => {
        const { general } = v14Beatmap;

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
});

describe("Test hitobject counters", () => {
    test("v3 file format", () => {
        const { hitObjects } = v3Beatmap;

        expect(hitObjects.circles).toBe(160);
        expect(hitObjects.objects.length).toBe(194);
        expect(hitObjects.sliderEnds).toBe(30);
        expect(hitObjects.sliderRepeatPoints).toBe(15);
        expect(hitObjects.sliders).toBe(30);
        expect(hitObjects.spinners).toBe(4);
    });

    test("v14 file format", () => {
        const { hitObjects } = v14Beatmap;

        expect(hitObjects.circles).toBe(198);
        expect(hitObjects.objects.length).toBe(592);
        expect(hitObjects.sliderEnds).toBe(393);
        expect(hitObjects.sliderRepeatPoints).toBe(27);
        expect(hitObjects.sliders).toBe(393);
        expect(hitObjects.spinners).toBe(1);
    });
});

describe("Test hit object samples", () => {
    test("v3 file format", () => {
        const circle = <Circle>v3Beatmap.hitObjects.objects[0];

        const [firstSample, lastSample] = circle.samples;

        expect(circle.samples.length).toBe(2);
        expect(firstSample.name).toBe("hitnormal");
        expect(firstSample.bank).toBe(SampleBank.none);
        expect(firstSample.customSampleBank).toBe(0);
        expect(firstSample.volume).toBe(0);
        expect(firstSample.isLayered).toBe(true);
        expect(lastSample.name).toBe("hitfinish");
        expect(lastSample.bank).toBe(SampleBank.none);
        expect(lastSample.customSampleBank).toBe(0);
        expect(lastSample.volume).toBe(0);
        expect(lastSample.isLayered).toBe(false);
    });

    test("v14 file format", () => {
        const slider = <Slider>v14Beatmap.hitObjects.objects[1];

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
});

describe("Test hit object per-node samples", () => {
    test("v3 file format", () => {
        const slider = <Slider>v3Beatmap.hitObjects.objects[19];

        for (const nodeSample of slider.nodeSamples) {
            const [firstSample] = nodeSample;

            expect(firstSample.name).toBe("hitnormal");
            expect(firstSample.bank).toBe(SampleBank.none);
            expect(firstSample.customSampleBank).toBe(0);
            expect(firstSample.volume).toBe(0);
            expect(firstSample.isLayered).toBe(false);
            expect(firstSample.isCustom).toBe(false);
        }
    });

    test("v14 file format", () => {
        const slider = <Slider>v14Beatmap.hitObjects.objects[1];

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
});

describe("Test max combo getter", () => {
    test("v3 file format", () => {
        expect(v3Beatmap.maxCombo).toBe(314);
    });

    test("v14 file format", () => {
        expect(v14Beatmap.maxCombo).toBe(1033);
    });
});

describe("Test metadata section", () => {
    test("v3 file format", () => {
        const { metadata } = v3Beatmap;

        expect(metadata.artist).toBe("Kenji Ninuma");
        expect(metadata.artistUnicode).toBe("");
        expect(metadata.beatmapId).toBeUndefined();
        expect(metadata.beatmapSetId).toBeUndefined();
        expect(metadata.creator).toBe("peppy");
        expect(metadata.title).toBe("DISCO★PRINCE");
        expect(metadata.titleUnicode).toBe("");
        expect(metadata.version).toBe("Normal");
        expect(metadata.source).toBe("");
        expect(metadata.tags.length).toBe(0);
    });

    test("v14 file format", () => {
        const { metadata } = v14Beatmap;

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
});

test("Test storyboard decoding", () => {
    expect(beatmapWithStoryboard.events.storyboard).toBeDefined();
    expect(beatmapWithStoryboard.events.storyboardReplacesBackground).toBe(
        false
    );

    // Add an arbitrary background for testing.
    beatmapWithStoryboard.events
        .storyboard!.getLayer(StoryboardLayerType.background)
        .elements.push(
            new StoryboardSprite(
                beatmapWithStoryboard.events.background!.filename,
                Anchor.bottomCenter,
                new Vector2(0, 0)
            )
        );

    expect(beatmapWithStoryboard.events.storyboardReplacesBackground).toBe(
        true
    );
});

test("Test NaN control points", () => {
    expect(nanBeatmap.controlPoints.timing.points.length).toBe(1);
    expect(nanBeatmap.controlPoints.difficulty.points.length).toBe(2);

    expect(nanBeatmap.controlPoints.timing.controlPointAt(1000).msPerBeat).toBe(
        500
    );

    expect(
        nanBeatmap.controlPoints.difficulty.controlPointAt(2000).speedMultiplier
    ).toBe(1);
    expect(
        nanBeatmap.controlPoints.difficulty.controlPointAt(3000).speedMultiplier
    ).toBe(1);

    expect(
        nanBeatmap.controlPoints.difficulty.controlPointAt(2000).generateTicks
    ).toBe(false);
    expect(
        nanBeatmap.controlPoints.difficulty.controlPointAt(3000).generateTicks
    ).toBe(true);
});
