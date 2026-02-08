import { MathUtils, Polynomial } from "@rian8337/osu-base";

/**
 * Represents a polynomial fitted to a given set of points.
 */
export abstract class PolynomialPenaltyUtils {
    /**
     * Precalculated matrix used for curve fitting.
     */
    static readonly matrix = [
        [0, -25.8899, -32.6909, -11.9147, 48.8588, -26.8943, 0],
        [0, 51.7787, 66.595, 28.8517, -90.3185, 40.9864, 0],
        [0, -31.5028, -41.7398, -22.7118, 46.438, -15.5156, 0],
    ] as const;

    /**
     * The proportions of skill that this polynomial will fit a curve to the miss counts of.
     *
     * Changing these will require a recomputation of {@link matrix}, as it is precomputed
     * to fit these specific values.
     */
    static readonly skillProportions = [
        1, 0.95, 0.9, 0.8, 0.6, 0.3, 0,
    ] as const;

    /**
     * Creates a polynomial curve that maps miss counts to miss penalties. This is used to
     * smoothly interpolate between miss counts, with 0 misses fixed to 0% penalty and all
     * misses fixed to 100% penalty.
     *
     * @param missCounts A mapping of skill proportions to miss counts a player would achieve
     * at that skill proportion. See comment on {@link skillProportions} for custom skill
     * proportions.
     * @returns The coefficients of the fitted polynomial, in decreasing order of degree.
     */
    static getPenaltyCoefficients(missCounts: Map<number, number>): number[] {
        const endPoint = MathUtils.max(missCounts.values());

        const sortedSkillProportions = [...missCounts.keys()].sort(
            (a, b) => b - a,
        );

        const coefficients = new Array<number>(4);

        coefficients[3] = endPoint;

        // Now we dot product the adjusted miss counts with the matrix.
        for (let row = 0; row < this.matrix.length; ++row) {
            for (let column = 0; column < this.matrix[row].length; ++column) {
                const skillProportion = sortedSkillProportions[column];
                const missCountAtSkill =
                    missCounts.get(skillProportion) ?? endPoint;

                coefficients[row] +=
                    this.matrix[row][column] *
                    (missCountAtSkill - endPoint * (1 - skillProportion));
            }

            coefficients[3] -= coefficients[row];
        }

        return coefficients;
    }

    /**
     * Calculates the percentage penalty that a player should receive for missing.
     *
     * @param coefficients The coefficients of the polynomial, in decreasing order of degree.
     * @param missCount The number of misses the player had.
     * @returns A value between 0 and 1 representing the penalty percentage, where 0 means no penalty and 1 means full penalty.
     */
    static getPenaltyAt(
        coefficients: readonly number[],
        missCount: number,
    ): number {
        // Our first coefficients are the ones derived from the skill proportion miss counts,
        // and subtracting missCount for the last one sets our root to the corresponding penalty.
        const xVals = Polynomial.solve(coefficients.concat(-missCount));

        const maxError = 1e-7;

        // This will never happen (it is physically impossible for there to not be a root),
        // but in the interest of sanity we fall back to a 100% penalty if no roots were found.
        const largestValue =
            xVals
                .filter(
                    (x): x is number =>
                        x !== null && x >= 0 - maxError && x <= 1 + maxError,
                )
                .sort((a, b) => b - a)
                .at(0) ?? 1;

        return MathUtils.clamp(largestValue, 0, 1);
    }
}
