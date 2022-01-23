import { Interpolation } from "../../src/mathutil/Interpolation";

test("Test linear interpolation", () => {
    expect(Interpolation.lerp(4, 5, 2)).toBe(6);
    expect(Interpolation.lerp(2, 5, 2)).toBe(8);
    expect(Interpolation.lerp(-1, 7, 2)).toBe(15);
});
