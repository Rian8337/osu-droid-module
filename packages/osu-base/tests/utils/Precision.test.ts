import { Precision, Vector2 } from "../../src";

test("Test number precision", () => {
    expect(Precision.almostEquals(1, 2)).toBe(false);
    expect(Precision.almostEquals(1, 1.01)).toBe(false);
    expect(Precision.almostEquals(1, 1.001)).toBe(true);
    expect(Precision.almostEquals(1, 1.001, 1e-4)).toBe(false);
});

test("Test vector precision", () => {
    expect(Precision.almostEquals(new Vector2(0, 0), new Vector2(1, 1))).toBe(
        false,
    );

    expect(
        Precision.almostEquals(new Vector2(0, 0), new Vector2(0.01, 0.01)),
    ).toBe(false);

    expect(
        Precision.almostEquals(new Vector2(0, 0), new Vector2(0.001, 0.001)),
    ).toBe(true);

    expect(
        Precision.almostEquals(
            new Vector2(0, 0),
            new Vector2(0.001, 0.001),
            1e-4,
        ),
    ).toBe(false);
});

describe("Test almost equal relative", () => {
    const doublePrecision = Math.pow(2, -53);

    test("Compare zero and negative zero", () => {
        expect(Precision.almostEqualRelative(-0, 1e-5)).toBe(false);
        expect(Precision.almostEqualRelative(-0, 1e-15)).toBe(true);
    });

    test("Compare two nearby numbers", () => {
        expect(
            Precision.almostEqualRelative(1, 1 + 3 * doublePrecision, 1e-15),
        ).toBe(true);
        expect(
            Precision.almostEqualRelative(1, 1 + doublePrecision, 1e-15),
        ).toBe(true);
        expect(Precision.almostEqualRelative(1, 1 + 1e-16, 1e-15)).toBe(true);
        expect(Precision.almostEqualRelative(1, 1 + 1e-15, 1e-15)).toBe(false);
        expect(Precision.almostEqualRelative(1, 1 + 1e-14, 1e-15)).toBe(false);
    });

    test("Compare with the two numbers reversed in compare order", () => {
        expect(
            Precision.almostEqualRelative(1 + 3 * doublePrecision, 1, 1e-15),
        ).toBe(true);
        expect(
            Precision.almostEqualRelative(1 + doublePrecision, 1, 1e-15),
        ).toBe(true);
        expect(Precision.almostEqualRelative(1 + 1e-16, 1, 1e-15)).toBe(true);
        expect(Precision.almostEqualRelative(1 + 1e-15, 1, 1e-15)).toBe(false);
        expect(Precision.almostEqualRelative(1 + 1e-14, 1, 1e-15)).toBe(false);
    });

    test("Compare different numbers", () => {
        expect(Precision.almostEqualRelative(2, 1, 1e-15)).toBe(false);
        expect(Precision.almostEqualRelative(1, 2, 1e-15)).toBe(false);
    });

    test("Compare different numbers with large tolerance", () => {
        expect(Precision.almostEqualRelative(2, 1, 1e-5)).toBe(false);
        expect(Precision.almostEqualRelative(1, 2, 1e-5)).toBe(false);
        expect(Precision.almostEqualRelative(2, 1, 1e1)).toBe(true);
        expect(Precision.almostEqualRelative(1, 2, 1e1)).toBe(true);
    });

    test("Compare infinity and infinity", () => {
        expect(
            Precision.almostEqualRelative(
                Number.POSITIVE_INFINITY,
                Number.POSITIVE_INFINITY,
                1e-15,
            ),
        ).toBe(true);
        expect(
            Precision.almostEqualRelative(
                Number.NEGATIVE_INFINITY,
                Number.NEGATIVE_INFINITY,
                1e-15,
            ),
        ).toBe(true);
    });

    test("Compare -infinity and infinity", () => {
        expect(
            Precision.almostEqualRelative(
                Number.POSITIVE_INFINITY,
                Number.NEGATIVE_INFINITY,
                1e-15,
            ),
        ).toBe(false);
        expect(
            Precision.almostEqualRelative(
                Number.NEGATIVE_INFINITY,
                Number.POSITIVE_INFINITY,
                1e-15,
            ),
        ).toBe(false);
    });

    test("Compare infinity and non-infinity", () => {
        expect(
            Precision.almostEqualRelative(Number.POSITIVE_INFINITY, 1, 1e-15),
        ).toBe(false);
        expect(
            Precision.almostEqualRelative(1, Number.POSITIVE_INFINITY, 1e-15),
        ).toBe(false);
        expect(
            Precision.almostEqualRelative(Number.NEGATIVE_INFINITY, 1, 1e-15),
        ).toBe(false);
        expect(
            Precision.almostEqualRelative(1, Number.NEGATIVE_INFINITY, 1e-15),
        ).toBe(false);
    });

    test("Compare tiny numbers with opposite signs", () => {
        expect(Precision.almostEqualRelative(1e-12, -1e-12, 1e-14)).toBe(false);
        expect(Precision.almostEqualRelative(-1e-12, 1e-12, 1e-14)).toBe(false);

        expect(Precision.almostEqualRelative(-2, 2, 1e-14)).toBe(false);
        expect(Precision.almostEqualRelative(2, -2, 1e-14)).toBe(false);
    });
});
