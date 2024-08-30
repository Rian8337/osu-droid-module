/**
 * Describes a value that can be cached.
 */
export class Cached<T> {
    private _value: T;
    private _isValid = true;

    /**
     * The cached value.
     */
    get value(): T {
        if (!this._isValid) {
            throw new Error("May not query value of an invalid cache.");
        }

        return this._value;
    }

    /**
     * The cached value.
     */
    set value(value: T) {
        this._value = value;
        this._isValid = true;
    }

    /**
     * Whether the cache is valid.
     */
    get isValid(): boolean {
        return this._isValid;
    }

    constructor(value: T) {
        this._value = value;
    }

    /**
     * Invalidates the cache of this `Cached`.
     *
     * @return `true` if the cache was invalidated from a valid state.
     */
    invalidate(): boolean {
        if (this._isValid) {
            this._isValid = false;

            return true;
        }

        return false;
    }
}
