import { ModWindDown } from "../../src";

test("Test initial rate higher than final rate", () => {
    const mod = new ModWindDown();

    mod.initialRate.value = 1;
    mod.finalRate.value = 0.75;

    expect(mod.initialRate.value).toBeGreaterThan(mod.finalRate.value);

    mod.initialRate.value = 0.7;

    expect(mod.initialRate.value).toBeGreaterThan(mod.finalRate.value);
});
