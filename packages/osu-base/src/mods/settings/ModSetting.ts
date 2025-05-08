/**
 * Represents a `Mod` specific setting.
 */
export abstract class ModSetting<T> {
    /**
     * The legible name of this `ModSetting`.
     */
    readonly name: string;

    /**
     * The formatter to display the value of this `ModSetting`.
     */
    abstract readonly displayFormatter: (value: T) => string;

    /**
     * The default value of this `ModSetting`.
     */
    readonly defaultValue: T;

    private _value: T;

    /**
     * The value of this `ModSetting`.
     */
    get value(): T {
        return this._value;
    }

    set value(value: T) {
        this._value = value;
    }

    constructor(name: string, defaultValue: T) {
        this.name = name;
        this.defaultValue = defaultValue;
        this._value = defaultValue;
    }
}
