import { ModValidationIssueType } from "../ModValidationIssueType";
import { ModSettingValidationIssue } from "./ModSettingValidationIssue";

/**
 * Internal helpers shared by `ModSetting` validators. Not part of the public API.
 */

/**
 * The relative tolerance used when validating numbers.
 *
 * The game serializes 32-bit floats, so a value such as `0.3` may arrive as `0.29999998`.
 */
const relativeTolerance = 1e-6;

function getTolerance(reference: number): number {
    return relativeTolerance * Math.max(1, Math.abs(reference));
}

/**
 * Describes the type of a value for use in validation messages.
 *
 * @param value The value to describe.
 * @returns The description.
 */
export function describeType(value: unknown): string {
    if (value === null) {
        return "null";
    }

    if (Array.isArray(value)) {
        return "an array";
    }

    return typeof value === "number" && !Number.isFinite(value)
        ? String(value)
        : `a ${typeof value}`;
}

/**
 * Determines whether a value is a plain (non-null, non-array) object.
 *
 * @param value The value to check.
 * @returns Whether the value is a plain object.
 */
export function isPlainObject(
    value: unknown,
): value is Readonly<Record<string, unknown>> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Determines whether a value is a finite number.
 *
 * @param value The value to check.
 * @returns Whether the value is a finite number.
 */
export function isFiniteNumber(value: unknown): value is number {
    return typeof value === "number" && Number.isFinite(value);
}

/**
 * Constraints of a numeric setting.
 */
export interface NumericConstraints {
    readonly min: number;
    readonly max: number;

    /**
     * The step size. `0` means no stepping.
     */
    readonly step: number;

    /**
     * The number of decimal places, or `null` if the value is not rounded.
     */
    readonly precision: number | null;

    /**
     * Whether the value must be an exact integer.
     */
    readonly integer: boolean;

    /**
     * Rounds a value to one the setting can hold. This is the setting's own logic, so that validation
     * and assignment agree on what a representable value is.
     */
    processValue(value: number): number;
}

/**
 * Validates that a finite number is within the range of a numeric setting, and is a multiple of its
 * step and within its precision.
 *
 * The step and precision are only checked when the value is within range.
 *
 * @param value The value to validate.
 * @param constraints The constraints of the setting.
 * @yields A message for each issue found.
 */
export function* validateNumericConstraints(
    value: number,
    constraints: NumericConstraints,
): Generator<ModSettingValidationIssue, void, undefined> {
    const { min, max } = constraints;

    // Integers are serialized exactly, so only floating point values need tolerance. With bounds such
    // as 2147483647, a relative tolerance would otherwise let through values that are far out of range.
    const rangeTolerance = (bound: number) =>
        constraints.integer ? 0 : getTolerance(bound);

    if (
        value < min - rangeTolerance(min) ||
        value > max + rangeTolerance(max)
    ) {
        yield {
            type: ModValidationIssueType.OutOfRange,
            message: `${value.toString()} is outside [${min.toString()}, ${max.toString()}]`,
        };
        return;
    }

    if (constraints.integer) {
        if (!Number.isInteger(value)) {
            yield {
                type: ModValidationIssueType.NotInteger,
                message: `${value.toString()} is not an integer`,
            };
        }

        return;
    }

    if (
        Math.abs(constraints.processValue(value) - value) <= getTolerance(value)
    ) {
        return;
    }

    if (constraints.step > 0) {
        yield {
            type: ModValidationIssueType.NotOnStep,
            message: `${value.toString()} is not a multiple of ${constraints.step.toString()}`,
        };
    } else if (constraints.precision !== null) {
        yield {
            type: ModValidationIssueType.ExcessPrecision,
            message: `${value.toString()} has more than ${constraints.precision.toString()} decimal places`,
        };
    } else {
        yield {
            type: ModValidationIssueType.InvalidValue,
            message: `${value.toString()} is not a valid value`,
        };
    }
}
