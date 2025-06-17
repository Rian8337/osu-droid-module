/**
 * Represents a change in a mod setting value.
 */
export interface ModSettingValueChange<T> {
    /**
     * The old value.
     */
    readonly oldValue: T;

    /**
     * The new value.
     */
    readonly newValue: T;
}
