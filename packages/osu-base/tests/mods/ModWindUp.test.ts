import { ModWindUp } from "../../src";

test("Test initial rate lower than final rate", () => {
    const mod = new ModWindUp();

    mod.initialRate.value = 1;
    mod.finalRate.value = 1.5;

    expect(mod.initialRate.value).toBeLessThan(mod.finalRate.value);

    mod.initialRate.value = 1.6;

    expect(mod.initialRate.value).toBeLessThan(mod.finalRate.value);
});
