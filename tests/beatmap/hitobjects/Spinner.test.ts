import { objectTypes, Spinner, Vector2 } from "../../../src";

const createSpinner = (duration: number = 100) => {
    return new Spinner({
        startTime: 1000,
        type: objectTypes.spinner,
        duration: duration,
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

    test("Spinner stacked position without height", () => {
        const spinner = createSpinner();

        expect(spinner.stackedPosition).toEqual(playfieldCenter);
    });

    test("Spinner stacked end position without height", () => {
        const spinner = createSpinner();

        expect(spinner.stackedEndPosition).toEqual(playfieldCenter);
    });

    test("Spinner stacked position with height", () => {
        const spinner = createSpinner();

        spinner.stackHeight = 1;

        expect(spinner.stackedPosition).toEqual(playfieldCenter);

        spinner.stackHeight = 2;

        expect(spinner.stackedPosition).toEqual(playfieldCenter);

        spinner.stackHeight = 4;

        expect(spinner.stackedPosition).toEqual(playfieldCenter);
    });

    test("Spinner stacked end position with height", () => {
        const spinner = createSpinner();

        spinner.stackHeight = 1;

        expect(spinner.stackedEndPosition).toEqual(playfieldCenter);

        spinner.stackHeight = 2;

        expect(spinner.stackedEndPosition).toEqual(playfieldCenter);

        spinner.stackHeight = 4;

        expect(spinner.stackedEndPosition).toEqual(playfieldCenter);
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

    expect(spinner.isNewCombo).toBe(true);
});
