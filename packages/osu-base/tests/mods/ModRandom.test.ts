import { ModRandom } from "../../src";

test("Test serialization", () => {
    const random = new ModRandom();

    expect(random.serialize().settings).toEqual({ angleSharpness: 7 });

    random.angleSharpness.value = 8;

    expect(random.serialize().settings).toEqual({ angleSharpness: 8 });

    random.seed.value = 100;

    expect(random.serialize().settings).toEqual({
        angleSharpness: 8,
        seed: 100,
    });
});

test("Test equals", () => {
    const random1 = new ModRandom();
    const random2 = new ModRandom();
    const random3 = new ModRandom();
    const random4 = new ModRandom();

    random1.angleSharpness.value = 7;
    random1.seed.value = 100;

    random2.angleSharpness.value = 7;
    random2.seed.value = 100;

    random3.angleSharpness.value = 8;
    random3.seed.value = 100;

    random4.angleSharpness.value = 7;
    random4.seed.value = 200;

    expect(random1.equals(random2)).toBe(true);
    expect(random1.equals(random3)).toBe(false);
    expect(random1.equals(random4)).toBe(false);
});

test("Test toString", () => {
    const random = new ModRandom();

    expect(random.toString()).toBe("RD (angle sharpness: 7.0)");

    random.angleSharpness.value = 8;
    random.seed.value = 100;

    expect(random.toString()).toBe("RD (seed: 100, angle sharpness: 8.0)");
});
