import { DifficultyControlPoint } from "../../../src";

test("Test timing point redundancy", () => {
    const timingPoint = new DifficultyControlPoint({
        time: 1000,
        speedMultiplier: 1,
    });

    let otherTimingPoint = new DifficultyControlPoint({
        time: 1500,
        speedMultiplier: 1,
    });

    expect(timingPoint.isRedundant(otherTimingPoint)).toBe(true);

    otherTimingPoint = new DifficultyControlPoint({
        time: 1500,
        speedMultiplier: 1.25,
    });

    expect(timingPoint.isRedundant(otherTimingPoint)).toBe(false);
});

test("Test string concatenation", () => {
    const timingPoint = new DifficultyControlPoint({
        time: 1000,
        speedMultiplier: 1,
    });

    expect(timingPoint.toString()).toBe(
        "{ time: 1000, speed multiplier: 1.00 }"
    );
});