import {
    Command,
    Easing,
    StoryboardCommandType,
    StoryboardParameterCommandType,
} from "../../../../src";

test("Test string concatenation", () => {
    const command = new Command(
        Easing.In,
        0,
        1000,
        0,
        1,
        StoryboardCommandType.MovementX,
    );

    expect(command.toString()).toBe(
        `0 -> 1000, 0 -> 1 ${Easing.In.toString()}`,
    );
});

test("Test isParameter typeguard", () => {
    let command = new Command(
        Easing.In,
        0,
        1000,
        0,
        1,
        StoryboardCommandType.MovementX,
    );

    expect(command.isParameter()).toBe(false);

    command = new Command(
        Easing.In,
        0,
        1000,
        0,
        1,
        StoryboardCommandType.MovementX,
        StoryboardParameterCommandType.BlendingMode,
    );

    expect(command.isParameter()).toBe(true);
});
