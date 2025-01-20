/**
 * Some math utility functions.
 */
export abstract class MathUtils {
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
