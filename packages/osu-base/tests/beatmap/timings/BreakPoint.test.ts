import { BreakPoint } from "../../../src";

test("Test time coverage", () => {
    const breakPoint = new BreakPoint({
        startTime: 1000,
        endTime: 3000,
    });

    expect(breakPoint.contains(2000)).toBe(true);
    expect(breakPoint.contains(500)).toBe(false);

    // Break point active time is not exactly at end time
    expect(breakPoint.contains(2750)).toBe(false);
});

test("Test string concatenation", () => {
    const breakPoint = new BreakPoint({
        startTime: 1000,
        endTime: 3000,
    });

    expect(breakPoint.toString()).toBe(
        "Start time: 1000, end time: 3000, duration: 2000"
    );
});
