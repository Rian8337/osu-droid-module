import { Easing } from "../constants/Easing";
import { MathUtils } from "./MathUtils";
import { Vector2 } from "./Vector2";

/**
 * Holds interpolation methods for numbers and vectors.
 */
export abstract class Interpolation {
    /**
     * Performs a linear interpolation of numbers.
     *
     * @param start The starting point of the interpolation.
     * @param final The final point of the interpolation.
     * @param amount The interpolation multiplier.
     * @returns The interpolated value.
     */
    static lerp(start: number, final: number, amount: number): number;

    /**
     * Performs a linear interpolation of vectors.
     *
     * @param start The starting point of the interpolation.
     * @param final The final point of the interpolation.
     * @param amount The interpolation multiplier.
     * @returns The interpolated vector.
     */
    static lerp(start: Vector2, final: Vector2, amount: number): Vector2;

    static lerp(
        start: number | Vector2,
        final: number | Vector2,
        amount: number,
    ): number | Vector2 {
        if (start instanceof Vector2 && final instanceof Vector2) {
            return new Vector2(
                this.lerp(start.x, final.x, amount),
                this.lerp(start.y, final.y, amount),
            );
        } else {
            return (
                (start as number) +
                ((final as number) - (start as number)) * amount
            );
        }
    }

    /**
     * Calculates the reverse [linear interpolation](https://en.wikipedia.org/wiki/Linear_interpolation)
     * function at `x`.
     *
     * @param x The value to calculate the function for.
     * @param start The `x` value at which the function returns 0.
     * @param end The `x` value at which the function returns 1.
     * @return The output of the reverse linear interpolation function calculated at `x`.
     */
    static reverseLerp(x: number, start: number, end: number): number {
        return MathUtils.clamp((x - start) / (end - start), 0, 1);
    }

    /**
     * Interpolates a value using an easing function.
     *
     * @param easing The easing function to use.
     * @param t The progress of the interpolation, from 0 to 1.
     * @returns The interpolated value.
     */
    static easing(easing: Easing, t: number): number {
        switch (easing) {
            case Easing.none:
                return t;

            case Easing.out:
            case Easing.outQuad:
                return t * (2 - t);

            case Easing.in:
            case Easing.inQuad:
                return t * t;

            case Easing.inOutQuad:
                return t < 0.5 ? t * t * 2 : --t * t * -2 + 1;

            case Easing.inCubic:
                return t * t * t;

            case Easing.outCubic:
                return --t * t * t + 1;

            case Easing.inOutCubic:
                return t < 0.5 ? t * t * t * 4 : --t * t * t * 4 + 1;

            case Easing.inQuart:
                return t * t * t * t;

            case Easing.outQuart:
                return 1 - --t * t * t * t;

            case Easing.inOutQuart:
                return t < 0.5 ? t * t * t * t * 8 : --t * t * t * t * -8 + 1;

            case Easing.inQuint:
                return t * t * t * t * t;

            case Easing.outQuint:
                return --t * t * t * t * t + 1;

            case Easing.inOutQuint:
                return t < 0.5
                    ? t * t * t * t * t * 16
                    : --t * t * t * t * t * 16 + 1;

            case Easing.inSine:
                return 1 - Math.cos((t * Math.PI) / 2);

            case Easing.outSine:
                return Math.sin((t * Math.PI) / 2);

            case Easing.inOutSine:
                return 0.5 - 0.5 * Math.cos(Math.PI * t);

            case Easing.inExpo:
                return t === 0 ? 0 : Math.pow(2, 10 * t - 10);

            case Easing.outExpo:
                return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

            case Easing.inOutExpo:
                if (t === 0) {
                    return 0;
                }

                if (t === 1) {
                    return 1;
                }

                if ((t *= 2) < 1) {
                    return 0.5 * Math.pow(2, 10 * t - 10);
                }

                return 0.5 * (2 - Math.pow(2, -10 * --t));

            case Easing.inCirc:
                return 1 - Math.sqrt(1 - t * t);

            case Easing.outCirc:
                return Math.sqrt(1 - --t * t);

            case Easing.inOutCirc:
                return (t *= 2) < 1
                    ? 0.5 - 0.5 * Math.sqrt(1 - t * t)
                    : 0.5 * Math.sqrt(1 - (t -= 2) * t) + 0.5;

            case Easing.inElastic:
                return (
                    -Math.pow(2, -10 + 10 * t) *
                    Math.sin((1 - 0.3 / 4 - t) * ((2 * Math.PI) / 0.3))
                );

            case Easing.outElastic:
                return (
                    Math.pow(2, -10 * t) *
                        Math.sin((t - 0.3 / 4) * ((2 * Math.PI) / 0.3)) +
                    1
                );

            case Easing.outElasticHalf:
                return (
                    Math.pow(2, -10 * t) *
                        Math.sin((0.5 * t - 0.3 / 4) * ((2 * Math.PI) / 0.3)) +
                    1
                );

            case Easing.outElasticQuarter:
                return (
                    Math.pow(2, -10 * t) *
                        Math.sin((0.25 * t - 0.3 / 4) * ((2 * Math.PI) / 0.3)) +
                    1
                );

            case Easing.inOutElastic:
                if (t === 0) {
                    return 0;
                }

                if (t === 1) {
                    return 1;
                }

                if ((t *= 2) < 1) {
                    return (
                        -0.5 *
                        Math.pow(2, -10 + 10 * t) *
                        Math.sin(
                            ((1 - (0.3 / 4) * 1.5 - t) *
                                ((2 * Math.PI) / 0.3)) /
                                1.5,
                        )
                    );
                }

                return (
                    0.5 *
                        Math.pow(2, -10 * --t) *
                        Math.sin(
                            ((t - (0.3 / 4) * 1.5) * ((2 * Math.PI) / 0.3)) /
                                1.5,
                        ) +
                    1
                );

            case Easing.inBack:
                return t * t * ((1.70158 + 1) * t - 1.70158);

            case Easing.outBack:
                return --t * t * ((1.70158 + 1) * t + 1.70158) + 1;

            case Easing.inOutBack:
                return (t *= 2) < 1
                    ? 0.5 *
                          t *
                          t *
                          ((1.70158 * 1.525 + 1) * t - 1.70158 * 1.525)
                    : 0.5 *
                          ((t -= 2) *
                              t *
                              ((1.70158 * 1.525 + 1) * t + 1.70158 * 1.525) +
                              2);

            case Easing.inBounce:
                t = 1 - t;

                if (t < 1 / 2.75) {
                    return 1 - 7.5625 * t * t;
                }

                if (t < 2 / 2.75) {
                    return 1 - (7.5625 * (t -= 1.5 / 2.75) * t + 0.75);
                }

                if (t < 2.5 / 2.75) {
                    return 1 - (7.5625 * (t -= 2.25 / 2.75) * t + 0.9375);
                }

                return 1 - (7.5625 * (t -= 2.625 / 2.75) * t + 0.984375);

            case Easing.outBounce:
                if (t < 1 / 2.75) {
                    return 7.5625 * t * t;
                }

                if (t < 2 / 2.75) {
                    return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
                }

                if (t < 2.5 / 2.75) {
                    return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
                }

                return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;

            case Easing.inOutBounce:
                return t < 0.5
                    ? 0.5 - 0.5 * this.easing(Easing.outBounce, 1 - t * 2)
                    : 0.5 * this.easing(Easing.outBounce, (t - 0.5) * 2) + 0.5;

            case Easing.outPow10:
                return --t * Math.pow(t, 10) + 1;
        }
    }
}
