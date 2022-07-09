import { CommandTrigger } from "../../../../src";

test("Test string concatenation", () => {
    const command = new CommandTrigger("trigger", 0, 1000, 0);

    expect(command.toString()).toBe("trigger 0 -> 1000 (0)");
});
