import { ModRandom } from "../../src";

test("Test serialization", () => {
    const random = new ModRandom();

    expect(random.serialize().settings).toEqual({ angleSharpness: 7 });

    random.angleSharpness = 8;

    expect(random.serialize().settings).toEqual({ angleSharpness: 8 });

    random.seed = 100;

    expect(random.serialize().settings).toEqual({
        angleSharpness: 8,
        seed: 100,
    });
});
