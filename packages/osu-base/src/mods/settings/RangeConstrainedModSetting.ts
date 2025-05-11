import { ModSetting } from "./ModSetting";

/**
 * Represents a `Mod` specific setting that is constrained to a range of values.
 */
export abstract class RangeConstrainedModSetting<T> extends ModSetting<T> {
    private _min: T;

    /**
     * The minimum value of this `RangeConstrainedModSetting`.
     */
    get min(): T {
        return this._min;
    }

    set min(value: T) {
        this._min = value;
        this.value = this.processValue(this.value);
    }

    private _max: T;

    /**
     * The maximum value of this `RangeConstrainedModSetting`.
     */
    get max(): T {
        return this._max;
    }

    set max(value: T) {
        this._max = value;
        this.value = this.processValue(this.value);
    }

    private _step: T;

    /**
     * The step size of this `RangeConstrainedModSetting`.
     */
    get step(): T {
        return this._step;
    }

    set step(value: T) {
        this._step = value;
        this.value = this.processValue(this.value);
    }

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

        this._min = min;
        this._max = max;
        this._step = step;
    }

    /**
     * Processes the value of this `RangeConstrainedModSetting` to ensure it is within the range and
     * step size.
     *
     * @param value The value to process.
     */
    protected abstract processValue(value: T): T;
}
