import { Precision } from "../utils/Precision";
import { RootBounds } from "./RootBounds";
import { ZeroCrossingBracketing } from "./ZeroCrossingBracketing";

/**
 * Algorithm by Brent, Van Wijngaarden, Dekker et al.
 *
 * Implementation inspired by Press, Teukolsky, Vetterling, and Flannery, "Numerical Recipes in C", 2nd edition, Cambridge University Press.
 */
export abstract class Brent {
    /**
     * Finds a solution to the equation f(x) = 0.
     *
     * @param f The function to find roots from.
     * @param bounds The upper and lower root bounds.
     * @param accuracy The desired accuracy. The root will be refined until the accuracy or the maximum number of iterations is reached. Defaults to 1e-8. Must be greater than 0.
     * @param maxIterations The maximum number of iterations. Defaults to 100.
     * @param expandFactor The factor at which to expand the bounds, if needed. Defaults to 1.6.
     * @param maxExpandIterations The maximum number of expand iterations. Defaults to 100.
     * @returns The root with the specified accuracy. Throws an error if the algorithm failed to converge.
     */
    static findRootExpand(
        f: (x: number) => number,
        bounds: RootBounds,
        accuracy: number = 1e-8,
        maxIterations: number = 100,
        expandFactor: number = 1.6,
        maxExpandIterations: number = 100
    ): number {
        ZeroCrossingBracketing.expandReduce(
            f,
            bounds,
            expandFactor,
            maxExpandIterations,
            maxExpandIterations * 10
        );
        return this.findRoot(f, bounds, accuracy, maxIterations);
    }

    /**
     * Finds a solution to the equation f(x) = 0.
     *
     * @param f The function to find roots from.
     * @param bounds The upper and lower root bounds.
     * @param accuracy The desired accuracy. The root will be refined until the accuracy or the maximum number of iterations is reached. Defaults to 1e-8. Must be greater than 0.
     * @param maxIterations The maximum number of iterations. Defaults to 100.
     * @returns The root with the specified accuracy. Throws an error if the algorithm failed to converge.
     */
    static findRoot(
        f: (x: number) => number,
        bounds: RootBounds,
        accuracy: number = 1e-8,
        maxIterations: number = 100
    ): number {
        const root: number | null = this.tryFindRoot(
            f,
            bounds,
            accuracy,
            maxIterations
        );

        if (root === null) {
            throw new Error(
                "The algorithm has failed, exceeded the number of iterations allowed or there is no root within the provided bounds."
            );
        }

        return root;
    }

    /**
     * Finds a solution to the equation f(x) = 0.
     *
     * @param f The function to find roots from.
     * @param bounds The upper and lower root bounds.
     * @param accuracy The desired accuracy. The root will be refined until the accuracy or the maximum number of iterations is reached. Must be greater than 0.
     * @param maxIterations The maximum number of iterations. Usually 100.
     * @returns The root with the specified accuracy, `null` if not found.
     */
    static tryFindRoot(
        f: (x: number) => number,
        bounds: RootBounds,
        accuracy: number,
        maxIterations: number
    ): number | null {
        if (accuracy <= 0) {
            throw new RangeError("Accuracy must be greater than 0.");
        }

        let { lowerBound, upperBound } = bounds;

        let fmin: number = f(lowerBound);
        let fmax: number = f(upperBound);
        let froot: number = fmax;
        let d: number = 0;
        let e: number = 0;

        let root: number = upperBound;
        let xMid: number = Number.NaN;

        // Root must be bracketed.
        if (Math.sign(fmin) === Math.sign(fmax)) {
            return null;
        }

        for (let i = 0; i <= maxIterations; ++i) {
            // Adjust bounds.
            if (Math.sign(froot) === Math.sign(fmax)) {
                upperBound = lowerBound;
                fmax = fmin;
                e = d = root - lowerBound;
            }

            if (Math.abs(fmax) < Math.abs(froot)) {
                lowerBound = root;
                root = upperBound;
                upperBound = lowerBound;
                fmin = froot;
                froot = fmax;
                fmax = fmin;
            }

            // Convergence check
            const xAcc1: number =
                2 * Math.pow(2, -53) * Math.abs(root) + accuracy / 2;
            const xMidOld: number = xMid;
            xMid = (upperBound - root) / 2;

            if (
                Math.abs(xMid) <= xAcc1 ||
                Precision.almostEqualNormRelative(froot, 0, froot, accuracy)
            ) {
                return root;
            }

            if (xMid === xMidOld) {
                // accuracy not sufficient, but cannot be improved further
                return null;
            }

            if (Math.abs(e) >= xAcc1 && Math.abs(fmin) > Math.abs(froot)) {
                // Attempt inverse quadratic interpolation
                const s: number = froot / fmin;
                let p: number;
                let q: number;
                if (Precision.almostEqualRelative(lowerBound, upperBound)) {
                    p = 2 * xMid * s;
                    q = 1 - s;
                } else {
                    q = fmin / fmax;
                    const r: number = froot / fmax;
                    p =
                        s *
                        (2 * xMid * q * (q - r) -
                            (root - lowerBound) * (r - 1));
                    q = (q - 1) * (r - 1) * (s - 1);
                }

                if (p > 0) {
                    // Check whether in bounds
                    q = -q;
                }

                p = Math.abs(p);

                if (
                    2 * p <
                    Math.min(
                        3 * xMid * q - Math.abs(xAcc1 * q),
                        Math.abs(e * q)
                    )
                ) {
                    // Accept interpolation
                    e = d;
                    d = p / q;
                } else {
                    // Interpolation failed, use bisection
                    d = xMid;
                    e = d;
                }
            } else {
                // Bounds decreasing too slowly, use bisection
                d = xMid;
                e = d;
            }

            lowerBound = root;
            fmin = froot;

            if (Math.abs(d) > xAcc1) {
                root += d;
            } else {
                root += this.sign(xAcc1, xMid);
            }

            froot = f(root);
        }

        return null;
    }

    /**
     * Helper method useful for preventing rounding errors.
     *
     * @returns a * sign(b)
     */
    static sign(a: number, b: number): number {
        return b >= 0 ? (a >= 0 ? a : -a) : a >= 0 ? -a : a;
    }
}
