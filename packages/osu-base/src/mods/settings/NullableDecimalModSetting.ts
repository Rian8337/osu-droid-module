import { MathUtils } from "../../math/MathUtils";
import {
    describeType,
    isFiniteNumber,
    validateNumericConstraints,
} from "./ModSettingValidation";
import { RangeConstrainedModSetting } from "./RangeConstrainedModSetting";
import { ModValidationIssueType } from "../ModValidationIssueType";
import { ModSettingValidationIssue } from "./ModSettingValidationIssue";

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
        key: string | null,
        description: string,
        defaultValue: number | null,
        min = -Number.MAX_VALUE,
        max = Number.MAX_VALUE,
        step = 0,
        precision: number | null = null,
    ) {
        super(name, key, description, defaultValue, min, max, step);

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

        const stepped =
            this.step! > 0
                ? Math.round(value / this.step!) * this.step!
                : value;

        const processedValue = MathUtils.clamp(stepped, this.min!, this.max!);

        if (this.precision !== null) {
            return parseFloat(processedValue.toFixed(this.precision));
        }

        return processedValue;
    }

    override *validate(
        settings: Readonly<Record<string, unknown>>,
    ): Generator<ModSettingValidationIssue, void, undefined> {
        const value = this.getSerializedValue(settings);

        if (value !== undefined) {
            yield* this.validateValue(value);
        }
    }

    /**
     * Validates a serialized scalar value of this `NullableDecimalModSetting`.
     *
     * @param value The value to validate.
     * @yields A message for each issue found.
     */
    protected *validateValue(
        value: unknown,
    ): Generator<ModSettingValidationIssue, void, undefined> {
        if (value === null) {
            return;
        }

        if (!isFiniteNumber(value)) {
            yield {
                type: ModValidationIssueType.InvalidType,
                message: `expected a finite number or null, got ${describeType(value)}`,
            };
            return;
        }

        yield* validateNumericConstraints(value, {
            min: this.min!,
            max: this.max!,
            step: this.step!,
            precision: this.precision,
            integer: false,
            processValue: (v) => this.processValue(v)!,
        });
    }

    override load(settings: Record<string, unknown>): void {
        if (this.key === null) {
            return;
        }

        const stored = settings[this.key];

        if (stored === null || stored === undefined) {
            this.value = null;
        } else if (typeof stored === "number") {
            this.value = stored;
        }
    }

    override save(settings: Record<string, unknown>): void {
        if (this.key !== null) {
            settings[this.key] = this.value;
        }
    }
}
