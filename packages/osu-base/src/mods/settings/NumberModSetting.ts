import { MathUtils } from "../../math/MathUtils";
import { RangeConstrainedModSetting } from "./RangeConstrainedModSetting";

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

    protected override processValue(value: number): number {
        const stepped =
            this.step > 0
                ? Math.round(value / this.step) * this.step
                : value;

        return MathUtils.clamp(stepped, this.min, this.max);
    }
}
