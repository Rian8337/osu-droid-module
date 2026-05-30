import { NumberModSetting } from "../../../src";

const create = (
    defaultValue: number,
    min: number,
    max: number,
    step: number,
) => new NumberModSetting("Test", null, "Test setting", defaultValue, min, max, step);

describe("Test step validation", () => {
    test("Throws when step is negative", () => {
        expect(() => create(5, 1, 10, -1)).toThrow(RangeError);
    });
});

describe("Test step behavior", () => {
    test("Step 0 leaves value unchanged (no snapping)", () => {
        const setting = create(5, 0, 10, 0);

        setting.step = 1;
        expect(setting.step).toBe(1);
        expect(setting.value).toBe(5);

        // With step=2, Math.round(5/2)*2 = Math.round(2.5)*2 = 3*2 = 6.
        setting.step = 2;
        expect(setting.step).toBe(2);
        expect(setting.value).toBe(6);
    });

    test("Snaps value to nearest step multiple on assignment", () => {
        const setting = create(0, 0, 10, 3);

        setting.value = 4;
        expect(setting.value).toBe(3);

        setting.value = 7;
        expect(setting.value).toBe(6);

        setting.value = 10;
        expect(setting.value).toBe(9);
    });
});

describe("Test load / save", () => {
    test("Loads number value from settings", () => {
        const setting = create(0, 0, 10, 1);
        const s = new NumberModSetting("Test", "n", "Test setting", 0, 0, 10, 1);

        s.load({ n: 7 });
        expect(s.value).toBe(7);
    });

    test("Saves number value to settings", () => {
        const s = new NumberModSetting("Test", "n", "Test setting", 3, 0, 10, 1);
        const out: Record<string, unknown> = {};

        s.save(out);
        expect(out).toEqual({ n: 3 });
    });
});
