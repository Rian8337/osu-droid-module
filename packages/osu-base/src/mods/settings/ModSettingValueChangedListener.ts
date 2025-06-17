import { ModSettingValueChange } from "./ModSettingValueChange";

/**
 * A listener that is called when the value of a `ModSetting` changes.
 */
export type ModSettingValueChangedListener<T> = (
    value: ModSettingValueChange<T>,
) => unknown;
