import { ModFlashlight } from "../../src";

test("Test serialization", () => {
    const mod = new ModFlashlight();
    expect(mod.serialize().settings).toEqual({ areaFollowDelay: 0.12 });

    mod.followDelay = 0.36;
    expect(mod.serialize().settings).toEqual({ areaFollowDelay: 0.36 });
});

test("Test equals", () => {
    const mod1 = new ModFlashlight();
    const mod2 = new ModFlashlight();
    const mod3 = new ModFlashlight();

    mod1.followDelay = 0.12;
    mod2.followDelay = 0.12;
    mod3.followDelay = 0.36;

    expect(mod1.equals(mod2)).toBe(true);
    expect(mod1.equals(mod3)).toBe(false);
});

test("Test toString", () => {
    const mod = new ModFlashlight();
    expect(mod.toString()).toBe("FL");

    mod.followDelay = 0.36;
    expect(mod.toString()).toBe("FL (0.36s follow delay)");
});
