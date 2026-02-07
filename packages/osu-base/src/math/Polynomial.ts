import { Precision } from "../utils/Precision";
import { MathUtils } from "./MathUtils";

interface PolynomialRootResult {
    count: number;
    readonly roots: (number | null)[];
}

/**
 * A single-variable polynomial with real-valued coefficients and non-negative exponents.
 *
 * This class shares the same implementation as {@link https://numerics.mathdotnet.com/ Math.NET Numerics}.
 */
export abstract class Polynomial {
    /**
     * Evaluates a polynomial at point `z`.
     *
     * Coefficients are ordered ascending by power with power `k` at index `k`.
     * For example, coefficients `[3, -1, 2]` represent `y = 2x^2 - x + 3`.
     *
     * @param z The location where to evaluate the polynomial at.
     * @param coefficients The coefficients of the polynomial, coefficient for power `k` at index `k`.
     * @returns The polynomial at `z`.
     */
    static evaluate(z: number, coefficients: readonly number[]): number {
        // Zero polynomials need explicit handling, otherwise we
        // will attempt to peek coefficients at negative indices.
        if (coefficients.length === 0) {
            return 0;
        }

        let sum = coefficients.at(-1)!;

        for (let i = coefficients.length - 2; i >= 0; --i) {
            sum *= z;
            sum += coefficients[i];
        }

        return sum;
    }

    /**
     * Solve for the exact real roots of any polynomial up to degree 4.
     *
     * @param coefficients The coefficients of the polynomial, in ascending order ([1, 3, 5] -> x^2 + 3x + 5).
     * @returns The real roots of the polynomial, and `null` if the root does not exist.
     */
    static solve(coefficients: readonly number[]): (number | null)[] {
        let xVals: (number | null)[] = [];

        switch (coefficients.length) {
            case 5:
                xVals = this.solveP4(
                    coefficients[0],
                    coefficients[1],
                    coefficients[2],
                    coefficients[3],
                    coefficients[4],
                ).roots;
                break;

            case 4:
                xVals = this.solveP3(
                    coefficients[0],
                    coefficients[1],
                    coefficients[2],
                    coefficients[3],
                ).roots;
                break;

            case 3:
                xVals = this.solveP2(
                    coefficients[0],
                    coefficients[1],
                    coefficients[2],
                ).roots;
                break;

            case 2:
                xVals = this.solveP2(0, coefficients[0], coefficients[1]).roots;
                break;
        }

        return xVals;
    }

    // https://github.com/sasamil/Quartic/blob/master/quartic.cpp
    private static solveP4(
        a: number,
        b: number,
        c: number,
        d: number,
        e: number,
    ): PolynomialRootResult {
        const result: PolynomialRootResult = {
            count: 0,
            roots: new Array<number | null>(4),
        };

        if (a === 0) {
            const xValsCubic = this.solveP3(b, c, d, e);

            result.count = xValsCubic.count;
            result.roots[0] = xValsCubic.roots[0];
            result.roots[1] = xValsCubic.roots[1];
            result.roots[2] = xValsCubic.roots[2];
            result.roots[3] = null;

            return result;
        }

        b /= a;
        c /= a;
        d /= a;
        e /= a;

        const a3 = -c;
        const b3 = b * d - 4 * e;
        const c3 = -b * b * e - d * d + 4 * c * e;
        const x3 = this.solveP3(1, a3, b3, c3);

        let q1: number;
        let q2: number;
        let p1: number;
        let p2: number;
        let sqD: number;

        let y = x3.roots[0]!;

        // Get the y value with the highest absolute value.
        if (x3.count !== 1) {
            if (Math.abs(x3.roots[1]!) > Math.abs(y)) {
                y = x3.roots[1]!;
            }

            if (Math.abs(x3.roots[2]!) > Math.abs(y)) {
                y = x3.roots[2]!;
            }
        }

        let upperD = y * y - 4 * e;

        if (Precision.almostEquals(upperD, 0)) {
            q1 = q2 = y * 0.5;

            upperD = b * b - 4 * (c - y);

            if (Precision.almostEquals(upperD, 0)) {
                p1 = p2 = b * 0.5;
            } else {
                sqD = Math.sqrt(upperD);
                p1 = (b + sqD) * 0.5;
                p2 = (b - sqD) * 0.5;
            }
        } else {
            sqD = Math.sqrt(upperD);
            q1 = (y + sqD) * 0.5;
            q2 = (y - sqD) * 0.5;

            p1 = (b * q1 - d) / (q1 - q2);
            p2 = (d - b * q2) / (q1 - q2);
        }

        // Solving quadratic eq. - x^2 + p1*x + q1 = 0.
        upperD = p1 * p1 - 4 * q1;

        if (upperD >= 0) {
            result.count += 2;

            sqD = Math.sqrt(upperD);
            result.roots[0] = (-p1 + sqD) * 0.5;
            result.roots[1] = (-p1 - sqD) * 0.5;
        }

        // Solving quadratic eq. - x^2 + p2*x + q2 = 0.
        upperD = p2 * p2 - 4 * q2;

        if (upperD >= 0) {
            result.count += 2;

            sqD = Math.sqrt(upperD);
            result.roots[2] = (-p2 + sqD) * 0.5;
            result.roots[3] = (-p2 - sqD) * 0.5;
        }

        // Put the null roots at the end of the array.
        result.roots.sort((a, b) => {
            if (a === null && b === null) {
                return 0;
            }

            if (a === null) {
                return 1;
            }

            if (b === null) {
                return -1;
            }

            return 0;
        });

        return result;
    }

    private static solveP3(
        a: number,
        b: number,
        c: number,
        d: number,
    ): PolynomialRootResult {
        const result: PolynomialRootResult = {
            count: 0,
            roots: new Array<number | null>(3),
        };

        if (a === 0) {
            const xValsQuadratic = this.solveP2(b, c, d);

            result.count = xValsQuadratic.count;
            result.roots[0] = xValsQuadratic.roots[0];
            result.roots[1] = xValsQuadratic.roots[1];
            result.roots[2] = null;

            return result;
        }

        b /= a;
        c /= a;
        d /= a;

        const a2 = b * b;
        let q = (a2 - 3 * c) / 9;
        const q3 = q * q * q;
        const r = (b * (2 * a2 - 9 * c) + 27 * d) / 54;
        const r2 = r * r;

        if (r2 < q3) {
            let t = r / Math.sqrt(q3);

            t = MathUtils.clamp(t, -1, 1);
            t = Math.acos(t);
            b /= 3;
            q = -2 * Math.sqrt(q);

            result.count = 3;
            result.roots[0] = q * Math.cos(t / 3) - b;
            result.roots[1] = q * Math.cos((t + Math.PI * 2) / 3) - b;
            result.roots[2] = q * Math.cos((t - Math.PI * 2) / 3) - b;

            return result;
        }

        let upperA = -Math.cbrt(Math.abs(r) + Math.sqrt(r2 - q3));

        if (r < 0) {
            upperA = -upperA;
        }

        const upperB = upperA == 0 ? 0 : q / upperA;
        b /= 3;

        result.count = 1;
        result.roots[0] = upperA + upperB - b;

        if (Precision.almostEquals(0.5 * Math.sqrt(3) * (upperA - upperB), 0)) {
            result.count = 2;
            result.roots[1] = -0.5 * (upperA + upperB) - b;

            return result;
        }

        return result;
    }

    private static solveP2(
        a: number,
        b: number,
        c: number,
    ): PolynomialRootResult {
        const result: PolynomialRootResult = {
            count: 0,
            roots: new Array<number | null>(2),
        };

        if (a === 0) {
            if (b === 0) {
                return result;
            }

            result.count = 1;
            result.roots[0] = -c / b;
        }

        const discriminant = b * b - 4 * a * c;

        if (discriminant < 0) {
            return result;
        }

        switch (discriminant) {
            case 0:
                result.count = 1;
                result.roots[0] = -b / (2 * a);
                break;

            default:
                result.count = 2;
                result.roots[0] = (-b + Math.sqrt(discriminant)) / (2 * a);
                result.roots[1] = (-b - Math.sqrt(discriminant)) / (2 * a);
                break;
        }

        return result;
    }
}
