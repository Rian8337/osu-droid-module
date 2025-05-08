import { ModSetting } from "./ModSetting";

/**
 * Represents a `Mod` specific setting that is constrained to a range of values.
 */
export abstract class RangeConstrainedModSetting<T> extends ModSetting<T> {
    /**
     * The minimum value of this `RangeConstrainedModSetting`.
     */
    readonly min: T;

    /**
     * The maximum value of this `RangeConstrainedModSetting`.
     */
    readonly max: T;

    /**
     * The step size of this `RangeConstrainedModSetting`.
     */
    readonly step: T;

    override get value(): T {
        return super.value;
    }

    override set value(value: T) {
        super.value = this.processValue(value);
    }

    constructor(
        name: string,
        description: string,
        defaultValue: T,
        min: T,
        max: T,
        step: T,
    ) {
        super(name, description, defaultValue);

        this.min = min;
        this.max = max;
        this.step = step;
    }

    /**
     * Processes the value of this `RangeConstrainedModSetting` to ensure it is within the range and
     * step size.
     *
     * @param value The value to process.
     */
    protected abstract processValue(value: T): T;
}
