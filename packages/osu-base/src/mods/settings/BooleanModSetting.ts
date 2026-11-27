import { ModSetting } from "./ModSetting";
import { describeType } from "./ModSettingValidation";
import { ModValidationIssueType } from "../ModValidationIssueType";
import { ModSettingValidationIssue } from "./ModSettingValidationIssue";

/**
 * Represents a `Mod` specific setting that is constrained to a boolean value.
 */
export class BooleanModSetting extends ModSetting<boolean> {
    override readonly displayFormatter: (value: boolean) => string = (v) =>
        v ? "Enabled" : "Disabled";

    override load(settings: Record<string, unknown>): void {
        if (this.key === null) {
            return;
        }

        const stored = settings[this.key];

        if (typeof stored === "boolean") {
            this.value = stored;
        }
    }

    override *validate(
        settings: Readonly<Record<string, unknown>>,
    ): Generator<ModSettingValidationIssue, void, undefined> {
        const value = this.getSerializedValue(settings);

        if (value !== undefined && typeof value !== "boolean") {
            yield {
                type: ModValidationIssueType.InvalidType,
                message: `expected a boolean, got ${describeType(value)}`,
            };
        }
    }
}
