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
export class NullableIntegerModSetting extends RangeConstrainedModSetting<
    number | null
> {
    override readonly displayFormatter = (v: number | null) =>
        v?.toString() ?? "None";

    constructor(
        name: string,
        key: string | null,
        description: string,
        defaultValue: number | null,
        min = -2147483648,
        max = 2147483647,
    ) {
        super(name, key, description, defaultValue, min, max, 1);

        if (min > max) {
            throw new RangeError(
                `The minimum value (${min.toString()}) must be less than or equal to the maximum value (${max.toString()}).`,
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
    }

    override *validate(
        settings: Readonly<Record<string, unknown>>,
    ): Generator<ModSettingValidationIssue, void, undefined> {
        const value = this.getSerializedValue(settings);

        if (value === undefined || value === null) {
            return;
        }

        if (!isFiniteNumber(value)) {
            yield {
                type: ModValidationIssueType.InvalidType,
                message: `expected an integer or null, got ${describeType(value)}`,
            };
            return;
        }

        yield* validateNumericConstraints(value, {
            min: this.min!,
            max: this.max!,
            step: this.step!,
            precision: null,
            integer: true,
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

    protected override processValue(value: number | null): number | null {
        if (value === null) {
            return null;
        }

        return Math.trunc(MathUtils.clamp(value, this.min!, this.max!));
    }
}
