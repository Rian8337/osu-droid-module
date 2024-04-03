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

test("Test degrees to radians conversion", () => {
    expect(MathUtils.degreesToRadians(0)).toBe(0);
    expect(MathUtils.degreesToRadians(30)).toBeCloseTo(Math.PI / 6);
    expect(MathUtils.degreesToRadians(45)).toBeCloseTo(Math.PI / 4);
    expect(MathUtils.degreesToRadians(60)).toBeCloseTo(Math.PI / 3);
    expect(MathUtils.degreesToRadians(90)).toBeCloseTo(Math.PI / 2);
    expect(MathUtils.degreesToRadians(120)).toBeCloseTo((2 * Math.PI) / 3);
    expect(MathUtils.degreesToRadians(135)).toBeCloseTo((3 * Math.PI) / 4);
    expect(MathUtils.degreesToRadians(150)).toBeCloseTo((5 * Math.PI) / 6);
    expect(MathUtils.degreesToRadians(180)).toBe(Math.PI);
});

test("Test radians to degrees conversion", () => {
    expect(MathUtils.radiansToDegrees(0)).toBe(0);
    expect(MathUtils.radiansToDegrees(Math.PI / 6)).toBeCloseTo(30);
    expect(MathUtils.radiansToDegrees(Math.PI / 4)).toBeCloseTo(45);
    expect(MathUtils.radiansToDegrees(Math.PI / 3)).toBeCloseTo(60);
    expect(MathUtils.radiansToDegrees(Math.PI / 2)).toBeCloseTo(90);
    expect(MathUtils.radiansToDegrees((2 * Math.PI) / 3)).toBeCloseTo(120);
    expect(MathUtils.radiansToDegrees((3 * Math.PI) / 4)).toBeCloseTo(135);
    expect(MathUtils.radiansToDegrees((5 * Math.PI) / 6)).toBeCloseTo(150);
    expect(MathUtils.radiansToDegrees(Math.PI)).toBe(180);
});
