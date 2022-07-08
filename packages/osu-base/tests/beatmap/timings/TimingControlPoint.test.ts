import { TimingControlPoint } from "../../../src";

test("Test timing point redundancy", () => {
    const timingPoint = new TimingControlPoint({
        time: 1000,
        msPerBeat: 1000,
        timeSignature: 4,
    });

    expect(timingPoint.isRedundant()).toBe(false);
});

test("Test string concatenation", () => {
    const timingPoint = new TimingControlPoint({
        time: 1000,
        msPerBeat: 1000,
        timeSignature: 4,
    });

    expect(timingPoint.toString()).toBe(
        "{ time: 1000, ms_per_beat: 1000.00, timeSignature: 4 }"
    );
});