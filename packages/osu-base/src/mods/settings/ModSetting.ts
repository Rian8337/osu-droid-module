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

    /**
     * Whether this `ModSetting` is set to its default value.
     */
    get isDefault(): boolean {
        return this._value === this.defaultValue;
    }

    constructor(name: string, description: string, defaultValue: T) {
        this.name = name;
        this.description = description;
        this.defaultValue = defaultValue;
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
}
