import { ErrorFunction } from "../../src";

test("Test error function", () => {
    expect(ErrorFunction.erf(Number.NaN)).toBeNaN();
    expect(ErrorFunction.erf(-1)).toBeCloseTo(-0.8427007929497149, 10);
    expect(ErrorFunction.erf(0)).toBe(0);
    expect(ErrorFunction.erf(1e-15)).toBeCloseTo(
        0.000000000000001128379167095513,
        10
    );
    expect(ErrorFunction.erf(0.1)).toBeCloseTo(0.1124629160182849, 10);
    expect(ErrorFunction.erf(0.2)).toBeCloseTo(0.2227025892104785, 10);
    expect(ErrorFunction.erf(0.3)).toBeCloseTo(0.3286267594591274, 10);
    expect(ErrorFunction.erf(0.4)).toBeCloseTo(0.4283923550466685, 10);
    expect(ErrorFunction.erf(0.5)).toBeCloseTo(0.5204998778130465, 10);
    expect(ErrorFunction.erf(1)).toBeCloseTo(0.8427007929497149, 10);
    expect(ErrorFunction.erf(1.5)).toBeCloseTo(0.966105146475311, 10);
    expect(ErrorFunction.erf(2)).toBeCloseTo(0.9953222650189527, 10);
    expect(ErrorFunction.erf(2.5)).toBeCloseTo(0.999593047982555, 10);
    expect(ErrorFunction.erf(3)).toBeCloseTo(0.9999779095030014, 10);
    expect(ErrorFunction.erf(4)).toBeCloseTo(0.9999999845827421, 10);
    expect(ErrorFunction.erf(5)).toBeCloseTo(0.9999999999984625, 10);
    expect(ErrorFunction.erf(6)).toBeCloseTo(0.9999999999999999, 10);
    expect(ErrorFunction.erf(Number.POSITIVE_INFINITY)).toBe(1);
    expect(ErrorFunction.erf(Number.NEGATIVE_INFINITY)).toBe(-1);
});

test("Test inverse error function", () => {
    expect(ErrorFunction.erfInv(Number.NaN)).toBeNaN();
    expect(ErrorFunction.erfInv(-0.8427007929497149)).toBeCloseTo(-1, 4);
    expect(ErrorFunction.erfInv(0)).toBe(0);
    expect(ErrorFunction.erfInv(0.0000000000000011283791670955127)).toBeCloseTo(
        1e-15,
        4
    );
    expect(ErrorFunction.erfInv(0.1124629160182849)).toBeCloseTo(0.1, 4);
    expect(ErrorFunction.erfInv(0.2227025892104785)).toBeCloseTo(0.2, 4);
    expect(ErrorFunction.erfInv(0.3286267594591274)).toBeCloseTo(0.3, 4);
    expect(ErrorFunction.erfInv(0.4283923550466685)).toBeCloseTo(0.4, 4);
    expect(ErrorFunction.erfInv(0.5204998778130465)).toBeCloseTo(0.5, 4);
    expect(ErrorFunction.erfInv(0.8427007929497149)).toBeCloseTo(1, 4);
    expect(ErrorFunction.erfInv(0.966105146475311)).toBeCloseTo(1.5, 4);
    expect(ErrorFunction.erfInv(0.9953222650189527)).toBeCloseTo(2, 4);
    expect(ErrorFunction.erfInv(0.999593047982555)).toBeCloseTo(2.5, 4);
    expect(ErrorFunction.erfInv(0.9999779095030014)).toBeCloseTo(3, 4);
    expect(ErrorFunction.erfInv(0.9999999845827421)).toBeCloseTo(4, 4);
    expect(ErrorFunction.erfInv(0.9999999999984625)).toBeCloseTo(5, 4);
    expect(ErrorFunction.erfInv(1)).toBe(Number.POSITIVE_INFINITY);
    expect(ErrorFunction.erfInv(-1)).toBe(Number.NEGATIVE_INFINITY);
});
