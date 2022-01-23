import { Precision, Vector2 } from "../../src";

test("Test number precision", () => {
    expect(Precision.almostEqualsNumber(1, 2)).toBe(false);
    expect(Precision.almostEqualsNumber(1, 1.01)).toBe(false);
    expect(Precision.almostEqualsNumber(1, 1.001)).toBe(true);
    expect(Precision.almostEqualsNumber(1, 1.001, 1e-4)).toBe(false);
});

test("Test vector precision", () => {
    expect(
        Precision.almostEqualsVector(new Vector2(0, 0), new Vector2(1, 1))
    ).toBe(false);

    expect(
        Precision.almostEqualsVector(new Vector2(0, 0), new Vector2(0.01, 0.01))
    ).toBe(false);

    expect(
        Precision.almostEqualsVector(
            new Vector2(0, 0),
            new Vector2(0.001, 0.001)
        )
    ).toBe(true);

    expect(
        Precision.almostEqualsVector(
            new Vector2(0, 0),
            new Vector2(0.001, 0.001),
            1e-4
        )
    ).toBe(false);
});
