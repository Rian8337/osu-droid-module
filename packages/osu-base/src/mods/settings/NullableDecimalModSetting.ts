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
    private _precision: number | null;

    /**
     * The number of decimal places to round the value to.
     *
     * When set to `null`, the value will not be rounded.
     */
    get precision(): number | null {
        return this._precision;
    }

    set precision(value: number | null) {
        if (value !== null && value < 0) {
            throw new RangeError(
                `The precision (${value.toString()}) must be greater than or equal to 0.`,
            );
        }

        this._precision = value;

        if (value !== null) {
            this.value = this.processValue(this.value);
        }
    }

    override readonly displayFormatter = (v: number | null): string => {
        if (v === null) {
            return "None";
        }

        if (this.precision !== null) {
            return v.toFixed(this.precision);
        }

        return super.toDisplayString();
    };

    constructor(
        name: string,
        description: string,
        defaultValue: number | null,
        min = -Number.MAX_VALUE,
        max = Number.MAX_VALUE,
        step = 0,
        precision: number | null = null,
    ) {
        super(name, description, defaultValue, min, max, step);

        if (min > max) {
            throw new RangeError(
                `The minimum value (${min.toString()}) must be less than or equal to the maximum value (${max.toString()}).`,
            );
        }

        if (step < 0) {
            throw new RangeError(
                `The step size (${step.toString()}) must be greater than or equal to 0.`,
            );
        }

        if (
            defaultValue !== null &&
            (defaultValue < min || defaultValue > max)
        ) {
            throw new RangeError(
                `The default value (${defaultValue.toString()}) must be between the minimum (${min.toString()}) and maximum (${max.toString()}) values.`,
            );
        }

        this._precision = precision;
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
