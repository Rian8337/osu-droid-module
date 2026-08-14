import { ModBarrelRoll, RotationDirection } from "../../src";

test("Test serialization", () => {
    const mod = new ModBarrelRoll();

    expect(mod.serialize().settings).toBeUndefined();

    mod.spinSpeed.value = 1;
    expect(mod.serialize().settings).toEqual({ spinSpeed: 1 });

    mod.direction.value = RotationDirection.Counterclockwise;
    expect(mod.serialize().settings).toEqual({
        spinSpeed: 1,
        direction: 1,
    });

    mod.spinSpeed.value = 0.5;
    expect(mod.serialize().settings).toEqual({ direction: 1 });
});

test("Test equals", () => {
    const mod1 = new ModBarrelRoll();
    const mod2 = new ModBarrelRoll();
    const mod3 = new ModBarrelRoll();

    mod1.direction.value = RotationDirection.Counterclockwise;
    mod2.direction.value = RotationDirection.Counterclockwise;
    mod3.direction.value = RotationDirection.Clockwise;

    expect(mod1.equals(mod2)).toBe(true);
    expect(mod1.equals(mod3)).toBe(false);
});
