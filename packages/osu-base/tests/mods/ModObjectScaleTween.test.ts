import { DecimalModSetting, ModObjectScaleTween } from "../../src";

class DummyModObjectScaleTween extends ModObjectScaleTween {
    override readonly name = "Test";
    override readonly acronym = "TS";

    readonly startScale = new DecimalModSetting(
        "Start scale",
        "The initial size multiplier applied to all HitObjects.",
        1,
        0.5,
        1.99,
        0.01,
    );
}

test("Test serialization", () => {
    const serialized = new DummyModObjectScaleTween().serialize();

    expect(serialized.settings).toEqual({ startScale: 1 });
});
