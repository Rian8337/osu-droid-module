import { BooleanModSetting } from "../../../src";

describe("Test load", () => {
    test("Loads true from settings", () => {
        const setting = new BooleanModSetting("Test", "flag", "Test setting", false);
        setting.load({ flag: true });

        expect(setting.value).toBe(true);
    });

    test("Loads false from settings", () => {
        const setting = new BooleanModSetting("Test", "flag", "Test setting", true);
        setting.load({ flag: false });

        expect(setting.value).toBe(false);
    });

    test("Ignores non-boolean values", () => {
        const setting = new BooleanModSetting("Test", "flag", "Test setting", false);
        setting.load({ flag: 1 });

        expect(setting.value).toBe(false);
    });

    test("No-op when key is null", () => {
        const setting = new BooleanModSetting("Test", null, "Test setting", false);
        setting.load({ flag: true });

        expect(setting.value).toBe(false);
    });
});

describe("Test save", () => {
    test("Saves boolean value to settings", () => {
        const setting = new BooleanModSetting("Test", "flag", "Test setting", false);
        setting.value = true;

        const out: Record<string, unknown> = {};
        setting.save(out);

        expect(out).toEqual({ flag: true });
    });

    test("No-op when key is null", () => {
        const setting = new BooleanModSetting("Test", null, "Test setting", true);
        const out: Record<string, unknown> = {};
        setting.save(out);

        expect(out).toEqual({});
    });
});
