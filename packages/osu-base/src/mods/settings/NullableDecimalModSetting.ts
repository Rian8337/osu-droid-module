import { MathUtils } from "../../math/MathUtils";
import { RangeConstrainedModSetting } from "./RangeConstrainedModSetting";

/**
 * Represents a `Mod` specific setting that is constrained to a number of values.
 *
 * The value can be `null`, which is treated as a special case.
 */
export class NullableDecimalModSetting extends RangeConstrainedModSetting<
    number | null
> {
    /**
     * The number of decimal places to round the value to.
     *
     * When set to `null`, the value will not be rounded.
     */
    readonly precision: number | null;

    override readonly displayFormatter = (v: number | null) =>
        v?.toString() ?? "None";

    constructor(
        name: string,
        defaultValue: number | null,
        min = -Number.MAX_VALUE,
        max = Number.MAX_VALUE,
        step = 0,
        precision: number | null = null,
    ) {
        super(name, defaultValue, min, max, step);

        if (min > max) {
            throw new RangeError(
                `The minimum value (${min}) must be less than or equal to the maximum value (${max}).`,
            );
        }

        if (step < 0) {
            throw new RangeError(
                `The step size (${step}) must be greater than or equal to 0.`,
            );
        }

        if (
            defaultValue !== null &&
            (defaultValue < min || defaultValue > max)
        ) {
            throw new RangeError(
                `The default value (${defaultValue}) must be between the minimum (${min}) and maximum (${max}) values.`,
            );
        }

        this.precision = precision;
    }

    protected override processValue(value: number | null): number | null {
        if (value === null) {
            return null;
        }

        const processedValue = MathUtils.clamp(
            Math.round(value / this.step!) * this.step!,
            this.min!,
            this.max!,
        );

        if (this.precision !== null) {
            return parseFloat(processedValue.toFixed(this.precision));
        }

        return processedValue;
    }
}
