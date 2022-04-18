import { MathUtils } from "../mathutil/MathUtils";

/**
 * Represents an RGB color.
 */
export class RGBColor {
    /**
     * The red component of the color.
     */
    r: number;

    /**
     * The green component of the color.
     */
    g: number;

    /**
     * The blue component of the color.
     */
    b: number;

    /**
     * The alpha component of the color.
     */
    a: number;

    constructor(r: number, g: number, b: number, a: number = 1) {
        this.r = MathUtils.clamp(r, 0, 255);
        this.g = MathUtils.clamp(g, 0, 255);
        this.b = MathUtils.clamp(b, 0, 255);
        this.a = MathUtils.clamp(a, 0, 1);
    }
}
