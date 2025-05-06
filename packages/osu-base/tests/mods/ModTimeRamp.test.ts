import { ModTimeRamp } from "../../src";

class DummyModTimeRamp extends ModTimeRamp {
    override readonly name = "Test";
    override readonly acronym = "TS";

    initialRate = 1;
    finalRate = 1.5;
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

    mod1.initialRate = 1;
    mod1.finalRate = 1.5;

    mod2.initialRate = 1;
    mod2.finalRate = 1.5;

    mod3.initialRate = 1.5;
    mod3.finalRate = 2;

    mod4.initialRate = 1.2;
    mod4.finalRate = 1.5;

    expect(mod1.equals(mod2)).toBe(true);
    expect(mod1.equals(mod3)).toBe(false);
    expect(mod1.equals(mod4)).toBe(false);
    expect(mod3.equals(mod4)).toBe(false);
});

test("Test toString", () => {
    expect(new DummyModTimeRamp().toString()).toBe("TS (1.00x - 1.50x)");
});
