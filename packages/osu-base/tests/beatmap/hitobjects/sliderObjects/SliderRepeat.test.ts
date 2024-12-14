import { SliderRepeat, Vector2 } from "../../../../src";

test("Test string concatenation", () => {
    const sliderRepeat = new SliderRepeat({
        sliderStartTime: 0,
        sliderSpanDuration: 1000,
        position: new Vector2(100, 100),
        startTime: 1000,
        spanIndex: 1,
        spanStartTime: 0,
    });

    expect(sliderRepeat.toString()).toBe(
        "Position: [100, 100], span index: 1, span start time: 0",
    );
});
