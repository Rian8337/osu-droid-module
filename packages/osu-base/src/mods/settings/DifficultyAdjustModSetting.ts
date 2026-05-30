import { NullableDecimalModSetting } from "./NullableDecimalModSetting";

/**
 * A `NullableDecimalModSetting` variant for `ModDifficultyAdjust` that embeds the beatmap's original
 * difficulty value alongside the user's adjusted value in the serialized format:
 *
 * `{ "adjusted": 7.0, "original": 4.0 }`
 *
 * When `originalValue` is non-null, the score multiplier can be computed from the serialized format
 * alone, without a beatmap lookup. When `null`, `applyFromBeatmapDifficulty` must be called first.
 *
 * Legacy scalar values (e.g. `"cs": 7.0`) are accepted in `load` for backward compatibility.
 */
export class DifficultyAdjustModSetting extends NullableDecimalModSetting {
    /**
     * The beatmap's original value for this setting, populated by `applyFromBeatmapDifficulty`.
     *
     * Non-null means the score multiplier is self-contained; `null` means a beatmap lookup is needed.
     */
    originalValue: number | null = null;

    constructor(
        name: string,
        key: string,
        description: string,
        min = -Number.MAX_VALUE,
        max = Number.MAX_VALUE,
        step = 0,
        precision: number | null = null,
    ) {
        super(name, key, description, null, min, max, step, precision);
    }

    override load(settings: Record<string, unknown>): void {
        if (this.key === null) {
            return;
        }

        const data = settings[this.key];

        if (typeof data === "object" && data !== null) {
            const { adjusted, original } = data as Record<string, unknown>;

            this.value = typeof adjusted === "number" ? adjusted : null;

            const originalNum = typeof original === "number" ? original : null;

            this.originalValue = originalNum;

            if (originalNum !== null) {
                this.defaultValue = originalNum;
            }
        } else if (typeof data === "number") {
            // Legacy scalar format.
            this.value = data;
            this.originalValue = null;
        }
    }

    override save(settings: Record<string, unknown>): void {
        if (this.key === null || this.value === null) {
            return;
        }

        settings[this.key] = {
            adjusted: this.value,
            original: this.originalValue,
        };
    }
}
