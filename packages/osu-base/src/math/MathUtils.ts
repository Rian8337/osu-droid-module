/**
 * Some math utility functions.
 */
export abstract class MathUtils {
    /**
     * An alternative of {@link Math.min} that does not require a spread operator, making it
     * more efficient for larger arrays.
     *
     * @param values The values to get the minimum from.
     * @returns One of the following:
     * - The minimum value.
     * - 0 if the iterable is empty.
     * - `NaN` if any of the values are `NaN`.
     */
    static min(values: Iterable<number>): number {
        let hasValue = false;
        let min = Number.POSITIVE_INFINITY;

        for (const value of values) {
            hasValue = true;

            if (Number.isNaN(value)) {
                return Number.NaN;
            }

            if (value < min) {
                min = value;
            }
        }

        return hasValue ? min : 0;
    }

    /**
     * An alternative of {@link Math.max} that does not require a spread operator, making it
     * more efficient for larger arrays.
     *
     * @param values The values to get the maximum from.
     * @returns One of the following:
     * - The maximum value.
     * - 0 if the iterable is empty.
     * - `NaN` if any of the values are `NaN`.
     */
    static max(values: Iterable<number>): number {
        let hasValue = false;
        let max = Number.NEGATIVE_INFINITY;

        for (const value of values) {
            hasValue = true;

            if (Number.isNaN(value)) {
                return Number.NaN;
            }

            if (value > max) {
                max = value;
            }
        }

        return hasValue ? max : 0;
    }

    /**
     * Rounds a specified number with specified amount of fractional digits.
     *
     * @param num The number to round.
     * @param fractionalDigits The amount of fractional digits.
     */
    static round(num: number, fractionalDigits: number): number {
        return parseFloat(num.toFixed(fractionalDigits));
    }

    /**
     * Limits the specified number on range `[min, max]`.
     *
     * @param num The number to limit.
     * @param min The minimum range.
     * @param max The maximum range.
     */
    static clamp(num: number, min: number, max: number): number {
        return Math.max(min, Math.min(num, max));
    }

    /**
     * Calculates the standard deviation of given data.
     *
     * @param data The data to calculate.
     */
    static calculateStandardDeviation(data: number[]): number {
        if (data.length === 0) {
            return 0;
        }

        const mean = data.reduce((acc, value) => acc + value) / data.length;

        return Math.sqrt(
            data.reduce((acc, value) => acc + Math.pow(value - mean, 2), 0) /
                data.length,
        );
    }

    /**
     * Converts degrees to radians.
     *
     * @param degrees An angle in degrees.
     * @returns The angle expressed in radians.
     */
    static degreesToRadians(degrees: number): number {
        return (degrees * Math.PI) / 180;
    }

    /**
     * Converts radians to degrees.
     *
     * @param radians An angle in radians.
     * @returns The angle expressed in degrees.
     */
    static radiansToDegrees(radians: number): number {
        return (radians * 180) / Math.PI;
    }

    /**
     * Converts a BPM value to milliseconds.
     *
     * @param bpm The BPM value.
     * @param delimiter The denominator of the time signature. Defaults to 4.
     * @returns The BPM value in milliseconds.
     */
    static bpmToMilliseconds(bpm: number, delimiter = 4): number {
        return 60000 / bpm / delimiter;
    }

    /**
     * Converts milliseconds to BPM.
     *
     * @param milliseconds The milliseconds value.
     * @param delimiter The denominator of the time signature. Defaults to 4.
     * @returns The milliseconds value in BPM.
     */
    static millisecondsToBPM(milliseconds: number, delimiter = 4): number {
        return 60000 / (milliseconds * delimiter);
    }

    /**
     * Calculates an S-shaped {@link https://en.wikipedia.org/wiki/Logistic_function logistic function}.
     *
     * @param exponent The exponent to calculate the function for.
     * @param maxValue The maximum value returnable by the function.
     * @returns The output of the logistic function calculated at `exponent`.
     */
    static logistic(exponent: number, maxValue = 1): number {
        return maxValue / (1 + Math.exp(exponent));
    }

    /**
     * Calculates the p-norm of an n-dimensional vector.
     *
     * @param p The order of the norm.
     * @param coefficients The coefficients of the vector.
     * @returns The p-norm of the vector.
     */
    static norm(p: number, ...coefficients: number[]): number {
        return Math.pow(
            coefficients.reduce((a, v) => a + Math.pow(v, p), 0),
            1 / p,
        );
    }

    /**
     * Calculates an S-shaped {@link https://en.wikipedia.org/wiki/Logistic_function logistic function}
     * with offset at `x`.
     *
     * @param x The value to calculate the function for.
     * @param midpointOffset How much the function midpoint is offset from zero `x`.
     * @param multiplier The growth rate of the function.
     * @param maxValue Maximum value returnable by the function.
     * @returns The output of the logistic function calculated at `x`.
     */
    static offsetLogistic(
        x: number,
        midpointOffset: number,
        multiplier: number,
        maxValue = 1,
    ): number {
        return maxValue / (1 + Math.exp(multiplier * (midpointOffset - x)));
    }

    /**
     * Calculates the {@link https://en.wikipedia.org/wiki/Smoothstep smoothstep} function
     * at `x`.
     *
     * @param x The value to calculate the function for.
     * @param start The `x` value at which the function returns 0.
     * @param end The `x` value at which the function returns 1.
     * @returns The output of the smoothstep function calculated at `x`.
     */
    static smoothstep(x: number, start: number, end: number): number {
        x = this.reverseLerp(x, start, end);

        return x * x * (3 - 2 * x);
    }

    /// <summary>
    ///
    /// </summary>
    /// <param name="x">Value to calculate the function for</param>
    /// <param name="mean">Value of x, for which return value will be the highest (=1)</param>
    /// <param name="width">Range [mean - width, mean + width] where function will change values</param>
    /// <returns>The output of the smoothstep bell curve function of <paramref name="x"/></returns>
    /**
     * Calculates a {@link https://en.wikipedia.org/wiki/Smoothstep smoothstep bell curve} function that returns 1 for `x = mean`,
     * and smoothly reducing it's value to 0 over width.
     *
     * @param x The value to calculate the function for.
     * @param mean The value of x, for which the return value will be the highest (=1).
     * @param width Range `[mean - width, mean + width]` where the function will change values.
     */
    static smoothstepBellCurve(x: number, mean = 0.5, width = 0.5): number {
        x -= mean;
        x = x > 0 ? width - x : width + x;

        return this.smoothstep(x, 0, width);
    }

    /**
     * Calculates the {@link https://en.wikipedia.org/wiki/Smoothstep#Variations smoothstep}
     * function at `x`.
     *
     * @param x The value to calculate the function for.
     * @param start The `x` value at which the function returns 0.
     * @param end The `x` value at which the function returns 1.
     * @returns The output of the smoothstep function calculated at `x`.
     */
    static smootherstep(x: number, start: number, end: number): number {
        x = this.reverseLerp(x, start, end);

        return x * x * x * (x * (6 * x - 15) + 10);
    }

    /**
     * Calculates the reverse {@link https://en.wikipedia.org/wiki/Linear_interpolation linear interpolation}
     * function at `x`.
     *
     * @param x The value to calculate the function for.
     * @param start The `x` value at which the function returns 0.
     * @param end The `x` value at which the function returns 1.
     * @returns The output of the reverse lerp function calculated at `x`.
     */
    static reverseLerp(x: number, start: number, end: number): number {
        return this.clamp((x - start) / (end - start), 0, 1);
    }
}
