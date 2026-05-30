import { ModSetting } from "../../../src";

// Concrete subclass for testing the abstract-ish base class.
class TestModSetting extends ModSetting<number> {
    constructor(defaultValue: number, key: string | null = null) {
        super("Test", key, "Test setting", defaultValue);
    }
}

describe("Test isDefault", () => {
    test("True when value equals defaultValue", () => {
        const setting = new TestModSetting(1);

        expect(setting.isDefault).toBe(true);
    });

    test("False when value differs from defaultValue", () => {
        const setting = new TestModSetting(1);
        setting.value = 2;

        expect(setting.isDefault).toBe(false);
    });

    test("True again after restoring to defaultValue", () => {
        const setting = new TestModSetting(1);
        setting.value = 2;
        setting.value = 1;

        expect(setting.isDefault).toBe(true);
    });
});

describe("Test load", () => {
    test("Loads value when key is set and key exists in settings", () => {
        const setting = new TestModSetting(0, "myKey");
        setting.load({ myKey: 42 });

        expect(setting.value).toBe(42);
    });

    test("No-op when key is null", () => {
        const setting = new TestModSetting(0, null);
        setting.load({ myKey: 42 });

        expect(setting.value).toBe(0);
    });

    test("No-op when key is absent from settings", () => {
        const setting = new TestModSetting(0, "myKey");
        setting.load({ otherKey: 42 });

        expect(setting.value).toBe(0);
    });
});

describe("Test save", () => {
    test("Saves value when key is set", () => {
        const setting = new TestModSetting(7, "myKey");
        const settings: Record<string, unknown> = {};
        setting.save(settings);

        expect(settings).toEqual({ myKey: 7 });
    });

    test("No-op when key is null", () => {
        const setting = new TestModSetting(7, null);
        const settings: Record<string, unknown> = {};
        setting.save(settings);

        expect(settings).toEqual({});
    });
});

describe("Test bindValueChanged", () => {
    test("Fires listener when value changes", () => {
        const setting = new TestModSetting(1);
        const changes: number[] = [];

        setting.bindValueChanged(({ newValue }) => changes.push(newValue));
        setting.value = 2;
        setting.value = 3;

        expect(changes).toEqual([2, 3]);
    });

    test("Does not fire when value is assigned to itself", () => {
        const setting = new TestModSetting(1);
        const changes: number[] = [];

        setting.bindValueChanged(({ newValue }) => changes.push(newValue));
        setting.value = 1;

        expect(changes).toHaveLength(0);
    });

    test("Fires immediately when runOnceImmediately is true", () => {
        const setting = new TestModSetting(5);
        const changes: number[] = [];

        setting.bindValueChanged(({ newValue }) => changes.push(newValue), true);

        expect(changes).toEqual([5]);
    });

    test("No longer fires after unbindValueChanged", () => {
        const setting = new TestModSetting(1);
        const changes: number[] = [];
        const listener = ({ newValue }: { newValue: number }) =>
            changes.push(newValue);

        setting.bindValueChanged(listener);
        setting.value = 2;
        setting.unbindValueChanged(listener);
        setting.value = 3;

        expect(changes).toEqual([2]);
    });
});
