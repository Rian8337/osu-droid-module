import { ModWindUp } from "../../src";

test("Test initial rate lower than final rate", () => {
    const mod = new ModWindUp();

    mod.initialRate = 1;
    mod.finalRate = 1.5;

    expect(mod.initialRate).toBeLessThan(mod.finalRate);

    mod.initialRate = 1.6;

    expect(mod.initialRate).toBeLessThan(mod.finalRate);
});
