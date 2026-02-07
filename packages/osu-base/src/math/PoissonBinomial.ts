import { Bin } from "./Bin";
import { MathUtils } from "./MathUtils";
import { NormalDistribution } from "./NormalDistribution";

/**
 * Approximation of the {@link https://en.wikipedia.org/wiki/Poisson_binomial_distribution Poisson binomial distribution}.
 *
 * For the approximation method, see "Refined Normal Approximation (RNA)" from:
 *
 * {@link https://www.researchgate.net/publication/257017356_On_computing_the_distribution_function_for_the_Poisson_binomial_distribution Hong, Y. (2013). On computing the distribution function for the Poisson binomial distribution. Computational Statistics and Data Analysis, Vol. 59, pp. 41-51}.
 *
 * This has been verified against a reference implementation provided by the authors in the R package "poibin",
 * which can be viewed {@link https://rdrr.io/cran/poibin/man/poibin-package.html here}.
 */
export class PoissonBinomial {
    /**
     * The expected value of the distribution.
     */
    private readonly mu: number;

    /**
     * The standard deviation of the distribution.
     */
    private readonly sigma: number;

    /**
     * The gamma factor from equation (11) in the cited paper, pre-divided by 6 to save on recomputation.
     */
    private readonly v: number;

    /**
     * Creates a new Poisson binomial distribution based on N trials with the provided list or bins of
     * difficulties, skill, and method for getting the miss probabilities.
     *
     * @param difficulties The list or bins of difficulties.
     * @param skill The skill level to get the miss probabilities with.
     * @param hitProbability The method for converting difficulties and skill into miss probabilities.
     */
    constructor(
        difficulties: readonly Bin[] | readonly number[],
        skill: number,
        hitProbability: (skill: number, difficulty: number) => number,
    ) {
        this.mu = 0;

        let variance = 0;
        let gamma = 0;

        for (const d of difficulties) {
            if (d instanceof Bin) {
                const p = 1 - hitProbability(skill, d.difficulty);

                this.mu += p * d.noteCount;
                variance += p * (1 - p) * d.noteCount;
                gamma += p * (1 - p) * (1 - 2 * p) * d.noteCount;
            } else {
                const p = 1 - hitProbability(skill, d);

                this.mu += p;
                variance += p * (1 - p);
                gamma += p * (1 - p) * (1 - 2 * p);
            }
        }

        this.sigma = Math.sqrt(variance);
        this.v = gamma / (6 * Math.pow(this.sigma, 3));
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
        if (this.sigma === 0) {
            return 1;
        }

        const k = (count + 0.5 - this.mu) / this.sigma;

        // See equation (14) of the cited paper.
        const result =
            NormalDistribution.cdf(0, 1, k) +
            this.v * (1 - k * k) * NormalDistribution.pdf(0, 1, k);

        return MathUtils.clamp(result, 0, 1);
    }
}
