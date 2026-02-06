import { MathUtils } from "../../math/MathUtils";
import { RangeConstrainedModSetting } from "./RangeConstrainedModSetting";

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
        description: string,
        defaultValue: number | null,
        min = -2147483648,
        max = 2147483647,
    ) {
        super(name, description, defaultValue, min, max, 1);

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

    protected override processValue(value: number | null): number | null {
        if (value === null) {
            return null;
        }

        return Math.trunc(MathUtils.clamp(value, this.min!, this.max!));
    }
}
