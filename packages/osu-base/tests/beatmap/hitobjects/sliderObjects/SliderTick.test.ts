import { SliderTick, Vector2 } from "../../../../src";

test("Test string concatenation", () => {
    const sliderTick = new SliderTick({
        position: new Vector2(100, 100),
        startTime: 100,
        spanIndex: 1,
        spanStartTime: 50,
    });

    expect(sliderTick.toString()).toBe(
        "Position: [100, 100], span index: 1, span start time: 50"
    );
});
