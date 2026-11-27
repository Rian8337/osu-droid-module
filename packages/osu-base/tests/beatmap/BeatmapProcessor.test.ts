import {
    Beatmap,
    BeatmapDecoder,
    BeatmapProcessor,
    Circle,
    Modes,
    Vector2,
} from "../../src";

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
            Modes.Osu,
        );
    }

    new BeatmapProcessor(beatmap).postProcess();

    expect(beatmap.hitObjects.objects[0].stackHeight).toBe(1);
    expect(beatmap.hitObjects.objects[1].stackHeight).toBe(0);
});

describe("Test combo processing around spinners", () => {
    /**
     * A circle starting a combo, a circle, a spinner of the given type, and a circle.
     */
    const createBeatmapString = (spinnerType: number) =>
        [
            "osu file format v14",
            "",
            "[Difficulty]",
            "OverallDifficulty:5",
            "",
            "[TimingPoints]",
            "0,500,4,2,0,100,1,0",
            "",
            "[HitObjects]",
            "256,192,1000,5,0",
            "256,192,2000,1,0",
            `256,192,3000,${spinnerType.toString()},0,4000`,
            "256,192,5000,1,0",
        ].join("\n");

    // Spinner type with and without the new combo flag.
    const newComboSpinner = 12;
    const spinner = 8;

    const decode = (spinnerType: number, mode: Modes) =>
        new BeatmapDecoder().decode(createBeatmapString(spinnerType), mode)
            .result;

    test("osu!droid: a spinner with the new combo flag starts a new combo", () => {
        const { objects } = decode(newComboSpinner, Modes.Droid).hitObjects;

        expect(objects[1].isLastInCombo).toBe(true);
        expect(objects[2].isLastInCombo).toBe(true);
        expect(objects.map((o) => o.comboIndex)).toEqual([1, 1, 2, 3]);
    });

    test("osu!droid: a spinner without the new combo flag continues the combo", () => {
        const { objects } = decode(spinner, Modes.Droid).hitObjects;

        expect(objects[1].isLastInCombo).toBe(false);
        expect(objects[2].isLastInCombo).toBe(true);
        expect(objects.map((o) => o.comboIndex)).toEqual([1, 1, 1, 2]);
    });

    test("osu!standard: a spinner with the new combo flag continues the combo", () => {
        const { objects } = decode(newComboSpinner, Modes.Osu).hitObjects;

        expect(objects[1].isLastInCombo).toBe(false);
        expect(objects[2].isLastInCombo).toBe(true);
        expect(objects.map((o) => o.comboIndex)).toEqual([1, 1, 1, 2]);
    });

    test("osu!droid playable beatmap of an osu!standard beatmap uses osu!droid combos", () => {
        const { objects } = decode(
            newComboSpinner,
            Modes.Osu,
        ).createDroidPlayableBeatmap().hitObjects;

        expect(objects[1].isLastInCombo).toBe(true);
        expect(objects.map((o) => o.comboIndex)).toEqual([1, 1, 2, 3]);
    });

    test("osu!standard playable beatmap of an osu!droid beatmap uses osu!standard combos", () => {
        const { objects } = decode(
            newComboSpinner,
            Modes.Droid,
        ).createOsuPlayableBeatmap().hitObjects;

        expect(objects[1].isLastInCombo).toBe(false);
        expect(objects.map((o) => o.comboIndex)).toEqual([1, 1, 1, 2]);
    });
});
