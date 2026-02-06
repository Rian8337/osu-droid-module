import { NumberModSetting } from "../../../src";

test("Test boundaries", () => {
    const expectThrows = (action: () => void) => {
        expect(() => {
            action();
        }).toThrow();
    };

    // Test min > max
    expectThrows(
        () => new NumberModSetting("Test", "Test", 0.12, 0.12, 0.1, 0),
    );

    // Test defaultValue > max
    expectThrows(
        () => new NumberModSetting("Test", "Test", 0.24, 0.1, 0.12, 0),
    );

    // Test defaultValue < min
    expectThrows(
        () => new NumberModSetting("Test", "Test", 0.1, 0.12, 0.24, 0),
    );

    // Test step < 0
    expectThrows(() => new NumberModSetting("Test", "Test", 0.12, 0, 1, -0.1));
});

test("Test step", () => {
    const setting = new NumberModSetting("Test", "Test", 0.12, 0.12, 1.2, 0.12);

    expect(setting.value).toBeCloseTo(0.12, 5);

    setting.value = 0.24;
    expect(setting.value).toBeCloseTo(0.24, 5);

    setting.value = 0.36;
    expect(setting.value).toBeCloseTo(0.36, 5);

    setting.value = 0.48;
    expect(setting.value).toBeCloseTo(0.48, 5);
});

test("Test value cap", () => {
    const setting = new NumberModSetting("Test", "Test", 0.12, 0.12, 1.2, 0.12);

    expect(setting.value).toBeCloseTo(0.12, 5);

    setting.value = 0;
    expect(setting.value).toBeCloseTo(0.12, 5);

    setting.value = 1.2;
    expect(setting.value).toBeCloseTo(1.2, 5);

    setting.value = 1.5;
    expect(setting.value).toBeCloseTo(1.2, 5);
});
