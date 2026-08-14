import { NullableDecimalModSetting } from "./NullableDecimalModSetting";

/**
 * A `NullableDecimalModSetting` variant for `ModDifficultyAdjust`.
 *
 * The serialized format is a plain scalar (e.g. `"cs": 7.0`), matching the game client.
 *
 * The legacy `{ "adjusted": 7.0, "original": 4.0 }` object format is still accepted in `load` for
 * backward compatibility with old saved data. When present, `original` is used to set `defaultValue`
 * directly rather than being tracked separately.
 */
export class DifficultyAdjustModSetting extends NullableDecimalModSetting {
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

    /**
     * "Default" means no override is active (`value` is `null`), regardless of what `defaultValue`
     * currently holds (which may be set to the beatmap's difficulty for UI hint display).
     */
    override get isDefault(): boolean {
        return this.value === null;
    }

    override load(settings: Record<string, unknown>): void {
        if (this.key === null) {
            return;
        }

        const data = settings[this.key];

        if (typeof data === "object" && data !== null) {
            // Legacy format. Kept for backward compatibility with old saved data.
            const { adjusted, original } = data as Record<string, unknown>;

            this.value = typeof adjusted === "number" ? adjusted : null;

            if (typeof original === "number") {
                this.defaultValue = original;
            }
        } else {
            // New format: a plain scalar value (or null).
            super.load(settings);
        }
    }

    override save(settings: Record<string, unknown>): void {
        if (this.key === null || this.value === null) {
            return;
        }

        settings[this.key] = this.value;
    }
}
