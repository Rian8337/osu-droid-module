import {
    Beatmap,
    BeatmapConverter,
    BeatmapConverterOptions,
    Circle,
    ModDifficultyAdjust,
    ModHardRock,
    ModHidden,
    ModReallyEasy,
    Modes,
    Vector2,
} from "../../src";

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
    object.applyDefaults(beatmap.controlPoints, beatmap.difficulty, Modes.osu);
    object.applySamples(beatmap.controlPoints);
}

test("Test beatmap conversion without options", () => {
    const converted = new BeatmapConverter(beatmap).convert();

    const [firstObject, secondObject, thirdObject] =
        converted.hitObjects.objects;

    expect(converted.formatVersion).toBe(14);
    expect(converted.hitObjects.objects.length).toBe(3);

    expect(firstObject.startTime).toBe(1000);
    expect(secondObject.startTime).toBe(2000);
    expect(thirdObject.startTime).toBe(3000);

    expect(firstObject.position).toEqual(new Vector2(256, 192));
    expect(secondObject.position).toEqual(new Vector2(320, 192));
    expect(thirdObject.position).toEqual(new Vector2(384, 192));
});

describe("Test beatmap conversion with options", () => {
    const getConvertedFirstObject = (options: BeatmapConverterOptions) => {
        const converted = new BeatmapConverter(beatmap).convert(options);

        return converted.hitObjects.objects[0];
    };

    test("osu!droid game mode", () => {
        const firstObject = getConvertedFirstObject({ mode: Modes.droid });

        expect(firstObject.scale).toBeCloseTo(0.8526588830433072);
        expect(firstObject.timePreempt).toBe(1200);
    });

    test("osu!standard game mode", () => {
        const firstObject = getConvertedFirstObject({ mode: Modes.osu });

        expect(firstObject.scale).toBeCloseTo(0.5);
        expect(firstObject.timePreempt).toBeCloseTo(1200);
    });

    test("osu!droid game mode, Hard Rock", () => {
        const firstObject = getConvertedFirstObject({
            mode: Modes.droid,
            mods: [new ModHardRock()],
        });

        expect(firstObject.scale).toBeCloseTo(0.769735845987075);
        expect(firstObject.timePreempt).toBeCloseTo(900);
    });

    test("Hidden", () => {
        const firstObject = getConvertedFirstObject({
            mods: [new ModHidden()],
        });

        expect(firstObject.timePreempt).toBeCloseTo(1200);
        expect(firstObject.timeFadeIn).toBeCloseTo(480);
    });

    test("Custom speed multiplier", () => {
        const firstObject = getConvertedFirstObject({
            customSpeedMultiplier: 2,
        });

        expect(firstObject.startTime).toBe(1000);
        expect(firstObject.timePreempt).toBeCloseTo(1200);
    });

    test("Custom speed multiplier, Really Easy", () => {
        const firstObject = getConvertedFirstObject({
            mods: [new ModReallyEasy()],
            customSpeedMultiplier: 1.25,
        });

        expect(firstObject.startTime).toBe(1000);
        expect(firstObject.scale).toBeCloseTo(0.675);
        expect(firstObject.timePreempt).toBeCloseTo(1500);
    });

    test("Custom speed multiplier, Really Easy, Difficulty Adjust (no override)", () => {
        const firstObject = getConvertedFirstObject({
            mods: [new ModReallyEasy(), new ModDifficultyAdjust()],
            customSpeedMultiplier: 1.25,
        });

        expect(firstObject.startTime).toBe(1000);
        expect(firstObject.scale).toBeCloseTo(0.675);
        expect(firstObject.timePreempt).toBeCloseTo(1500);
    });

    test("Custom speed multiplier, Really Easy, Difficulty Adjust (CS override), Hard Rock", () => {
        const firstObject = getConvertedFirstObject({
            mods: [
                new ModReallyEasy(),
                new ModDifficultyAdjust({ cs: 4 }),
                new ModHardRock(),
            ],
            customSpeedMultiplier: 1.25,
        });

        expect(firstObject.startTime).toBe(1000);
        expect(firstObject.scale).toBeCloseTo(0.486);
        expect(firstObject.timePreempt).toBeCloseTo(1380);
    });
});
