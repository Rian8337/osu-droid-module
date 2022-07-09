import { CommandTimelineGroup, Easing } from "../../../../src";

test("Test duration", () => {
    const group = new CommandTimelineGroup();

    group.x.add(Easing.in, 0, 1000, 0, 1);

    expect(group.duration).toBe(1000);

    group.x.add(Easing.in, 1500, 2000, 1, 0);

    expect(group.duration).toBe(2000);
});

describe("Test getting commands", () => {
    const group = new CommandTimelineGroup();

    group.x.add(Easing.in, 500, 1000, 0, 1);

    test("With offset", () => {
        const commands = group.getCommands((c) => c.x, 1000);

        expect(commands.length).toBe(1);

        const command = commands[0];

        expect(command.startTime).toBe(1500);
        expect(command.endTime).toBe(2000);
        expect(command.duration).toBe(500);
    });

    test("Without offset", () => {
        const commands = group.getCommands((c) => c.x);

        expect(commands.length).toBe(1);

        const command = commands[0];

        expect(command.startTime).toBe(500);
        expect(command.endTime).toBe(1000);
        expect(command.duration).toBe(500);
    });
});
