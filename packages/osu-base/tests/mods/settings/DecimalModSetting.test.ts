import { DecimalModSetting } from "../../../src";

test("Test boundaries", () => {
    // Test precision < 0
    expect(
        () => new DecimalModSetting("Test", "Test", 0.12, 0, 1, 0.1, -1),
    ).toThrow();
});

test("Test step with precision", () => {
    const setting = new DecimalModSetting(
        "Test",
        "Test",
        0.12,
        undefined,
        undefined,
        0.12,
        2,
    );

    // These need to be exactly equal to prevent serialization differences.
    expect(setting.value).toBe(0.12);

    setting.value = 0.24;
    expect(setting.value).toBe(0.24);

    setting.value = 0.36;
    expect(setting.value).toBe(0.36);

    setting.value = 0.48;
    expect(setting.value).toBe(0.48);
});

test("Test value cap", () => {
    const setting = new DecimalModSetting(
        "Test",
        "Test",
        0.12,
        0.12,
        1.2,
        0.12,
        2,
    );

    // These need to be exactly equal to prevent serialization differences.
    expect(setting.value).toBe(0.12);

    setting.value = 0;
    expect(setting.value).toBe(0.12);

    setting.value = 1.2;
    expect(setting.value).toBe(1.2);

    setting.value = 1.5;
    expect(setting.value).toBe(1.2);
});
