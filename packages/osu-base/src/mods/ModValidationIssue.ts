import { ModSettingValidationIssue } from "./settings/ModSettingValidationIssue";

/**
 * Represents an issue found while validating serialized mods.
 */
export interface ModValidationIssue extends ModSettingValidationIssue {
    /**
     * Index of the offending entry in the input array, or -1 for issues about the input as a whole.
     */
    readonly index: number;

    /**
     * The entry's acronym, if it could be read.
     */
    readonly acronym?: string;

    /**
     * The setting key, if the issue is setting-specific.
     */
    readonly key?: string;
}
