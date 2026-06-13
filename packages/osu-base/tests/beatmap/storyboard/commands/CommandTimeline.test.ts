import {
    CommandTimeline,
    Easing,
    StoryboardCommandType,
} from "../../../../src";

test("Test start and end values", () => {
    const timeline = new CommandTimeline<number>(
        StoryboardCommandType.MovementX,
    );

    expect(timeline.startValue).toBeNull();
    expect(timeline.endValue).toBeNull();

    timeline.add(Easing.In, 0, 1000, 0, 1);

    expect(timeline.startValue).toBe(0);
    expect(timeline.endValue).toBe(1);

    timeline.add(Easing.Out, 1000, 2000, 1, 0);

    expect(timeline.startValue).toBe(0);
    expect(timeline.endValue).toBe(0);
});

test("Test start time and end time", () => {
    const timeline = new CommandTimeline<number>(
        StoryboardCommandType.MovementX,
    );

    expect(timeline.startTime).toBe(Number.MAX_SAFE_INTEGER);
    expect(timeline.endTime).toBe(Number.MIN_SAFE_INTEGER);

    timeline.add(Easing.In, 0, 1000, 0, 1);

    expect(timeline.startTime).toBe(0);
    expect(timeline.endTime).toBe(1000);

    timeline.add(Easing.Out, 1000, 2000, 1, 0);

    expect(timeline.startTime).toBe(0);
    expect(timeline.endTime).toBe(2000);
});

test("Test adding malformed command", () => {
    const timeline = new CommandTimeline<number>(
        StoryboardCommandType.MovementX,
    );

    timeline.add(Easing.In, 0, 1000, 0, 1);

    expect(timeline.commands.length).toBe(1);

    timeline.add(Easing.In, 1000, 0, 1, 0);

    expect(timeline.commands.length).toBe(1);
});
