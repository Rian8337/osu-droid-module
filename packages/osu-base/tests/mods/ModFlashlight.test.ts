import { ModFlashlight } from "../../src";

test("Test serialization", () => {
    const mod = new ModFlashlight();
    expect(mod.serialize().settings).toEqual({ areaFollowDelay: 0.12 });

    mod.followDelay = 0.36;
    expect(mod.serialize().settings).toEqual({ areaFollowDelay: 0.36 });
});

test("Test toString", () => {
    const mod = new ModFlashlight();
    expect(mod.toString()).toBe("FL");

    mod.followDelay = 0.36;
    expect(mod.toString()).toBe("FL (0.36s follow delay)");
});
