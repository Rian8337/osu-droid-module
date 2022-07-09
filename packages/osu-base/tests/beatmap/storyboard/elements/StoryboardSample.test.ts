import { StoryboardSample } from "../../../../src";

test("Test sample duration and end time", () => {
    const sample = new StoryboardSample("path", 1000, 100);

    expect(sample.startTime).toBe(1000);
    expect(sample.endTime).toBe(1000);
    expect(sample.duration).toBe(0);
});
