import { MathUtils } from "./MathUtils";
import { NormalDistribution } from "./NormalDistribution";

/**
 * Approximation of the {@link https://en.wikipedia.org/wiki/Poisson_binomial_distribution Poisson binomial distribution}, which can be
 * updated iteratively.
 *
 * For the approximation method, see "Refined Normal Approximation (RNA)" from:
 *
 * {@link https://www.researchgate.net/publication/257017356_On_computing_the_distribution_function_for_the_Poisson_binomial_distribution Hong, Y. (2013). On computing the distribution function for the Poisson binomial distribution. Computational Statistics and Data Analysis, Vol. 59, pp. 41-51}.
 *
 * This has been verified against a reference implementation provided by the authors in the R package "poibin",
 * which can be viewed {@link https://rdrr.io/cran/poibin/man/poibin-package.html here}.
 */
export class IterativePoissonBinomial {
    private mu = 0;
    private var = 0;
    private gamma = 0;

    /**
     * Adds a new trial with the provided probability of success to the distribution.
     *
     * @param p The probability of success for the new trial.
     */
    addProbability(p: number) {
        this.mu += p;
        this.var += p * (1 - p);
        this.gamma += p * (1 - p) * (1 - 2 * p);
    }

    /**
     * Adds multiple trials with the same probability of success to the distribution.
     *
     * @param p The probability of success for the new trials.
     * @param count The number of trials to add.
     */
    addBinnedProbabilities(p: number, count: number) {
        this.mu += p * count;
        this.var += p * (1 - p) * count;
        this.gamma += p * (1 - p) * (1 - 2 * p) * count;
    }

    /**
     * Computes the value of the cumulative distribution function for this distribution.
     *
     * @param count The argument of the CDF to sample the distribution for. In the discrete case (when it is a whole number),
     * this corresponds to the number of successful Bernoulli trials to query the CDF for.
     * @returns The value of CDF at {@link count}. In the discrete case, this corresponds to the probability that at most
     * {@link count} Bernoulli trials ended in a success.
     */
    cdf(count: number): number {
        if (this.var === 0) {
            return this.mu <= count ? 1 : 0;
        }

        const sigma = Math.sqrt(this.var);
        const v = this.gamma / (6 * Math.pow(sigma, 3));
        const k = (count + 0.5 - this.mu) / sigma;

        const result =
            NormalDistribution.cdf(0, 1, k) +
            v * (1 - k * k) * NormalDistribution.pdf(0, 1, k);

        return MathUtils.clamp(result, 0, 1);
    }

    /**
     * Resets the distribution to an empty state.
     */
    reset() {
        this.mu = 0;
        this.var = 0;
        this.gamma = 0;
    }
}
