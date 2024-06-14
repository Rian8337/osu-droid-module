import { Interpolation, Vector2 } from "../../src";

test("Test linear interpolation of numbers", () => {
    expect(Interpolation.lerp(4, 5, 2)).toBe(6);
    expect(Interpolation.lerp(2, 5, 2)).toBe(8);
    expect(Interpolation.lerp(-1, 7, 2)).toBe(15);
});

test("Test linear interpolation of vectors", () => {
    expect(Interpolation.lerp(new Vector2(4), new Vector2(5), 2)).toEqual(
        new Vector2(6),
    );

    expect(Interpolation.lerp(new Vector2(2, 3), new Vector2(5, 6), 2)).toEqual(
        new Vector2(8, 9),
    );

    expect(
        Interpolation.lerp(new Vector2(-1, 2), new Vector2(7, 8), 2),
    ).toEqual(new Vector2(15, 14));
});
