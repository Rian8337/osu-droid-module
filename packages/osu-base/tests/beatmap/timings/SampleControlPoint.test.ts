import { SampleBank, SampleControlPoint } from "../../../src";

test("Test timing point redundancy", () => {
    const timingPoint = new SampleControlPoint({
        time: 1000,
        sampleBank: SampleBank.normal,
        sampleVolume: 0,
        customSampleBank: 0,
    });

    let otherTimingPoint = new SampleControlPoint({
        time: 1500,
        sampleBank: SampleBank.normal,
        sampleVolume: 0,
        customSampleBank: 0,
    });

    expect(timingPoint.isRedundant(otherTimingPoint)).toBe(true);

    otherTimingPoint = new SampleControlPoint({
        time: 1500,
        sampleBank: SampleBank.drum,
        sampleVolume: 0,
        customSampleBank: 0,
    });

    expect(timingPoint.isRedundant(otherTimingPoint)).toBe(false);
});

test("Test string concatenation", () => {
    const timingPoint = new SampleControlPoint({
        time: 1000,
        sampleBank: SampleBank.normal,
        sampleVolume: 0,
        customSampleBank: 0,
    });

    expect(timingPoint.toString()).toBe(
        "{ time: 1000, sample bank: 1, sample volume: 0 }"
    );
});
