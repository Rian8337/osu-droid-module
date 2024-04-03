import { NormalDistribution } from "../../src";

test("Test inverse cumulative distribution", () => {
    const mean = 5;
    const stdDev = 2;

    expect(NormalDistribution.invCDF(mean, stdDev, Number.NaN)).toBeNaN();
    expect(NormalDistribution.invCDF(mean, stdDev, 0)).toBe(
        Number.NEGATIVE_INFINITY
    );
    expect(
        NormalDistribution.invCDF(mean, stdDev, 0.000000286651571879193912)
    ).toBeCloseTo(-5, 14);
    expect(
        NormalDistribution.invCDF(mean, stdDev, 0.00023262907903552504)
    ).toBeCloseTo(-2, 14);
    expect(
        NormalDistribution.invCDF(mean, stdDev, 0.006209665325776135)
    ).toBeCloseTo(0, 14);
    expect(
        NormalDistribution.invCDF(mean, stdDev, 0.3085375387259869)
    ).toBeCloseTo(4, 14);
    expect(NormalDistribution.invCDF(mean, stdDev, 0.5)).toBeCloseTo(5, 14);
    expect(
        NormalDistribution.invCDF(mean, stdDev, 0.6914624612740131)
    ).toBeCloseTo(6, 14);
    expect(
        NormalDistribution.invCDF(mean, stdDev, 0.9937903346742238)
    ).toBeCloseTo(10, 14);
    expect(NormalDistribution.invCDF(mean, stdDev, 1)).toBe(
        Number.POSITIVE_INFINITY
    );
});
