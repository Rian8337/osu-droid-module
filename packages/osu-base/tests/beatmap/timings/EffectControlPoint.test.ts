import { EffectControlPoint } from "../../../src";

test("Test timing point redundancy", () => {
    const timingPoint = new EffectControlPoint({
        time: 1000,
        isKiai: false,
        omitFirstBarLine: false,
    });

    let otherTimingPoint = new EffectControlPoint({
        time: 1500,
        isKiai: false,
        omitFirstBarLine: false,
    });

    expect(timingPoint.isRedundant(otherTimingPoint)).toBe(true);

    otherTimingPoint = new EffectControlPoint({
        time: 1500,
        isKiai: true,
        omitFirstBarLine: false,
    });

    expect(timingPoint.isRedundant(otherTimingPoint)).toBe(false);
});

test("Test string concatenation", () => {
    const timingPoint = new EffectControlPoint({
        time: 1000,
        isKiai: false,
        omitFirstBarLine: false,
    });

    expect(timingPoint.toString()).toBe("{ time: 1000, kiai: false }");
});
