import { ModSettingValueChangedListener } from "./ModSettingValueChangedListener";

/**
 * Represents a `Mod` specific setting.
 */
export class ModSetting<T = unknown> {
    /**
     * The legible name of this `ModSetting`.
     */
    readonly name: string;

    /**
     * The description of this `ModSetting`.
     */
    readonly description: string;

    /**
     * The formatter to display the value of this `ModSetting`.
     */
    protected readonly displayFormatter: (value: T) => string = (v) => `${v}`;

    private _defaultValue: T;

    /**
     * The default value of this `ModSetting`.
     */
    get defaultValue(): T {
        return this._value;
    }

    set defaultValue(value: T) {
        this._defaultValue = value;
    }

    private _value: T;

    /**
     * The value of this `ModSetting`.
     */
    get value(): T {
        return this._value;
    }

    set value(value: T) {
        if (this._value !== value) {
            const oldValue = this._value;
            this._value = value;

            for (const listener of this.valueChangedListeners) {
                listener(oldValue, value);
            }
        }
    }

    private valueChangedListeners = new Set<
        ModSettingValueChangedListener<T>
    >();

    /**
     * Whether this `ModSetting` is set to its default value.
     */
    get isDefault(): boolean {
        return this._value === this.defaultValue;
    }

    constructor(name: string, description: string, defaultValue: T) {
        this.name = name;
        this.description = description;
        this._defaultValue = defaultValue;
        this._value = defaultValue;
    }

    /**
     * Returns a string representation of this `ModSetting`'s value.
     *
     * @returns A string representation of this `ModSetting`'s value.
     */
    toDisplayString(): string {
        return this.displayFormatter(this.value);
    }

    /**
     * Binds an action that will be called when the value of this `ModSetting` changes.
     *
     * @param listener The action to call when the value of this `ModSetting` changes.
     * @param runOnceImmediately Whether to call the action immediately with the current value of this `ModSetting`.
     */
    bindValueChanged(
        listener: ModSettingValueChangedListener<T>,
        runOnceImmediately = false,
    ) {
        this.valueChangedListeners.add(listener);

        if (runOnceImmediately) {
            listener(this.value, this.value);
        }
    }

    /**
     * Unbinds an action that was previously bound to this `ModSetting`.
     *
     * @param listener The action to unbind.
     */
    unbindValueChanged(listener: ModSettingValueChangedListener<T>) {
        this.valueChangedListeners.delete(listener);
    }
}
