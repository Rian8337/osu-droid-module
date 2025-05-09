import { DecimalModSetting, ModTimeRamp } from "../../src";

class DummyModTimeRamp extends ModTimeRamp {
    override readonly name = "Test";
    override readonly acronym = "TS";

    override readonly initialRate = new DecimalModSetting(
        "Initial rate",
        "The starting speed of the track.",
        1,
        0.5,
        1.99,
        0.01,
        2,
    );

    override readonly finalRate = new DecimalModSetting(
        "Final rate",
        "The final speed to ramp to.",
        1.5,
        0.51,
        2,
        0.01,
        2,
    );
}

test("Test serialization", () => {
    const serialized = new DummyModTimeRamp().serialize();

    expect(serialized.settings).toEqual({
        initialRate: 1,
        finalRate: 1.5,
    });
});

test("Test equals", () => {
    const mod1 = new DummyModTimeRamp();
    const mod2 = new DummyModTimeRamp();
    const mod3 = new DummyModTimeRamp();
    const mod4 = new DummyModTimeRamp();

    mod1.initialRate.value = 1;
    mod1.finalRate.value = 1.5;

    mod2.initialRate.value = 1;
    mod2.finalRate.value = 1.5;

    mod3.initialRate.value = 1.5;
    mod3.finalRate.value = 2;

    mod4.initialRate.value = 1.2;
    mod4.finalRate.value = 1.5;

    expect(mod1.equals(mod2)).toBe(true);
    expect(mod1.equals(mod3)).toBe(false);
    expect(mod1.equals(mod4)).toBe(false);
    expect(mod3.equals(mod4)).toBe(false);
});

test("Test toString", () => {
    expect(new DummyModTimeRamp().toString()).toBe("TS (1.00x - 1.50x)");
});
