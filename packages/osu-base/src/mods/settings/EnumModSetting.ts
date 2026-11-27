import { ModSetting } from "./ModSetting";
import { describeType } from "./ModSettingValidation";
import { ModValidationIssueType } from "../ModValidationIssueType";
import { ModSettingValidationIssue } from "./ModSettingValidationIssue";

/**
 * Represents a `Mod` specific setting that is constrained to one of a fixed set of enum-like values.
 *
 * Values are serialized by their index within {@link entries} to match the format used by osu!droid's
 * `EnumModSetting`.
 */
export class EnumModSetting<T> extends ModSetting<T> {
    protected override readonly displayFormatter: (value: T) => string;

    /**
     * The possible values of this `EnumModSetting`, in the order used for serialization.
     */
    readonly entries: readonly T[];

    constructor(
        name: string,
        key: string | null,
        description: string,
        defaultValue: T,
        entries: readonly T[],
        displayFormatter?: (value: T) => string,
    ) {
        super(name, key, description, defaultValue);

        this.entries = entries;
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        this.displayFormatter = displayFormatter ?? ((v) => `${v}`);
    }

    override load(settings: Record<string, unknown>): void {
        if (this.key === null) {
            return;
        }

        const stored = settings[this.key];

        if (typeof stored === "number" && this.entries[stored] !== undefined) {
            this.value = this.entries[stored];
        }
    }

    override *validate(
        settings: Readonly<Record<string, unknown>>,
    ): Generator<ModSettingValidationIssue, void, undefined> {
        const value = this.getSerializedValue(settings);

        if (value === undefined) {
            return;
        }

        if (typeof value !== "number") {
            yield {
                type: ModValidationIssueType.InvalidType,
                message: `expected an integer index, got ${describeType(value)}`,
            };
            return;
        }

        if (!Number.isInteger(value)) {
            yield {
                type: ModValidationIssueType.NotInteger,
                message: `${value.toString()} is not an integer index`,
            };

            return;
        }

        if (value < 0 || value >= this.entries.length) {
            yield {
                type: ModValidationIssueType.OutOfRange,
                message: `${value.toString()} is not a valid index (expected an integer in [0, ${(this.entries.length - 1).toString()}])`,
            };
        }
    }

    override save(settings: Record<string, unknown>): void {
        if (this.key !== null) {
            settings[this.key] = this.entries.indexOf(this.value);
        }
    }
}
