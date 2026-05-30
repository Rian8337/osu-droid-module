import { NullableDecimalModSetting } from "../../../src";

const create = (
    defaultValue: number | null,
    opts: {
        min?: number;
        max?: number;
        step?: number;
        precision?: number | null;
        key?: string | null;
    } = {},
) =>
    new NullableDecimalModSetting(
        "Test",
        opts.key ?? null,
        "Test setting",
        defaultValue,
        opts.min,
        opts.max,
        opts.step,
        opts.precision,
    );

describe("Test step without precision", () => {
    test("Null value passes through unchanged", () => {
        const setting = create(null, { step: 0.12 });
        expect(setting.value).toBeNull();
    });

    test("Steps through values starting from 0.12 with step 0.12", () => {
        const setting = create(0.12, { step: 0.12 });

        expect(setting.value).toBeCloseTo(0.12, 5);

        setting.value = 0.24;
        expect(setting.value).toBeCloseTo(0.24, 5);

        setting.value = 0.36;
        expect(setting.value).toBeCloseTo(0.36, 5);
    });
});

describe("Test step with precision", () => {
    test("Values are exactly representable when precision is applied", () => {
        const setting = create(0.12, { step: 0.12, precision: 2 });

        expect(setting.value).toBe(0.12);

        setting.value = 0.24;
        expect(setting.value).toBe(0.24);

        setting.value = 0.36;
        expect(setting.value).toBe(0.36);
    });
});

describe("Test value cap without precision", () => {
    test("Clamps to min and max", () => {
        const setting = create(0.12, { min: 0.12, max: 1.2, step: 0.12 });

        setting.value = 0;
        expect(setting.value).toBeCloseTo(0.12, 5);

        setting.value = 1.5;
        expect(setting.value).toBeCloseTo(1.2, 5);
    });
});

describe("Test value cap with precision", () => {
    test("Clamps and rounds correctly with floating-point max", () => {
        const setting = create(0.12, {
            min: 0.12,
            max: 0.12 * 10,
            step: 0.12,
            precision: 2,
        });

        setting.value = 0;
        expect(setting.value).toBe(0.12);

        setting.value = 1.5;
        expect(setting.value).toBe(1.2);
    });
});

describe("Test load / save", () => {
    test("Loads numeric value from settings", () => {
        const setting = create(null, { key: "test" });
        setting.load({ test: 1.25 });

        expect(setting.value).toBeCloseTo(1.25, 5);
    });

    test("Loads null value from settings", () => {
        const setting = create(0.5, { key: "test" });
        setting.load({ test: null });

        expect(setting.value).toBeNull();
    });

    test("Saves numeric value to settings", () => {
        const setting = create(0, { key: "test" });
        setting.value = 2.5;

        const out: Record<string, unknown> = {};
        setting.save(out);

        expect(out).toEqual({ test: 2.5 });
    });

    test("Saves null value to settings", () => {
        const setting = create(null, { key: "test" });

        const out: Record<string, unknown> = {};
        setting.save(out);

        expect(out).toEqual({ test: null });
    });

    test("No-op when key is null", () => {
        const setting = create(0);
        setting.load({ test: 1.25 });

        expect(setting.value).toBe(0);
    });
});
