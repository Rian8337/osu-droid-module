import { MathUtils } from "../../math/MathUtils";
import { RangeConstrainedModSetting } from "./RangeConstrainedModSetting";

/**
 * Represents a `Mod` specific setting that is constrained to a number of values.
 */
export class NumberModSetting extends RangeConstrainedModSetting<number> {
    override readonly displayFormatter = (v: number) => v.toString();

    constructor(
        name: string,
        defaultValue: number,
        min: number,
        max: number,
        step: number,
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

        if (defaultValue < min || defaultValue > max) {
            throw new RangeError(
                `The default value (${defaultValue}) must be between the minimum (${min}) and maximum (${max}) values.`,
            );
        }
    }

    protected override processValue(value: number): number {
        return MathUtils.clamp(
            Math.round(value / this.step) * this.step,
            this.min,
            this.max,
        );
    }
}
