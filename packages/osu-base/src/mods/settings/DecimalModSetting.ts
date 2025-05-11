import { NumberModSetting } from "./NumberModSetting";

/**
 * Represents a `Mod` specific setting that is constrained to a range of decimal values.
 */
export class DecimalModSetting extends NumberModSetting {
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
                `The precision (${value}) must be greater than or equal to 0.`,
            );
        }

        this._precision = value;

        if (value !== null) {
            this.value = this.processValue(this.value);
        }
    }

    override readonly displayFormatter = (v: number): string => {
        if (this.precision !== null) {
            return v.toFixed(this.precision);
        }

        return super.toDisplayString();
    };

    constructor(
        name: string,
        description: string,
        defaultValue: number,
        min = -Number.MAX_VALUE,
        max = Number.MAX_VALUE,
        step = 0,
        precision: number | null = null,
    ) {
        super(name, description, defaultValue, min, max, step);

        if (precision !== null && precision < 0) {
            throw new RangeError(
                `The precision (${precision}) must be greater than or equal to 0.`,
            );
        }

        this._precision = precision;
    }

    protected override processValue(value: number): number {
        const processedValue = super.processValue(value);

        if (this.precision !== null) {
            return parseFloat(processedValue.toFixed(this.precision));
        }

        return processedValue;
    }
}
