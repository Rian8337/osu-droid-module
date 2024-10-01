import { RootBounds } from "./RootBounds";

export abstract class ZeroCrossingBracketing {
    /**
     * Detect a range containing at least one root.
     *
     * This iterative method stops when two values with opposite signs are found.
     *
     * @param f The function to detect roots from.
     * @param bounds The upper and lower value of the range.
     * @param factor The growing factor of research. Defaults to 1.6.
     * @param maxIterations Maximum number of iterations. Defaults to 50.
     * @returns Whether the bracketing operation succeeded.
     */
    static expand(
        f: (x: number) => number,
        bounds: RootBounds,
        factor: number = 1.6,
        maxIterations: number = 50,
    ): boolean {
        const originalUpperBound = bounds.upperBound;
        const originalLowerBound = bounds.lowerBound;

        if (originalLowerBound >= originalUpperBound) {
            throw new RangeError(
                "Upper bound must be greater than lower bound.",
            );
        }

        let fmin = f(originalLowerBound);
        let fmax = f(originalUpperBound);

        for (let i = 0; i < maxIterations; ++i) {
            if (Math.sign(fmin) !== Math.sign(fmax)) {
                return true;
            }

            if (Math.abs(fmin) < Math.abs(fmax)) {
                bounds.lowerBound +=
                    factor * (bounds.lowerBound - bounds.upperBound);
                fmin = f(bounds.lowerBound);
            } else {
                bounds.upperBound +=
                    factor * (bounds.upperBound - bounds.lowerBound);
                fmax = f(bounds.upperBound);
            }
        }

        bounds.lowerBound = originalLowerBound;
        bounds.upperBound = originalUpperBound;

        return false;
    }

    static reduce(
        f: (x: number) => number,
        bounds: RootBounds,
        subdivisions: number = 1000,
    ): boolean {
        const originalUpperBound = bounds.upperBound;
        const originalLowerBound = bounds.lowerBound;

        if (originalLowerBound >= originalUpperBound) {
            throw new RangeError(
                "Upper bound must be greater than lower bound.",
            );
        }

        // TODO: Consider binary-style search instead of linear scan
        const fmin = f(bounds.lowerBound);
        const fmax = f(bounds.upperBound);

        if (Math.sign(fmin) != Math.sign(fmax)) {
            return true;
        }

        const subdiv = (bounds.upperBound - bounds.lowerBound) / subdivisions;
        let smin = bounds.lowerBound;
        const sign = Math.sign(fmin);

        for (let i = 0; i < subdivisions; ++i) {
            const smax = smin + subdiv;
            const sfmax = f(smax);

            if (!Number.isFinite(sfmax)) {
                // expand interval to include pole
                smin = smax;
                continue;
            }

            if (Math.sign(sfmax) != sign) {
                bounds.upperBound = smax;
                bounds.lowerBound = smin;
                return true;
            }

            smin = smax;
        }

        bounds.lowerBound = originalLowerBound;
        bounds.upperBound = originalUpperBound;

        return false;
    }

    static expandReduce(
        f: (x: number) => number,
        bounds: RootBounds,
        expansionFactor: number = 1.6,
        expansionMaxIterations: number = 50,
        reduceSubdivisions: number = 100,
    ): boolean {
        return (
            this.expand(f, bounds, expansionFactor, expansionMaxIterations) ||
            this.reduce(f, bounds, reduceSubdivisions)
        );
    }
}
