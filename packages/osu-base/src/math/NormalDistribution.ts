import { ErrorFunction } from "./ErrorFunction";

/**
 * Continuous Univariate Normal distribution, also known as Gaussian distribution.
 *
 * For details about this distribution, see {@link http://en.wikipedia.org/wiki/Normal_distribution Wikipedia - Normal distribution}.
 *
 * This class shares the same implementation as {@link https://numerics.mathdotnet.com/ Math.NET Numerics}.
 */
export abstract class NormalDistribution {
    /**
     * Computes the cumulative distribution function (CDF) of the distribution at x, i.e. P(X ≤ x).
     *
     * @param mean The mean (μ) of the normal distribution.
     * @param stdDev The standard deviation (σ) of the normal distribution. Range: σ ≥ 0.
     * @param x The location at which to compute the cumulative distribution function.
     * @returns The cumulative distribution at {@link x}.
     */
    static cdf(mean: number, stdDev: number, x: number): number {
        if (stdDev < 0) {
            throw new RangeError(
                "Invalid parametrization for the distribution.",
            );
        }

        if (mean === x && stdDev === 0) {
            return 0;
        }

        return 0.5 * ErrorFunction.erfc((mean - x) / (stdDev * Math.SQRT2));
    }

    /**
     * Computes the probability density of the distribution (PDF) at x, i.e. ∂P(X ≤ x)/∂x.
     *
     * In MATLAB, this is known as `normpdf`.
     *
     * @param mean The mean (μ) of the normal distribution.
     * @param stdDev The standard deviation (σ) of the normal distribution. Range: σ ≥ 0.
     * @param x The location at which to compute the density.
     * @returns The density at {@link x}.
     */
    static pdf(mean: number, stdDev: number, x: number): number {
        if (stdDev < 0) {
            throw new RangeError(
                "Invalid parametrization for the distribution.",
            );
        }

        const d = (x - mean) / stdDev;

        return Math.exp(-0.5 * d * d) / (stdDev * Math.sqrt(2 * Math.PI));
    }

    /**
     * Computes the inverse of the cumulative distribution function (InvCDF) for the distribution
     * at the given probability. This is also known as the quantile or percent point function.
     *
     * @param mean The mean (μ) of the normal distribution.
     * @param stdDev The standard deviation (σ) of the normal distribution. Range: σ ≥ 0.
     * @param p The location at which to compute the inverse cumulative density.
     * @returns The inverse cumulative density at `p`.
     */
    static invCDF(mean: number, stdDev: number, p: number): number {
        if (stdDev < 0) {
            throw new RangeError(
                "Invalid parametrization for the distribution.",
            );
        }

        return mean - stdDev * Math.SQRT2 * ErrorFunction.erfcInv(2 * p);
    }
}
