import { ModValidationIssueType } from "../ModValidationIssueType";
import {
    describeType,
    isFiniteNumber,
    isPlainObject,
} from "./ModSettingValidation";
import { NullableDecimalModSetting } from "./NullableDecimalModSetting";
import { ModSettingValidationIssue } from "./ModSettingValidationIssue";

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

    override *validate(
        settings: Readonly<Record<string, unknown>>,
    ): Generator<ModSettingValidationIssue, void, undefined> {
        const data = this.getSerializedValue(settings);

        if (!isPlainObject(data)) {
            yield* super.validate(settings);
            return;
        }

        // Legacy format. `adjusted` follows the usual constraints, while `original` is only a hint.
        const { adjusted, original } = data;

        if (adjusted !== undefined) {
            for (const issue of this.validateValue(adjusted)) {
                yield { ...issue, message: `adjusted: ${issue.message}` };
            }
        }

        if (
            original !== undefined &&
            original !== null &&
            !isFiniteNumber(original)
        ) {
            yield {
                type: ModValidationIssueType.InvalidType,
                message: `original: expected a finite number or null, got ${describeType(original)}`,
            };
        }
    }

    override save(settings: Record<string, unknown>): void {
        if (this.key === null || this.value === null) {
            return;
        }

        settings[this.key] = this.value;
    }
}
