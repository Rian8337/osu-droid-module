import { MathUtils } from "../../src";

test("Test rounding", () => {
    expect(MathUtils.round(5.12398123791, 1)).toBeCloseTo(5.1, 1);
    expect(MathUtils.round(5.12398123791, 2)).toBeCloseTo(5.12);
    expect(MathUtils.round(5.12398123791, 3)).toBeCloseTo(5.124, 3);
    expect(MathUtils.round(5.12398123791, 4)).toBeCloseTo(5.124, 4);
    expect(MathUtils.round(5.12398123791, 5)).toBeCloseTo(5.12398, 5);
});

test("Test clamping", () => {
    expect(MathUtils.clamp(5, 1, 10)).toBe(5);
    expect(MathUtils.clamp(1, 1, 10)).toBe(1);
    expect(MathUtils.clamp(15, 1, 10)).toBe(10);
    expect(MathUtils.clamp(-Infinity, 1, 10)).toBe(1);
    expect(MathUtils.clamp(Infinity, 1, 10)).toBe(10);
});

test("Test standard deviation", () => {
    expect(MathUtils.calculateStandardDeviation([])).toBe(0);
    expect(MathUtils.calculateStandardDeviation([1])).toBe(0);
    expect(MathUtils.calculateStandardDeviation([1, 5])).toBeCloseTo(2);
    expect(MathUtils.calculateStandardDeviation([1, 5, 9])).toBeCloseTo(3.27);
    expect(MathUtils.calculateStandardDeviation([1, 5, 9, 3, 12])).toBeCloseTo(
        4
    );
});
