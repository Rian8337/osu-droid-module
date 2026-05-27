import { NullableDecimalModSetting } from "./NullableDecimalModSetting";

/**
 * A `NullableDecimalModSetting` variant for `ModDifficultyAdjust` that embeds the beatmap's original
 * difficulty value alongside the user's adjusted value.
 */
export class DifficultyAdjustModSetting extends NullableDecimalModSetting {
    /**
     * The beatmap's original value for this setting.
     */
    originalValue: number | null = null;

    constructor(
        name: string,
        description: string,
        min = -Number.MAX_VALUE,
        max = Number.MAX_VALUE,
        step = 0,
        precision: number | null = null,
    ) {
        super(name, description, null, min, max, step, precision);
    }
}
