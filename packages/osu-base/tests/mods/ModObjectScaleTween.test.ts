import { DecimalModSetting, ModObjectScaleTween } from "../../src";

class DummyModObjectScaleTween extends ModObjectScaleTween {
    override readonly name = "Test";
    override readonly acronym = "TS";

    readonly startScale = new DecimalModSetting(
        "Start scale",
        "startScale",
        "The initial size multiplier applied to all HitObjects.",
        1,
        0.5,
        1.99,
        0.01,
        null,
    );
}

test("Test serialization", () => {
    const mod = new DummyModObjectScaleTween();

    expect(mod.serialize().settings).toBeUndefined();

    mod.startScale.value = 0.5;
    expect(mod.serialize().settings).toEqual({ startScale: 0.5 });

    mod.startScale.value = 1;
    expect(mod.serialize().settings).toBeUndefined();
});
