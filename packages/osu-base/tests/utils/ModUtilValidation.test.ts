import {
    Mod,
    ModDifficultyAdjust,
    ModDoubleTime,
    ModHidden,
    ModUtil,
    ModValidationError,
    ModValidationIssue,
    ModValidationIssueType,
    NullableDecimalModSetting,
    NumberModSetting,
    SerializedMod,
} from "../../src";

const T = ModValidationIssueType;

function validate(mods: unknown): ModValidationIssue[] {
    return [...ModUtil.validateMods(mods)];
}

/**
 * Strips the human-readable message from issues so that tests do not depend on its wording.
 */
function withoutMessage(
    issues: readonly Partial<ModValidationIssue>[],
): Omit<Partial<ModValidationIssue>, "message">[] {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return issues.map(({ message: _, ...rest }) => rest);
}

describe("Test validateMods", () => {
    test("Accepts an empty array", () => {
        expect(validate([])).toEqual([]);
    });

    test("Accepts mods without settings", () => {
        expect(validate([{ acronym: "HD" }, { acronym: "DT" }])).toEqual([]);
    });

    test("Accepts null and empty settings", () => {
        expect(
            validate([
                { acronym: "HD", settings: null },
                { acronym: "DT", settings: {} },
            ]),
        ).toEqual([]);
    });

    test.each([[null], [undefined], [{}], ["[]"], [5]])(
        "Rejects non-array input %p with an input-level issue",
        (input) => {
            const issues = validate(input);

            expect(withoutMessage(issues)).toEqual([
                { type: T.InvalidModList, index: -1 },
            ]);
        },
    );

    test.each([[null], [5], ["HD"], [[]], [[{ acronym: "HD" }]]])(
        "Rejects non-object entry %p",
        (entry) => {
            const issues = validate([entry]);

            expect(withoutMessage(issues)).toEqual([
                { type: T.InvalidModEntry, index: 0 },
            ]);
        },
    );

    test("Rejects a missing or non-string acronym and skips the rest of the entry", () => {
        const issues = validate([
            {},
            { acronym: 5, settings: { bad: 1 } },
            { acronym: null },
        ]);

        expect(withoutMessage(issues)).toEqual([
            { type: T.InvalidAcronym, index: 0 },
            { type: T.InvalidAcronym, index: 1 },
            { type: T.InvalidAcronym, index: 2 },
        ]);
    });

    test("Rejects unknown entry properties but keeps validating", () => {
        const issues = validate([
            {
                acronym: "DA",
                extra: true,
                settings: { cs: 99 },
            },
        ]);

        expect(withoutMessage(issues)).toEqual([
            { type: T.UnknownProperty, index: 0, acronym: "DA" },
            { type: T.OutOfRange, index: 0, acronym: "DA", key: "cs" },
        ]);
        expect(issues[0].message).toContain("extra");
    });

    test("Rejects unknown acronyms", () => {
        const issues = validate([{ acronym: "ZZ", settings: { a: 1 } }]);

        expect(withoutMessage(issues)).toEqual([
            { type: T.UnknownAcronym, index: 0, acronym: "ZZ" },
        ]);
    });

    test("Rejects duplicate acronyms", () => {
        const issues = validate([
            { acronym: "HD" },
            { acronym: "DT" },
            { acronym: "HD" },
        ]);

        expect(withoutMessage(issues)).toEqual([
            { type: T.DuplicateAcronym, index: 2, acronym: "HD" },
        ]);
    });

    test("Rejects non-object settings", () => {
        const issues = validate([
            { acronym: "HD", settings: 5 },
            { acronym: "DT", settings: [] },
            { acronym: "NF", settings: "x" },
        ]);

        expect(withoutMessage(issues)).toEqual([
            { type: T.InvalidSettings, index: 0, acronym: "HD" },
            { type: T.InvalidSettings, index: 1, acronym: "DT" },
            { type: T.InvalidSettings, index: 2, acronym: "NF" },
        ]);
    });

    test("Rejects unknown setting keys", () => {
        const issues = validate([
            { acronym: "HD", settings: { unknown: "anything" } },
            // `rateMultiplier` belongs to CS only. DT, HT and NC have no settings.
            { acronym: "DT", settings: { rateMultiplier: 1.5 } },
            { acronym: "CS", settings: { rateMultiplier: 1.5 } },
        ]);

        expect(withoutMessage(issues)).toEqual([
            {
                type: T.UnknownSetting,
                index: 0,
                acronym: "HD",
                key: "unknown",
            },
            {
                type: T.UnknownSetting,
                index: 1,
                acronym: "DT",
                key: "rateMultiplier",
            },
        ]);
    });

    test("Rejects unknown setting keys alongside invalid values", () => {
        const issues = validate([
            { acronym: "DA", settings: { cs: 16, unknown: 1 } },
        ]);

        expect(issues.map((issue) => [issue.type, issue.key])).toEqual([
            [T.UnknownSetting, "unknown"],
            [T.OutOfRange, "cs"],
        ]);
    });

    test("Reports setting issues with index, acronym and key", () => {
        const issues = validate([
            { acronym: "HD" },
            { acronym: "NF" },
            { acronym: "DA", settings: { cs: 15.5 } },
        ]);

        expect(withoutMessage(issues)).toEqual([
            { type: T.OutOfRange, index: 2, acronym: "DA", key: "cs" },
        ]);
    });

    test("Collects issues across entries", () => {
        const issues = validate([
            null,
            { acronym: "ZZ" },
            { acronym: "DA", settings: { cs: 99, ar: "x", od: 5.55 } },
            { acronym: "HD", settings: { onlyFadeApproachCircles: 1 } },
            { acronym: "HD" },
        ]);

        expect(issues.map((i) => [i.type, i.index, i.key])).toEqual([
            [T.InvalidModEntry, 0, undefined],
            [T.UnknownAcronym, 1, undefined],
            [T.OutOfRange, 2, "cs"],
            [T.InvalidType, 2, "ar"],
            [T.NotOnStep, 2, "od"],
            [T.InvalidType, 3, "onlyFadeApproachCircles"],
            [T.DuplicateAcronym, 4, undefined],
        ]);
    });

    test("Accepts the legacy Difficulty Adjust format", () => {
        expect(
            validate([
                {
                    acronym: "DA",
                    settings: {
                        cs: { adjusted: 7, original: 4 },
                        od: { adjusted: null, original: null },
                    },
                },
            ]),
        ).toEqual([]);
    });

    test("Accepts 32-bit float representations", () => {
        expect(
            validate([
                {
                    acronym: "CS",
                    settings: { rateMultiplier: 1.2500001 },
                },
                { acronym: "DA", settings: { ar: 9.3000002 } },
            ]),
        ).toEqual([]);
    });

    test("Allows overriding Mod.validateSettings for cross-setting rules", () => {
        class CustomMod extends Mod {
            override readonly acronym = "XX";
            override readonly name = "Custom";

            override *validateSettings(
                settings: Readonly<Record<string, unknown>>,
            ) {
                yield* super.validateSettings(settings);

                yield {
                    type: T.InvalidValue,
                    acronym: this.acronym,
                    message: "cross-setting",
                };
            }
        }

        expect([...new CustomMod().validateSettings({})]).toEqual([
            { type: T.InvalidValue, acronym: "XX", message: "cross-setting" },
        ]);
    });
});

describe("Test Mod.validateSettings", () => {
    test("Reports settings with their keys", () => {
        const issues = [
            ...new ModDifficultyAdjust().validateSettings({
                cs: 20,
                hp: "x",
            }),
        ];

        expect(withoutMessage(issues)).toEqual([
            { type: T.OutOfRange, acronym: "DA", key: "cs" },
            { type: T.InvalidType, acronym: "DA", key: "hp" },
        ]);
    });

    test("Yields nothing for a mod without settings given no settings", () => {
        expect([...new ModDoubleTime().validateSettings({})]).toEqual([]);
    });

    test("Rejects any key for a mod without settings", () => {
        expect(
            withoutMessage([...new ModDoubleTime().validateSettings({ a: 1 })]),
        ).toEqual([{ type: T.UnknownSetting, acronym: "DT", key: "a" }]);
    });
});

describe("Test assertValidMods", () => {
    test("Does not throw for valid mods", () => {
        expect(() => {
            ModUtil.assertValidMods([{ acronym: "HD" }]);
        }).not.toThrow();
    });

    test("Throws a ModValidationError containing all issues", () => {
        let error: unknown;

        try {
            ModUtil.assertValidMods([
                { acronym: "ZZ" },
                { acronym: "DA", settings: { cs: 15.5 } },
                { acronym: "DA" },
            ]);
        } catch (e) {
            error = e;
        }

        expect(error).toBeInstanceOf(ModValidationError);
        expect(error).toBeInstanceOf(Error);

        const validationError = error as ModValidationError;

        expect(validationError.name).toBe("ModValidationError");
        expect(validationError.issues).toHaveLength(3);
        expect(validationError.message).toBe(
            [
                "Invalid mods:",
                "[0] ZZ: unknown acronym",
                "[1] DA.cs: 15.5 is outside [0, 15]",
                "[2] DA: duplicate acronym",
            ].join("\n"),
        );
    });

    test("Formats input-level and anonymous issues", () => {
        expect(
            new ModValidationError([
                { type: T.InvalidModList, index: -1, message: "bad" },
            ]).message,
        ).toBe("Invalid mods:\nbad");

        expect(
            new ModValidationError([
                { type: T.InvalidModEntry, index: 3, message: "bad" },
            ]).message,
        ).toBe("Invalid mods:\n[3]: bad");
    });
});

describe("Test deserializeMods validation", () => {
    test("Throws a ModValidationError with all issues before loading anything", () => {
        const input: SerializedMod[] = [
            { acronym: "HD" },
            { acronym: "ZZ" },
            { acronym: "DA", settings: { cs: 15.5, ar: 13 } },
        ];

        let error: unknown;

        try {
            ModUtil.deserializeMods(input);
        } catch (e) {
            error = e;
        }

        expect(error).toBeInstanceOf(ModValidationError);
        expect((error as ModValidationError).issues).toHaveLength(3);
    });

    test("Validates JSON strings", () => {
        expect(() =>
            ModUtil.deserializeMods(
                '[{"acronym":"DA","settings":{"cs":"seven"}}]',
            ),
        ).toThrow(ModValidationError);
    });

    test("Throws a SyntaxError for malformed JSON", () => {
        expect(() => ModUtil.deserializeMods("[{")).toThrow(SyntaxError);
    });

    test("Accepts non-array iterables", () => {
        const mods = ModUtil.deserializeMods(
            new Set<SerializedMod>([{ acronym: "HD" }]),
        );

        expect(mods.has(ModHidden)).toBe(true);
    });

    test("Rejects unknown acronyms", () => {
        expect(() => ModUtil.deserializeMods([{ acronym: "ZZ" }])).toThrow(
            ModValidationError,
        );
    });

    test("Still loads valid mods", () => {
        const mods = ModUtil.deserializeMods(
            '[{"acronym":"HD"},{"acronym":"DA","settings":{"cs":{"adjusted":7.0,"original":4.0}}}]',
        );

        expect(mods.size).toBe(2);
        expect(mods.get(ModDifficultyAdjust)!.cs.value).toBe(7);
    });
});

describe("Test serialization round trip", () => {
    const instantiate = (modType: typeof Mod) =>
        new (modType as new () => Mod)();

    test("Every mod with default settings validates", () => {
        for (const modType of ModUtil.allMods.values()) {
            const mod = instantiate(modType);

            expect([...ModUtil.validateMods([mod.serialize()])]).toEqual([]);
        }
    });

    test("Every setting at its extremes and entries validates", () => {
        let checked = 0;

        for (const [acronym, modType] of ModUtil.allMods) {
            const settingCount = instantiate(modType).settings.length;

            for (let i = 0; i < settingCount; ++i) {
                const probe = instantiate(modType).settings[i];

                const values: unknown[] = [];

                if (
                    probe instanceof NumberModSetting ||
                    probe instanceof NullableDecimalModSetting
                ) {
                    values.push(probe.min, probe.max);
                } else if ("entries" in probe) {
                    values.push(...(probe.entries as unknown[]));
                }

                for (const value of values) {
                    // Use a fresh mod for each value to avoid interactions between settings.
                    const mod = instantiate(modType);
                    const setting = mod.settings[i];

                    setting.value = value;

                    const issues = [...ModUtil.validateMods([mod.serialize()])];

                    expect({
                        acronym,
                        key: setting.key,
                        value,
                        issues,
                    }).toEqual({
                        acronym,
                        key: setting.key,
                        value,
                        issues: [],
                    });

                    ++checked;
                }
            }
        }

        expect(checked).toBeGreaterThan(0);
    });

    test("Serialized mods survive deserialization", () => {
        const serialized = ModUtil.serializeMods(
            Array.from(ModUtil.allMods.values()).map(instantiate),
        );

        expect(() => ModUtil.deserializeMods(serialized)).not.toThrow();
    });
});
