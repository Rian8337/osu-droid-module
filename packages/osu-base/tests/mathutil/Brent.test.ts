import { Brent, Polynomial } from "../../src";

test("Test multiple roots", () => {
    // Roots at -2, 2
    const f1 = (x: number) => Math.pow(x, 2) - 4;

    expect(
        f1(Brent.findRoot(f1, { lowerBound: 1, upperBound: 5 }, 1e-14, 100))
    ).toBe(0);
    expect(
        f1(
            Brent.findRootExpand(
                f1,
                { lowerBound: 3, upperBound: 5 },
                1e-14,
                100
            )
        )
    ).toBe(0);
    expect(
        Brent.findRoot(f1, { lowerBound: -5, upperBound: -1 }, 1e-14, 100)
    ).toBe(-2);
    expect(
        Brent.findRoot(f1, { lowerBound: 1, upperBound: 4 }, 1e-14, 100)
    ).toBe(2);
    expect(
        f1(
            Brent.findRoot(
                (x) => -f1(x),
                { lowerBound: 1, upperBound: 5 },
                1e-14,
                100
            )
        )
    ).toBe(0);
    expect(
        Brent.findRoot(
            (x) => -f1(x),
            { lowerBound: -5, upperBound: -1 },
            1e-14,
            100
        )
    ).toBe(-2);
    expect(
        Brent.findRoot(
            (x) => -f1(x),
            { lowerBound: 1, upperBound: 4 },
            1e-14,
            100
        )
    ).toBe(2);

    // Roots at 3, 4
    const f2 = (x: number) => (x - 3) * (x - 4);

    expect(
        f2(Brent.findRoot(f2, { lowerBound: -5, upperBound: 3.5 }, 1e-14, 100))
    ).toBe(-0);
    expect(
        Brent.findRoot(f2, { lowerBound: -5, upperBound: 3.5 }, 1e-14, 100)
    ).toBe(3);
    expect(
        Brent.findRoot(f2, { lowerBound: 3.2, upperBound: 5 }, 1e-14, 100)
    ).toBe(4);
    expect(
        Brent.findRoot(f2, { lowerBound: 2.1, upperBound: 3.9 }, 0.001, 50)
    ).toBeCloseTo(3, 3);
    expect(
        Brent.findRoot(f2, { lowerBound: 2.1, upperBound: 3.4 }, 0.001, 50)
    ).toBeCloseTo(3, 3);
});

test("Test local minima", () => {
    const f = (x: number) => Math.pow(x, 3) - 2 * x + 2;

    expect(
        f(Brent.findRoot(f, { lowerBound: -5, upperBound: 5 }, 1e-14, 100))
    ).toBeCloseTo(0, 14);
    expect(
        f(Brent.findRoot(f, { lowerBound: -2, upperBound: 4 }, 1e-14, 100))
    ).toBeCloseTo(0, 14);
});

test("Test cubic", () => {
    // With complex roots (looking for the real root only): 3x^3 + 4x^2 + 5x + 6
    const f1 = (x: number) => Polynomial.evaluate(x, [6, 5, 4, 3]);
    expect(
        Brent.findRoot(f1, { lowerBound: -2, upperBound: -1 }, 1e-8, 100)
    ).toBeCloseTo(-1.265328088928, 6);

    // Real roots only: 2x^3 + 4x^2 - 50x + 6
    const f2 = (x: number) => Polynomial.evaluate(x, [6, -50, 4, 2]);
    expect(
        Brent.findRoot(f2, { lowerBound: -6.5, upperBound: -5.5 }, 1e-8, 100)
    ).toBeCloseTo(-6.1466562197069, 6);
    expect(
        Brent.findRoot(f2, { lowerBound: -0.5, upperBound: 0.5 }, 1e-8, 100)
    ).toBeCloseTo(0.12124737195841, 6);
    expect(
        Brent.findRoot(f2, { lowerBound: 3.5, upperBound: 4.5 }, 1e-8, 100)
    ).toBeCloseTo(4.0254088477485, 6);
});

test("Test no root", () => {
    const f = (x: number) => Math.pow(x, 2) + 4;

    expect(() =>
        Brent.findRoot(f, { lowerBound: -5, upperBound: 5 }, 1e-14, 50)
    ).toThrow();
});
