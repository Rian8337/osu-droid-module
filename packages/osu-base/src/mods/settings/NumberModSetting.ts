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
 */
export class NumberModSetting extends RangeConstrainedModSetting<number> {
    override readonly displayFormatter = (v: number) => v.toString();

    constructor(
        name: string,
        key: string | null,
        description: string,
        defaultValue: number,
        min: number,
        max: number,
        step: number,
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

        if (defaultValue < min || defaultValue > max) {
            throw new RangeError(
                `The default value (${defaultValue.toString()}) must be between the minimum (${min.toString()}) and maximum (${max.toString()}) values.`,
            );
        }
    }

    override load(settings: Record<string, unknown>): void {
        if (this.key === null) {
            return;
        }

        const stored = settings[this.key];

        if (typeof stored === "number") {
            this.value = stored;
        }
    }

    /**
     * The number of decimal places that valid values are rounded to, or `null` if they are not rounded.
     *
     * This only exposes the `precision` of subclasses that have one (such as `DecimalModSetting`) to
     * validation, as `NumberModSetting` itself has no notion of precision.
     */
    // eslint-disable-next-line @typescript-eslint/class-literal-property-style
    protected get validationPrecision(): number | null {
        return null;
    }

    /**
     * Whether valid values must be integers.
     */
    protected readonly requiresInteger: boolean = false;

    override *validate(
        settings: Readonly<Record<string, unknown>>,
    ): Generator<ModSettingValidationIssue, void, undefined> {
        const value = this.getSerializedValue(settings);

        if (value === undefined) {
            return;
        }

        if (!isFiniteNumber(value)) {
            yield {
                type: ModValidationIssueType.InvalidType,
                message: `expected a finite number, got ${describeType(value)}`,
            };
            return;
        }

        yield* validateNumericConstraints(value, {
            min: this.min,
            max: this.max,
            step: this.step,
            precision: this.validationPrecision,
            integer: this.requiresInteger,
            processValue: (v) => this.processValue(v),
        });
    }

    protected override processValue(value: number): number {
        const stepped =
            this.step > 0 ? Math.round(value / this.step) * this.step : value;

        return MathUtils.clamp(stepped, this.min, this.max);
    }
}
