import { RGBColor } from "../../src"

test("Test string concatenation", () => {
    const color = new RGBColor(0, 0, 0);

    expect(color.toString()).toBe("0,0,0");
});

test("Test color equality", () => {
    const color = new RGBColor(0, 0, 0);

    const otherColor = new RGBColor(0, 0, 0);

    expect(color.equals(otherColor)).toBe(true);

    otherColor.r = 1;

    expect(color.equals(otherColor)).toBe(false);
});