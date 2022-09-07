/**
 * Represents a two-dimensional vector.
 */
export class Vector2 {
    /**
     * The x position of this vector.
     */
    x: number;

    /**
     * The y position of this vector.
     */
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    /**
     * Multiplies this vector with another vector.
     *
     * @param vec The other vector.
     * @returns The multiplied vector.
     */
    multiply(vec: Vector2): Vector2 {
        return new Vector2(this.x * vec.x, this.y * vec.y);
    }

    /**
     * Divides this vector with a scalar.
     *
     * Attempting to divide by 0 will throw an error.
     *
     * @param divideFactor The factor to divide the vector by.
     * @returns The divided vector.
     */
    divide(divideFactor: number): Vector2 {
        if (divideFactor === 0) {
            throw new Error("Division by 0");
        }

        return new Vector2(this.x / divideFactor, this.y / divideFactor);
    }

    /**
     * Adds this vector with another vector.
     *
     * @param vec The other vector.
     * @returns The added vector.
     */
    add(vec: Vector2): Vector2 {
        return new Vector2(this.x + vec.x, this.y + vec.y);
    }

    /**
     * Subtracts this vector with another vector.
     *
     * @param vec The other vector.
     * @returns The subtracted vector.
     */
    subtract(vec: Vector2): Vector2 {
        return new Vector2(this.x - vec.x, this.y - vec.y);
    }

    /**
     * The length of this vector.
     */
    get length(): number {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }

    /**
     * Performs a dot multiplication with another vector.
     *
     * @param vec The other vector.
     * @returns The dot product of both vectors.
     */
    dot(vec: Vector2): number {
        return this.x * vec.x + this.y * vec.y;
    }

    /**
     * Scales this vector.
     *
     * @param scaleFactor The factor to scale the vector by.
     * @returns The scaled vector.
     */
    scale(scaleFactor: number): Vector2 {
        return new Vector2(this.x * scaleFactor, this.y * scaleFactor);
    }

    /**
     * Gets the distance between this vector and another vector.
     *
     * @param vec The other vector.
     * @returns The distance between this vector and the other vector.
     */
    getDistance(vec: Vector2): number {
        const x: number = this.x - vec.x;
        const y: number = this.y - vec.y;
        return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
    }

    /**
     * Normalizes the vector.
     */
    normalize(): void {
        const length: number = this.length;
        this.x /= length;
        this.y /= length;
    }

    /**
     * Checks whether this vector is equal to another vector.
     *
     * @param other The other vector.
     * @returns Whether this vector is equal to the other vector.
     */
    equals(other: Vector2): boolean {
        return this.x === other.x && this.y === other.y;
    }

    /**
     * Returns a string representation of the vector.
     */
    toString(): string {
        return `${this.x},${this.y}`;
    }
}
