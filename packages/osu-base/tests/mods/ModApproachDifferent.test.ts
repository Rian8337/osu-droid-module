import { AnimationStyle, Easing, ModApproachDifferent } from "../../src";

test("Test serialization", () => {
    const mod = new ModApproachDifferent();

    mod.scale.value = 3;
    mod.style.value = AnimationStyle.gravity;

    expect(mod.serialize().settings).toEqual({
        scale: 3,
        style: AnimationStyle.gravity,
    });

    mod.scale.value = 5;
    mod.style.value = AnimationStyle.accelerate1;

    expect(mod.serialize().settings).toEqual({
        scale: 5,
        style: AnimationStyle.accelerate1,
    });
});

test("Test animation style", () => {
    const mod = new ModApproachDifferent();

    const expectEasing = (style: AnimationStyle, easing: Easing) => {
        mod.style.value = style;
        expect(mod.easing).toBe(easing);
    };

    expectEasing(AnimationStyle.linear, Easing.none);
    expectEasing(AnimationStyle.gravity, Easing.inBack);
    expectEasing(AnimationStyle.inOut1, Easing.inOutCubic);
    expectEasing(AnimationStyle.inOut2, Easing.inOutQuint);
    expectEasing(AnimationStyle.accelerate1, Easing.in);
    expectEasing(AnimationStyle.accelerate2, Easing.inCubic);
    expectEasing(AnimationStyle.accelerate3, Easing.inQuint);
    expectEasing(AnimationStyle.decelerate1, Easing.out);
    expectEasing(AnimationStyle.decelerate2, Easing.outCubic);
    expectEasing(AnimationStyle.decelerate3, Easing.outQuint);
});
