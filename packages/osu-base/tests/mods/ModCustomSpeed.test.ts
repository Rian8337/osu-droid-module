import { ModCustomSpeed } from "../../src";

test("Test serialization", () => {
    const mod = new ModCustomSpeed();

    mod.trackRateMultiplier.value = 1;
    expect(mod.serialize().settings).toEqual({ rateMultiplier: 1 });

    mod.trackRateMultiplier.value = 1.25;
    expect(mod.serialize().settings).toEqual({ rateMultiplier: 1.25 });
});

test("Test equals", () => {
    const mod1 = new ModCustomSpeed(1.25);
    const mod2 = new ModCustomSpeed(1.25);
    const mod3 = new ModCustomSpeed(1);

    expect(mod1.equals(mod2)).toBe(true);
    expect(mod1.equals(mod3)).toBe(false);
});

test("Test toString", () => {
    const mod = new ModCustomSpeed(1.25);

    expect(mod.toString()).toBe("CS (1.25x)");
});
