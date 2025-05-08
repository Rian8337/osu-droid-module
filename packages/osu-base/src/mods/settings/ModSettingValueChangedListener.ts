/**
 * A listener that is called when the value of a `ModSetting` changes.
 */
export type ModSettingValueChangedListener<T> = (
    oldValue: T,
    value: T,
) => unknown;
