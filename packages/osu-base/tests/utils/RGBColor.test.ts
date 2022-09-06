import { RGBColor } from "../../src";

describe("Test string concatenation", () => {
    test("Alpha equal to 1", () => {
        const color = new RGBColor(0, 0, 0);

        expect(color.toString()).toBe("0,0,0");
    });

    test("Alpha not equal to 1", () => {
        const color = new RGBColor(0, 0, 0, 0.6);

        expect(color.toString()).toBe("0,0,0,0.6");
    });
});

test("Test color equality", () => {
    const color = new RGBColor(0, 0, 0);

    const otherColor = new RGBColor(0, 0, 0);

    expect(color.equals(otherColor)).toBe(true);

    otherColor.r = 1;

    expect(color.equals(otherColor)).toBe(false);
});
