import { ModTimeRamp } from "../../src";

class DummyModTimeRamp extends ModTimeRamp {
    override readonly name = "Test";
    override readonly acronym = "TS";

    initialRate = 1;
    finalRate = 1.5;
}

test("Test serialization", () => {
    const serialized = new DummyModTimeRamp().serialize();

    expect(serialized.settings).toEqual({
        initialRate: 1,
        finalRate: 1.5,
    });
});

test("Test toString", () => {
    expect(new DummyModTimeRamp().toString()).toBe("TS (1.00x - 1.50x)");
});
