import { ModFlashlight } from "../../src";

test("Test serialization", () => {
    const mod = new ModFlashlight();
    expect(mod.serialize().settings).toBeUndefined();

    mod.followDelay.value = 0.36;
    expect(mod.serialize().settings).toEqual({ areaFollowDelay: 0.36 });

    mod.sizeMultiplier.value = 1.5;
    expect(mod.serialize().settings).toEqual({
        areaFollowDelay: 0.36,
        sizeMultiplier: 1.5,
    });

    mod.comboBasedSize.value = false;
    expect(mod.serialize().settings).toEqual({
        areaFollowDelay: 0.36,
        sizeMultiplier: 1.5,
        comboBasedSize: false,
    });
});

test("Test equals", () => {
    const mod1 = new ModFlashlight();
    const mod2 = new ModFlashlight();
    const mod3 = new ModFlashlight();

    mod1.followDelay.value = 0.12;
    mod2.followDelay.value = 0.12;
    mod3.followDelay.value = 0.36;

    expect(mod1.equals(mod2)).toBe(true);
    expect(mod1.equals(mod3)).toBe(false);
});

test("Test toString", () => {
    const mod = new ModFlashlight();
    expect(mod.toString()).toBe("FL");

    mod.followDelay.value = 0.36;
    expect(mod.toString()).toBe("FL (0.36s follow delay)");
});
