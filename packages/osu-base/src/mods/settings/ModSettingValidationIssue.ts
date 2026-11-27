import { ModValidationIssueType } from "../ModValidationIssueType";

/**
 * Represents an issue found while validating a `ModSetting`'s serialized value.
 */
export interface ModSettingValidationIssue {
    /**
     * The type of the issue.
     */
    readonly type: ModValidationIssueType;

    /**
     * A human-readable description of the issue. This may change, so
     * use {@link type} to identify the issue.
     */
    readonly message: string;
}
