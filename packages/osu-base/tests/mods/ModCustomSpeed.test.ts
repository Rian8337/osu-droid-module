import { ModCustomSpeed } from "../../src";

test("Test serialization", () => {
    const mod = new ModCustomSpeed();

    mod.trackRateMultiplier = 1;
    expect(mod.serialize().settings).toEqual({ rateMultiplier: 1 });

    mod.trackRateMultiplier = 1.25;
    expect(mod.serialize().settings).toEqual({ rateMultiplier: 1.25 });
});

test("Test toString", () => {
    const mod = new ModCustomSpeed(1.25);

    expect(mod.toString()).toBe("CS (1.25x)");
});
