import { AnimationStyle, Easing, ModApproachDifferent } from "../../src";

test("Test serialization", () => {
    const mod = new ModApproachDifferent();

    expect(mod.serialize().settings).toBeUndefined();

    mod.scale.value = 5;
    expect(mod.serialize().settings).toEqual({ scale: 5 });

    mod.style.value = AnimationStyle.Accelerate1;
    expect(mod.serialize().settings).toEqual({
        scale: 5,
        style: AnimationStyle.Accelerate1,
    });

    mod.scale.value = 3;
    expect(mod.serialize().settings).toEqual({
        style: AnimationStyle.Accelerate1,
    });
});

test("Test animation style", () => {
    const mod = new ModApproachDifferent();

    const expectEasing = (style: AnimationStyle, easing: Easing) => {
        mod.style.value = style;
        expect(mod.easing).toBe(easing);
    };

    expectEasing(AnimationStyle.Linear, Easing.None);
    expectEasing(AnimationStyle.Gravity, Easing.InBack);
    expectEasing(AnimationStyle.InOut1, Easing.InOutCubic);
    expectEasing(AnimationStyle.InOut2, Easing.InOutQuint);
    expectEasing(AnimationStyle.Accelerate1, Easing.In);
    expectEasing(AnimationStyle.Accelerate2, Easing.InCubic);
    expectEasing(AnimationStyle.Accelerate3, Easing.InQuint);
    expectEasing(AnimationStyle.Decelerate1, Easing.Out);
    expectEasing(AnimationStyle.Decelerate2, Easing.OutCubic);
    expectEasing(AnimationStyle.Decelerate3, Easing.OutQuint);
});
