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
}
