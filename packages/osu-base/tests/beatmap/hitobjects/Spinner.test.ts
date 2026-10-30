import { BeatmapControlPoints, BeatmapDifficulty, Modes, ObjectTypes, Spinner, Vector2 } from "../../../src";

const createSpinner = (duration = 100) => {
    return new Spinner({
        startTime: 1000,
        type: ObjectTypes.Spinner,
        endTime: 1000 + duration,
    });
};

describe("Test spinner position", () => {
    const playfieldCenter = new Vector2(256, 192);

    test("Spinner position", () => {
        const spinner = createSpinner();

        expect(spinner.position).toEqual(playfieldCenter);
    });

    test("Spinner end position", () => {
        const spinner = createSpinner();

        expect(spinner.endPosition).toEqual(playfieldCenter);
    });

    describe("Spinner stacked position", () => {
        test("Without height", () => {
            const spinner = createSpinner();

            expect(spinner.stackedPosition).toEqual(playfieldCenter);
        });

        test("With height", () => {
            const spinner = createSpinner();

            spinner.stackHeight = 1;
            expect(spinner.stackedPosition).toEqual(playfieldCenter);

            spinner.stackHeight = 2;
            expect(spinner.stackedPosition).toEqual(playfieldCenter);

            spinner.stackHeight = 4;
            expect(spinner.stackedPosition).toEqual(playfieldCenter);
        });
    });

    describe("Spinner stacked end position", () => {
        test("Without height", () => {
            const spinner = createSpinner();

            expect(spinner.stackedEndPosition).toEqual(playfieldCenter);
        });

        test("With height", () => {
            const spinner = createSpinner();

            spinner.stackHeight = 1;
            expect(spinner.stackedEndPosition).toEqual(playfieldCenter);

            spinner.stackHeight = 2;
            expect(spinner.stackedEndPosition).toEqual(playfieldCenter);

            spinner.stackHeight = 4;
            expect(spinner.stackedEndPosition).toEqual(playfieldCenter);
        });
    });
});

test("Test duration", () => {
    let spinner = createSpinner(100);

    expect(spinner.duration).toBe(100);

    spinner = createSpinner(250);

    expect(spinner.duration).toBe(250);

    spinner = createSpinner(500);

    expect(spinner.duration).toBe(500);
});

test("Test end time", () => {
    let spinner = createSpinner(100);

    expect(spinner.endTime).toBe(spinner.startTime + 100);

    spinner = createSpinner(250);

    expect(spinner.endTime).toBe(spinner.startTime + 250);

    spinner = createSpinner(500);

    expect(spinner.endTime).toBe(spinner.startTime + 500);
});

test("Test new combo", () => {
    const spinner = createSpinner();

    expect(spinner.isNewCombo).toBe(false);
});

describe("Test required spins", () => {
    const difficulty = new BeatmapDifficulty();
    difficulty.od = 5;

    describe("osu!droid gamemode", () => {
        const spinsRequired = (duration: number, od: number) => {
            const spinner = createSpinner(duration);
            const droidDifficulty = new BeatmapDifficulty();
            droidDifficulty.od = od;

            spinner.applyDefaults(new BeatmapControlPoints(), droidDifficulty, Modes.Droid);

            return spinner.spinsRequired;
        };

        test("Requires 2 + OD / 5 rotations per second", () => {
            expect(spinsRequired(2000, 5)).toBe(6);
            expect(spinsRequired(950, 5)).toBeCloseTo(2.85, 5);
        });

        test("Uses single-precision arithmetic like the game", () => {
            // In double precision, this is slightly above 7.
            expect((2 + (2 * 1.2) / 10) * 3.125).toBeGreaterThan(7);
            expect(spinsRequired(3125, 1.2)).toBe(7);

            // In double precision, this is exactly 15.
            expect((2 + (2 * 2) / 10) * 6.25).toBe(15);
            expect(spinsRequired(6250, 2)).toBeGreaterThan(15);
        });

        test("Requires 0.1 rotations for spinners shorter than 50ms", () => {
            expect(spinsRequired(49, 10)).toBe(Math.fround(0.1));
            expect(spinsRequired(0, 5)).toBe(Math.fround(0.1));
            expect(spinsRequired(50, 5)).toBe(Math.fround(Math.fround(3) * Math.fround(0.05)));
        });
    });

    test("osu!standard gamemode", () => {
        const spinner = createSpinner(2000);

        spinner.applyDefaults(new BeatmapControlPoints(), difficulty, Modes.Osu);

        expect(spinner.spinsRequired).toBeGreaterThan(1);
    });
});

test("Test type string", () => {
    const spinner = createSpinner();

    expect(spinner.typeStr).toBe("spinner");
});

test("Test string concatenation", () => {
    const spinner = createSpinner();

    expect(spinner.toString()).toBe("Position: [256, 192], duration: 100");
});
