/**
 * The type of a {@link ModValidationIssue}.
 */
export enum ModValidationIssueType {
    /**
     * The input is not an array of mods.
     */
    InvalidModList = "invalidModList",

    /**
     * An entry of the input is not a mod object.
     */
    InvalidModEntry = "invalidModEntry",

    /**
     * An entry's `acronym` is missing or not a string.
     */
    InvalidAcronym = "invalidAcronym",

    /**
     * An entry has a property other than `acronym` and `settings`.
     */
    UnknownProperty = "unknownProperty",

    /**
     * An entry's acronym does not belong to any `Mod`.
     */
    UnknownAcronym = "unknownAcronym",

    /**
     * An entry's acronym already appeared earlier in the input.
     */
    DuplicateAcronym = "duplicateAcronym",

    /**
     * An entry's `settings` is not an object.
     */
    InvalidSettings = "invalidSettings",

    /**
     * A settings key does not belong to any of the `Mod`'s `ModSetting`s.
     */
    UnknownSetting = "unknownSetting",

    /**
     * A setting's value has the wrong type.
     */
    InvalidType = "invalidType",

    /**
     * A setting's value is outside of its allowed range. For enum settings, the index is out of bounds.
     */
    OutOfRange = "outOfRange",

    /**
     * A setting's value must be an integer but is not.
     */
    NotInteger = "notInteger",

    /**
     * A setting's value is not a multiple of its step size.
     */
    NotOnStep = "notOnStep",

    /**
     * A setting's value has more decimal places than its precision allows.
     */
    ExcessPrecision = "excessPrecision",

    /**
     * A value is invalid for a reason not covered by any other type, such as a custom rule in a
     * `Mod.validateSettings` override.
     */
    InvalidValue = "invalidValue",
}
