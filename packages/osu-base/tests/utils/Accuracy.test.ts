import { Accuracy } from "../../src";

describe("Test hit count estimation", () => {
    test("99.95%, 500 objects", () => {
        const accuracy = Accuracy.fromPercent(99.95, 500);

        expect(accuracy.n300).toBe(500);
        expect(accuracy.n100).toBe(0);
        expect(accuracy.n50).toBe(0);
        expect(accuracy.nmiss).toBe(0);
    });

    test("99.5%, 1000 objects", () => {
        const accuracy = Accuracy.fromPercent(99.5, 1000);

        expect(accuracy.n300).toBe(992);
        expect(accuracy.n100).toBe(8);
        expect(accuracy.n50).toBe(0);
        expect(accuracy.nmiss).toBe(0);
    });

    test("85%, 1500 objects", () => {
        const accuracy = Accuracy.fromPercent(85, 1500);

        expect(accuracy.n300).toBe(1162);
        expect(accuracy.n100).toBe(338);
        expect(accuracy.n50).toBe(0);
        expect(accuracy.nmiss).toBe(0);
    });

    test("60%, 2000 objects", () => {
        const accuracy = Accuracy.fromPercent(60, 2000);

        expect(accuracy.n300).toBe(800);
        expect(accuracy.n100).toBe(1200);
        expect(accuracy.n50).toBe(0);
        expect(accuracy.nmiss).toBe(0);
    });

    test("40%, 2500 objects", () => {
        const accuracy = Accuracy.fromPercent(40, 2500);

        expect(accuracy.n300).toBe(250);
        expect(accuracy.n100).toBe(2250);
        expect(accuracy.n50).toBe(0);
        expect(accuracy.nmiss).toBe(0);
    });

    test("20%, 2500 objects", () => {
        const accuracy = Accuracy.fromPercent(20, 2500);

        expect(accuracy.n300).toBe(0);
        expect(accuracy.n100).toBe(0);
        expect(accuracy.n50).toBe(2500);
        expect(accuracy.nmiss).toBe(0);
    });
});

describe("Test fromPercent nmiss handling", () => {
    test("nmiss exceeding nobjects is clamped instead of going negative", () => {
        const accuracy = Accuracy.fromPercent(50, 10, 20);

        expect(accuracy.n300).toBe(0);
        expect(accuracy.n100).toBe(0);
        expect(accuracy.n50).toBe(0);
        expect(accuracy.nmiss).toBe(10);
    });

    test("explicit nmiss is honored in the percent formula", () => {
        const accuracy = Accuracy.fromPercent(95, 1000, 10);

        expect(accuracy.n300).toBe(930);
        expect(accuracy.n100).toBe(60);
        expect(accuracy.n50).toBe(0);
        expect(accuracy.nmiss).toBe(10);
        expect(accuracy.value).toBeCloseTo(0.95, 4);
    });
});

describe("Test accuracy percentage", () => {
    test("Not specifying 300 and nobjects", () => {
        const accuracy = new Accuracy({ n100: 10, n50: 10 });

        expect(() => accuracy.value).toThrow();
    });

    test("1000 objects, 1x100", () => {
        const accuracy = Accuracy.fromHitCounts({ n100: 1 }, 1000);

        expect(accuracy.value).toBeCloseTo(0.9993, 4);
    });

    test("1500 objects, 10x100", () => {
        const accuracy = Accuracy.fromHitCounts({ n100: 10 }, 1500);

        expect(accuracy.value).toBeCloseTo(0.9956, 4);
    });

    test("2000 objects, 25x100", () => {
        const accuracy = Accuracy.fromHitCounts({ n100: 25 }, 2000);

        expect(accuracy.value).toBeCloseTo(0.9917, 4);
    });

    test("2500 objects, 30x50", () => {
        const accuracy = Accuracy.fromHitCounts({ n50: 30 }, 2500);

        expect(accuracy.value).toBeCloseTo(0.99);
    });

    test("2500 objects, 20x100, 15x50, 5 misses", () => {
        const accuracy = Accuracy.fromHitCounts(
            { n100: 20, n50: 15, nmiss: 5 },
            2500,
        );

        expect(accuracy.value).toBeCloseTo(0.9877, 4);
    });

    test("0 objects does not return NaN", () => {
        const accuracy = new Accuracy({
            n300: 0,
            n100: 0,
            n50: 0,
            nmiss: 0,
        });

        expect(accuracy.value).toBe(0);
    });
});

describe("Test isN300Resolved", () => {
    test("Not specified", () => {
        expect(new Accuracy({}).isN300Resolved).toBe(false);
        expect(new Accuracy({ n100: 5 }).isN300Resolved).toBe(false);
    });

    test("Explicitly specified as 0", () => {
        expect(new Accuracy({ n300: 0 }).isN300Resolved).toBe(true);
    });

    test("Derived from nobjects", () => {
        expect(Accuracy.fromHitCounts({ n100: 5 }, 10).isN300Resolved).toBe(
            true,
        );
    });
});

describe("Test zero values compute correctly", () => {
    test("percent: 0", () => {
        const accuracy = Accuracy.fromPercent(0, 100);

        expect(accuracy.n300).toBe(0);
        expect(accuracy.n100).toBe(0);
        expect(accuracy.n50).toBe(100);
        expect(accuracy.nmiss).toBe(0);
    });

    test("nobjects: 0 clamps all counts to zero", () => {
        const accuracy = Accuracy.fromHitCounts({ n100: 5 }, 0);

        expect(accuracy.n300).toBe(0);
        expect(accuracy.n100).toBe(0);
        expect(accuracy.n50).toBe(0);
        expect(accuracy.nmiss).toBe(0);
    });
});

describe("Test hit count assignments", () => {
    describe("nobjects more than hit count", () => {
        test("n300", () => {
            const accuracy = Accuracy.fromHitCounts(
                { n300: 10, n100: 10, n50: 5 },
                20,
            );

            expect(accuracy.n300).toBe(5);
        });

        test("n100", () => {
            const accuracy = Accuracy.fromHitCounts({ n100: 10, n50: 5 }, 10);

            expect(accuracy.n100).toBe(5);
        });

        test("n50", () => {
            const accuracy = Accuracy.fromHitCounts({ n50: 10 }, 5);

            expect(accuracy.n50).toBe(5);
        });

        test("nmiss", () => {
            const accuracy = Accuracy.fromHitCounts({ nmiss: 10 }, 5);

            expect(accuracy.nmiss).toBe(5);
        });
    });

    test("n300", () => {
        const accuracy = Accuracy.fromHitCounts({ n100: 10, n50: 5 }, 100);

        expect(accuracy.n300).toBe(85);
    });

    // The remainders need to be specified as there is no way to properly assign them.
    test("n100", () => {
        const accuracy = Accuracy.fromHitCounts({ n300: 85, n50: 5 }, 100);

        expect(accuracy.n100).toBe(0);
    });

    test("n50", () => {
        const accuracy = Accuracy.fromHitCounts({ n300: 85, n100: 10 }, 100);

        expect(accuracy.n50).toBe(0);
    });

    test("nmiss", () => {
        const accuracy = Accuracy.fromHitCounts(
            { n300: 80, n100: 10, n50: 5 },
            100,
        );

        expect(accuracy.nmiss).toBe(0);
    });
});
