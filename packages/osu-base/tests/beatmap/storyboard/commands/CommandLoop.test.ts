import { CommandLoop, Easing } from "../../../../src";

test("Test constructor throwing for repeat count less than zero", () => {
    expect(() => new CommandLoop(0, 0)).not.toThrow();
    expect(() => new CommandLoop(0, -1)).toThrow();
});

describe("Test getting commands", () => {
    const group = new CommandLoop(500, 0);

    group.x.add(Easing.in, 500, 1000, 0, 1);

    test("With offset", () => {
        const commands = group.getCommands((c) => c.x, 1000);

        expect(commands.length).toBe(1);

        const command = commands[0];

        expect(command.startTime).toBe(2000);
        expect(command.endTime).toBe(2500);
        expect(command.duration).toBe(500);
    });

    test("Without offset", () => {
        const commands = group.getCommands((c) => c.x);

        expect(commands.length).toBe(1);

        const command = commands[0];

        expect(command.startTime).toBe(1000);
        expect(command.endTime).toBe(1500);
        expect(command.duration).toBe(500);
    });
});

test("Test string concatenation", () => {
    const group = new CommandLoop(0, 1);

    expect(group.toString()).toBe("0 x2");
});
