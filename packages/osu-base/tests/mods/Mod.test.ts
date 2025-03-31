import { ModCustomSpeed, ModDifficultyAdjust, ModHardRock } from "../../src";

test("Test mod toString", () => {
    expect(new ModHardRock().toString()).toBe("HR");
    expect(new ModCustomSpeed(1.25).toString()).toBe("CS (1.25x)");
    expect(new ModCustomSpeed(1).toString()).toBe("CS (1.00x)");
    expect(new ModDifficultyAdjust({ cs: 1 }).toString()).toBe("DA (CS1.0)");
});
