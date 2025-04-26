import { ModWindDown } from "../../src";

test("Test initial rate higher than final rate", () => {
    const mod = new ModWindDown();

    mod.initialRate = 1;
    mod.finalRate = 0.75;

    expect(mod.initialRate).toBeGreaterThan(mod.finalRate);

    mod.initialRate = 0.7;

    expect(mod.initialRate).toBeGreaterThan(mod.finalRate);
});
