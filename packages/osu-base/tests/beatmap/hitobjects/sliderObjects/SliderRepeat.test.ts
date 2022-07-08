import { SliderRepeat, Vector2 } from "../../../../src";

test("Test string concatenation", () => {
    const sliderRepeat = new SliderRepeat({
        position: new Vector2(100, 100),
        startTime: 1000,
        repeatIndex: 1,
        spanDuration: 100,
    });

    expect(sliderRepeat.toString()).toBe(
        "Position: [100, 100], repeat index: 1, span duration: 100"
    );
});
