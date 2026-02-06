import {
    Command,
    Easing,
    StoryboardCommandType,
    StoryboardParameterCommandType,
} from "../../../../src";

test("Test string concatenation", () => {
    const command = new Command(
        Easing.in,
        0,
        1000,
        0,
        1,
        StoryboardCommandType.movementX,
    );

    expect(command.toString()).toBe(
        `0 -> 1000, 0 -> 1 ${Easing.in.toString()}`,
    );
});

test("Test isParameter typeguard", () => {
    let command = new Command(
        Easing.in,
        0,
        1000,
        0,
        1,
        StoryboardCommandType.movementX,
    );

    expect(command.isParameter()).toBe(false);

    command = new Command(
        Easing.in,
        0,
        1000,
        0,
        1,
        StoryboardCommandType.movementX,
        StoryboardParameterCommandType.blendingMode,
    );

    expect(command.isParameter()).toBe(true);
});
