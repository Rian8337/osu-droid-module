/**
 * Options for Chandrupatla's root-finding algorithm.
 */
export interface ChandrupatlaOptions {
    /**
     * The maximum number of iterations before the algorithm throws an error. Defaults to 25.
     */
    readonly maxIterations?: number;

    /**
     * The desired precision in which the root is returned. Defaults to 1e-6.
     */
    readonly accuracy?: number;

    /**
     * The multiplier on the upper bound when no root is found within the provided bounds. Defaults to 2.
     */
    readonly expansionFactor?: number;

    /**
     * The maximum number of times the bounds of the function should increase. Defaults to 32.
     */
    readonly maxExpansions?: number;
}

/**
 * {@link https://www.sciencedirect.com/science/article/abs/pii/S0965997896000518?via%3Dihub Chandrupatla}'s root-finding algorithm.
 */
export abstract class Chandrupatla {
    /**
     * Finds the root of a function using {@link https://www.sciencedirect.com/science/article/abs/pii/S0965997896000518?via%3Dihub Chandrupatla}'s
     * method, expanding the bounds if the root is not located within.
     *
     * Expansion only occurs for the upward bound, as this function is optimized for functions of range [0, x), which is
     * useful for finding positive roots.
     *
     * @param f The function of which to find the root.
     * @param guessLowerBound The lower bound of the function inputs.
     * @param guessUpperBound The upper bound of the function inputs.
     * @param options Options for the root-finding algorithm.
     * @returns The root of the function.
     */
    static findRootExpand(
        f: (x: number) => number,
        guessLowerBound: number,
        guessUpperBound: number,
        options?: ChandrupatlaOptions,
    ): number {
        const {
            maxIterations = 25,
            accuracy = 1e-6,
            expansionFactor = 2,
            maxExpansions = 32,
        } = options ?? {};

        let a = guessLowerBound;
        let b = guessUpperBound;
        let fa = f(a);
        let fb = f(b);

        let expansions = 0;

        while (fa * fb > 0) {
            a = b;
            b *= expansionFactor;
            fa = fb;
            fb = f(b);

            ++expansions;

            if (expansions > maxExpansions) {
                throw new Error(
                    "Chandrupatla: Maximum number of expansions exceeded.",
                );
            }
        }

        let t = 0.5;

        for (let i = 0; i < maxIterations; ++i) {
            const xt = a + t * (b - a);
            const ft = f(xt);

            let c: number;
            let fc: number;

            if (Math.sign(ft) == Math.sign(fa)) {
                c = a;
                fc = fa;
            } else {
                c = b;
                b = a;
                fc = fb;
                fb = fa;
            }

            a = xt;
            fa = ft;

            let xm: number;
            let fm: number;

            if (Math.abs(fa) < Math.abs(fb)) {
                xm = a;
                fm = fa;
            } else {
                xm = b;
                fm = fb;
            }

            if (fm == 0) {
                return xm;
            }

            const tol = 2 * accuracy * Math.abs(xm) + 2 * accuracy;
            const tlim = tol / Math.abs(b - c);

            if (tlim > 0.5) {
                return xm;
            }

            const chi = (a - b) / (c - b);
            const phi = (fa - fb) / (fc - fb);
            const iqi = phi * phi < chi && (1 - phi) * (1 - phi) < chi;

            if (iqi) {
                t =
                    ((fa / (fb - fa)) * fc) / (fb - fc) +
                    (((((c - a) / (b - a)) * fa) / (fc - fa)) * fb) / (fc - fb);
            } else {
                t = 0.5;
            }

            t = Math.min(1 - tlim, Math.max(tlim, t));
        }

        return 0;
    }
}
