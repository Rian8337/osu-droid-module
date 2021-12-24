import { Accuracy } from "../../src";

describe("Test hit count estimation", () => {
    test("99.95%, 500 objects", () => {
        const accuracy = new Accuracy({ percent: 99.95, nobjects: 500 });

        expect(accuracy.n300).toBe(500);
        expect(accuracy.n100).toBe(0);
        expect(accuracy.n50).toBe(0);
        expect(accuracy.nmiss).toBe(0);
    });

    test("99.5%, 1000 objects", () => {
        const accuracy = new Accuracy({ percent: 99.5, nobjects: 1000 });

        expect(accuracy.n300).toBe(992);
        expect(accuracy.n100).toBe(8);
        expect(accuracy.n50).toBe(0);
        expect(accuracy.nmiss).toBe(0);
    });

    test("85%, 1500 objects", () => {
        const accuracy = new Accuracy({ percent: 85, nobjects: 1500 });

        expect(accuracy.n300).toBe(1162);
        expect(accuracy.n100).toBe(338);
        expect(accuracy.n50).toBe(0);
        expect(accuracy.nmiss).toBe(0);
    });

    test("60%, 2000 objects", () => {
        const accuracy = new Accuracy({ percent: 60, nobjects: 2000 });

        expect(accuracy.n300).toBe(800);
        expect(accuracy.n100).toBe(1200);
        expect(accuracy.n50).toBe(0);
        expect(accuracy.nmiss).toBe(0);
    });

    test("40%, 2500 objects", () => {
        const accuracy = new Accuracy({ percent: 40, nobjects: 2500 });

        expect(accuracy.n300).toBe(250);
        expect(accuracy.n100).toBe(2250);
        expect(accuracy.n50).toBe(0);
        expect(accuracy.nmiss).toBe(0);
    });
});

describe("Test accuracy percentage", () => {
    test("1000 objects, 1x100", () => {
        const accuracy = new Accuracy({ n100: 1 });

        expect(accuracy.value(1000)).toBeCloseTo(0.9993, 4);
    });

    test("1500 objects, 10x100", () => {
        const accuracy = new Accuracy({ n100: 10 });

        expect(accuracy.value(1500)).toBeCloseTo(0.9956, 4);
    });

    test("2000 objects, 25x100", () => {
        const accuracy = new Accuracy({ n100: 25 });

        expect(accuracy.value(2000)).toBeCloseTo(0.9917, 4);
    });

    test("2500 objects, 30x50", () => {
        const accuracy = new Accuracy({ n50: 30 });

        expect(accuracy.value(2500)).toBeCloseTo(0.99);
    });

    test("2500 objects, 20x100, 15x50, 5 misses", () => {
        const accuracy = new Accuracy({ n100: 20, n50: 15, nmiss: 5 });

        expect(accuracy.value(2500)).toBeCloseTo(0.9877, 4);
    });
});
