import { Accuracy } from "../../src";

describe("Test hit count estimation", () => {
    test("Missing nobjects parameter", () => {
        expect(() => new Accuracy({ percent: 100 })).toThrow();
    });

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

    test("20%, 2500 objects", () => {
        const accuracy = new Accuracy({ percent: 20, nobjects: 2500 });

        expect(accuracy.n300).toBe(0);
        expect(accuracy.n100).toBe(0);
        expect(accuracy.n50).toBe(2500);
        expect(accuracy.nmiss).toBe(0);
    });
});

describe("Test accuracy percentage", () => {
    test("Not specifying 300 and nobjects", () => {
        const accuracy = new Accuracy({ n100: 10, n50: 10 });

        expect(() => accuracy.value()).toThrow();
    });

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

describe("Test hit count assignments", () => {
    describe("nobjects more than hit count", () => {
        test("n300", () => {
            const accuracy = new Accuracy({
                n300: 10,
                n100: 10,
                n50: 5,
                nobjects: 20,
            });

            expect(accuracy.n300).toBe(5);
        });

        test("n100", () => {
            const accuracy = new Accuracy({ n100: 10, n50: 5, nobjects: 10 });

            expect(accuracy.n100).toBe(5);
        });

        test("n50", () => {
            const accuracy = new Accuracy({ n50: 10, nobjects: 5 });

            expect(accuracy.n50).toBe(5);
        });

        test("nmiss", () => {
            const accuracy = new Accuracy({ nmiss: 10, nobjects: 5 });

            expect(accuracy.nmiss).toBe(5);
        });
    });

    test("n300", () => {
        const accuracy = new Accuracy({ n100: 10, n50: 5, nobjects: 100 });

        expect(accuracy.n300).toBe(85);
    });

    // The remainders need to be specified as there is no way to properly assign them.
    test("n100", () => {
        const accuracy = new Accuracy({ n300: 85, n50: 5, nobjects: 100 });

        expect(accuracy.n100).toBe(0);
    });

    test("n50", () => {
        const accuracy = new Accuracy({ n300: 85, n100: 10, nobjects: 100 });

        expect(accuracy.n50).toBe(0);
    });

    test("nmiss", () => {
        const accuracy = new Accuracy({
            n300: 80,
            n100: 10,
            n50: 5,
            nobjects: 100,
        });

        expect(accuracy.nmiss).toBe(0);
    });
});
