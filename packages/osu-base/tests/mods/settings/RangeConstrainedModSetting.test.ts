// RangeConstrainedModSetting is abstract; IntegerModSetting is the simplest concrete subclass.
import { IntegerModSetting } from "../../../src";

const create = (defaultValue: number, min: number, max: number) =>
    new IntegerModSetting("Test", null, "Test setting", defaultValue, min, max);

describe("Test initialization validation", () => {
    test("Throws when min > max", () => {
        expect(() => create(1, 2, 1)).toThrow(RangeError);
    });

    test("Throws when defaultValue > max", () => {
        expect(() => create(3, 1, 2)).toThrow(RangeError);
    });

    test("Throws when defaultValue < min", () => {
        expect(() => create(0, 1, 2)).toThrow(RangeError);
    });
});

describe("Test value clamping on assign", () => {
    test("Clamps to min when value is below range", () => {
        const setting = create(5, 1, 10);
        setting.value = 0;

        expect(setting.value).toBe(1);
    });

    test("Clamps to max when value is above range", () => {
        const setting = create(5, 1, 10);
        setting.value = 11;

        expect(setting.value).toBe(10);
    });
});

describe("Test min reassignment", () => {
    test("Clamps value when new min exceeds current value", () => {
        const setting = create(5, 1, 10);

        setting.min = 6;
        expect(setting.min).toBe(6);
        expect(setting.value).toBe(6);

        setting.min = 9;
        expect(setting.min).toBe(9);
        expect(setting.value).toBe(9);
    });
});

describe("Test max reassignment", () => {
    test("Clamps value when new max is below current value", () => {
        const setting = create(5, 1, 10);

        setting.max = 4;
        expect(setting.max).toBe(4);
        expect(setting.value).toBe(4);

        setting.max = 2;
        expect(setting.max).toBe(2);
        expect(setting.value).toBe(2);
    });
});
