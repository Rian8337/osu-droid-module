import { ModValidationIssue } from "./ModValidationIssue";

/**
 * An error that is thrown when serialized mods fail validation.
 *
 * Contains every issue that was found, not only the first one.
 */
export class ModValidationError extends Error {
    /**
     * @param issues The issues that were found.
     */
    constructor(readonly issues: readonly ModValidationIssue[]) {
        super(
            `Invalid mods:\n${issues
                .map((issue) => ModValidationError.formatIssue(issue))
                .join("\n")}`,
        );

        this.name = "ModValidationError";
    }

    private static formatIssue(issue: ModValidationIssue): string {
        const subject =
            issue.acronym === undefined
                ? ""
                : issue.key === undefined
                  ? issue.acronym
                  : `${issue.acronym}.${issue.key}`;

        const head = [
            issue.index >= 0 ? `[${issue.index.toString()}]` : "",
            subject,
        ]
            .filter((part) => part.length > 0)
            .join(" ");

        return head.length > 0 ? `${head}: ${issue.message}` : issue.message;
    }
}
