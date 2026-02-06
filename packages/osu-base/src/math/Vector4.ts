import { Vector2 } from "./Vector2";

/**
 * Represents a four-dimensional vector.
 */
export class Vector4 {
    /**
     * The X component of this vector.
     */
    x: number;

    /**
     * The Y component of this vector.
     */
    y: number;

    /**
     * The Z component of this vector.
     */
    z: number;

    /**
     * The W component of this vector.
     */
    w: number;

    constructor(value: number);
    // eslint-disable-next-line @typescript-eslint/unified-signatures
    constructor(xz: number, yw: number);
    constructor(x: number, y: number, z: number, w: number);
    constructor(xOrValueOrXZ: number, yOrYW?: number, z?: number, w?: number) {
        if (yOrYW === undefined) {
            this.x = xOrValueOrXZ;
            this.y = xOrValueOrXZ;
            this.z = xOrValueOrXZ;
            this.w = xOrValueOrXZ;

            return;
        }

        if (typeof z === "undefined") {
            this.x = xOrValueOrXZ;
            this.y = yOrYW;
            this.z = xOrValueOrXZ;
            this.w = yOrYW;

            return;
        }

        this.x = xOrValueOrXZ;
        this.y = yOrYW;
        this.z = z;
        this.w = w!;
    }

    /**
     * The X coordinate of the left edge of this vector.
     */
    get left(): number {
        return this.x;
    }

    /**
     * The Y coordinate of the top edge of this vector.
     */
    get top(): number {
        return this.y;
    }

    /**
     * The X coordinate of the right edge of this vector.
     */
    get right(): number {
        return this.z;
    }

    /**
     * The Y coordinate of the bottom edge of this vector.
     */
    get bottom(): number {
        return this.w;
    }

    /**
     * The top left corner of this vector.
     */
    get topLeft(): Vector2 {
        return new Vector2(this.left, this.top);
    }

    /**
     * The top right corner of this vector.
     */
    get topRight(): Vector2 {
        return new Vector2(this.right, this.top);
    }

    /**
     * The bottom left corner of this vector.
     */
    get bottomLeft(): Vector2 {
        return new Vector2(this.left, this.bottom);
    }

    /**
     * The bottom right corner of this vector.
     */
    get bottomRight(): Vector2 {
        return new Vector2(this.right, this.bottom);
    }

    /**
     * The width of the rectangle defined by this vector.
     */
    get width(): number {
        return this.right - this.left;
    }

    /**
     * The height of the rectangle defined by this vector.
     */
    get height(): number {
        return this.bottom - this.top;
    }
}
