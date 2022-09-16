import { Vector2 } from "../mathutil/Vector2";

/**
 * Precision utilities.
 */
export abstract class Precision {
    static readonly FLOAT_EPSILON: number = 1e-3;

    /**
     * Checks if two numbers are equal with a given tolerance.
     *
     * @param value1 The first number.
     * @param value2 The second number.
     * @param acceptableDifference The acceptable difference as threshold. Default is `Precision.FLOAT_EPSILON = 1e-3`.
     */
    static almostEqualsNumber(
        value1: number,
        value2: number,
        acceptableDifference: number = this.FLOAT_EPSILON
    ): boolean {
        return Math.abs(value1 - value2) <= acceptableDifference;
    }

    /**
     * Checks if two vectors are equal with a given tolerance.
     *
     * @param vec1 The first vector.
     * @param vec2 The second vector.
     * @param acceptableDifference The acceptable difference as threshold. Default is `Precision.FLOAT_EPSILON = 1e-3`.
     */
    static almostEqualsVector(
        vec1: Vector2,
        vec2: Vector2,
        acceptableDifference: number = this.FLOAT_EPSILON
    ): boolean {
        return (
            this.almostEqualsNumber(vec1.x, vec2.x, acceptableDifference) &&
            this.almostEqualsNumber(vec1.y, vec2.y, acceptableDifference)
        );
    }

    /**
     * Checks whether two real numbers are almost equal.
     *
     * @param a The first number.
     * @param b The second number.
     * @param maximumError The accuracy required for being almost equal. Defaults to `10 * 2^(-53)`.
     * @returns Whether the two values differ by no more than 10 * 2^(-52).
     */
    static almostEqualRelative(
        a: number,
        b: number,
        maximumError: number = 10 * Math.pow(2, -53)
    ): boolean {
        return this.almostEqualNormRelative(a, b, a - b, maximumError);
    }

    /**
     * Compares two numbers and determines if they are equal within the specified maximum error.
     *
     * @param a The norm of the first value (can be negative).
     * @param b The norm of the second value (can be negative).
     * @param diff The norm of the difference of the two values (can be negative).
     * @param maximumError The accuracy required for being almost equal.
     * @returns Whether both numbers are almost equal up to the specified maximum error.
     */
    static almostEqualNormRelative(
        a: number,
        b: number,
        diff: number,
        maximumError: number
    ): boolean {
        // If A or B are infinity (positive or negative) then
        // only return true if they are exactly equal to each other -
        // that is, if they are both infinities of the same sign.
        if (!Number.isFinite(a) || !Number.isFinite(b)) {
            return a === b;
        }

        // If A or B are a NAN, return false. NANs are equal to nothing,
        // not even themselves.
        if (Number.isNaN(a) || Number.isNaN(b)) {
            return false;
        }

        // If one is almost zero, fall back to absolute equality.
        const doublePrecision: number = Math.pow(2, -53);
        if (Math.abs(a) < doublePrecision || Math.abs(b) < doublePrecision) {
            return Math.abs(diff) < maximumError;
        }

        if (
            (a === 0 && Math.abs(b) < maximumError) ||
            (b === 0 && Math.abs(a) < maximumError)
        ) {
            return true;
        }

        return (
            Math.abs(diff) < maximumError * Math.max(Math.abs(a), Math.abs(b))
        );
    }
}
