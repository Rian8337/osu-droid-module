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
                "Invalid parametrization for the distribution."
            );
        }

        return mean - stdDev * Math.SQRT2 * ErrorFunction.erfcInv(2 * p);
    }
}
