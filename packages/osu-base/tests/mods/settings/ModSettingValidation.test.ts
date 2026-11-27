import {
    BooleanModSetting,
    DecimalModSetting,
    DifficultyAdjustModSetting,
    EnumModSetting,
    IntegerModSetting,
    ModSetting,
    ModSettingValidationIssue,
    ModValidationIssueType,
    NullableDecimalModSetting,
    NullableIntegerModSetting,
    NumberModSetting,
} from "../../../src";

const { ExcessPrecision, InvalidType, NotInteger, NotOnStep, OutOfRange } =
    ModValidationIssueType;

function validateIssues(
    setting: Pick<ModSetting, "validate">,
    settings: Record<string, unknown>,
): ModSettingValidationIssue[] {
    return [...setting.validate(settings)];
}

/**
 * Validates `settings` against `setting`, returning only the type of each issue.
 */
function validate(
    setting: Pick<ModSetting, "validate">,
    settings: Record<string, unknown>,
): ModValidationIssueType[] {
    return validateIssues(setting, settings).map((issue) => issue.type);
}

describe("Test ModSetting", () => {
    test("Base implementation yields nothing", () => {
        const setting = new ModSetting("Test", "key", "Test setting", 0);

        expect(validate(setting, { key: "anything" })).toEqual([]);
    });
});

describe("Test common rules", () => {
    test.each(
        [
            new BooleanModSetting("Test", null, "Test setting", false),
            new NumberModSetting("Test", null, "Test setting", 1, 0, 2, 1),
            new IntegerModSetting("Test", null, "Test setting", 1, 0, 2),
            new NullableDecimalModSetting("Test", null, "Test setting", null),
            new NullableIntegerModSetting("Test", null, "Test setting", null),
            new EnumModSetting("Test", null, "Test setting", 0, [0, 1]),
        ].map((s) => [s.constructor.name, s] as const),
    )("%s with null key yields nothing", (_, setting) => {
        expect(validate(setting, { "": "bad", null: "bad" })).toEqual([]);
    });

    test.each(
        [
            new BooleanModSetting("Test", "key", "Test setting", false),
            new NumberModSetting("Test", "key", "Test setting", 1, 0, 2, 1),
            new IntegerModSetting("Test", "key", "Test setting", 1, 0, 2),
            new NullableDecimalModSetting("Test", "key", "Test setting", null),
            new NullableIntegerModSetting("Test", "key", "Test setting", null),
            new DifficultyAdjustModSetting("Test", "key", "Test setting"),
            new EnumModSetting("Test", "key", "Test setting", 0, [0, 1]),
        ].map((s) => [s.constructor.name, s] as const),
    )("%s with absent or undefined key yields nothing", (_, setting) => {
        expect(validate(setting, {})).toEqual([]);
        expect(validate(setting, { key: undefined })).toEqual([]);
        expect(validate(setting, { other: "bad" })).toEqual([]);
    });
});

describe("Test BooleanModSetting", () => {
    const setting = new BooleanModSetting("Test", "key", "Test setting", false);

    test("Accepts booleans", () => {
        expect(validate(setting, { key: true })).toEqual([]);
        expect(validate(setting, { key: false })).toEqual([]);
    });

    test.each([[1], [0], ["true"], [null], [{}], [[]]])(
        "Rejects %p",
        (value) => {
            expect(validate(setting, { key: value })).toEqual([InvalidType]);
        },
    );
});

describe("Test NumberModSetting", () => {
    const setting = new NumberModSetting(
        "Test",
        "key",
        "Test setting",
        1,
        0,
        10,
        0.5,
    );

    test("Accepts values within range that are multiples of the step", () => {
        for (const value of [0, 0.5, 1, 4.5, 10]) {
            expect(validate(setting, { key: value })).toEqual([]);
        }
    });

    test.each([["1"], [null], [true], [{}], [[1]], [NaN], [Infinity]])(
        "Rejects %p with a single type issue",
        (value) => {
            expect(validate(setting, { key: value })).toEqual([InvalidType]);
        },
    );

    test("Rejects values outside the range", () => {
        expect(validate(setting, { key: -0.5 })).toEqual([OutOfRange]);

        expect(validate(setting, { key: 10.5 })).toEqual([OutOfRange]);
    });

    test("Does not report step issues for out of range values", () => {
        expect(validate(setting, { key: 15.3 })).toEqual([OutOfRange]);
    });

    test("Rejects values that are not multiples of the step", () => {
        expect(validate(setting, { key: 0.3 })).toEqual([NotOnStep]);
    });

    test("Tolerates values just outside the range", () => {
        expect(validate(setting, { key: 10 + 1e-7 })).toEqual([]);
        expect(validate(setting, { key: -1e-7 })).toEqual([]);
    });

    test("Does not check the step when it is 0", () => {
        const free = new NumberModSetting(
            "Test",
            "key",
            "Test setting",
            1,
            0,
            10,
            0,
        );

        expect(validate(free, { key: 1.2345678 })).toEqual([]);
    });
});

describe("Test DecimalModSetting", () => {
    const setting = new DecimalModSetting(
        "Test",
        "key",
        "Test setting",
        0.5,
        0,
        1,
        0.01,
        2,
    );

    test("Accepts values that are multiples of the step", () => {
        expect(validate(setting, { key: 0.29 })).toEqual([]);
        expect(validate(setting, { key: 1 })).toEqual([]);
    });

    test("Accepts 32-bit float representations", () => {
        expect(validate(setting, { key: 0.29999998 })).toEqual([]);
        expect(validate(setting, { key: 0.30000001 })).toEqual([]);
        expect(validate(setting, { key: 0.99999994 })).toEqual([]);
    });

    test("Rejects values that are not multiples of the step", () => {
        expect(validate(setting, { key: 0.305 })).toEqual([NotOnStep]);
    });

    test("Rejects values outside the range", () => {
        expect(validate(setting, { key: 1.01 })).toEqual([OutOfRange]);
    });

    test("Reports precision issues when there is no step", () => {
        const noStep = new DecimalModSetting(
            "Test",
            "key",
            "Test setting",
            0.5,
            0,
            1,
            0,
            2,
        );

        expect(validate(noStep, { key: 0.123 })).toEqual([ExcessPrecision]);

        expect(validate(noStep, { key: 0.12 })).toEqual([]);
    });

    test("Accepts any finite value with default bounds", () => {
        const unbounded = new DecimalModSetting(
            "Test",
            "key",
            "Test setting",
            0,
        );

        expect(validate(unbounded, { key: 123456.789 })).toEqual([]);
        expect(validate(unbounded, { key: -1e300 })).toEqual([]);
    });
});

describe("Test IntegerModSetting", () => {
    const setting = new IntegerModSetting(
        "Test",
        "key",
        "Test setting",
        5,
        0,
        10,
    );

    test("Accepts integers within range", () => {
        expect(validate(setting, { key: 0 })).toEqual([]);
        expect(validate(setting, { key: 10 })).toEqual([]);
    });

    test("Rejects non-integers without tolerance", () => {
        expect(validate(setting, { key: 5.5 })).toEqual([NotInteger]);

        expect(validate(setting, { key: 5.0000001 })).toEqual([NotInteger]);
    });

    test("Rejects values outside the range", () => {
        expect(validate(setting, { key: 11 })).toEqual([OutOfRange]);

        expect(validate(setting, { key: -1 })).toEqual([OutOfRange]);
    });

    test("Rejects wrong types", () => {
        expect(validate(setting, { key: "5" })).toEqual([InvalidType]);
        expect(validate(setting, { key: null })).toEqual([InvalidType]);
    });

    test("Uses the int32 bounds by default", () => {
        const unbounded = new IntegerModSetting("Test", "key", "Test", 0);

        expect(validate(unbounded, { key: 2147483647 })).toEqual([]);
        expect(validate(unbounded, { key: -2147483648 })).toEqual([]);
        expect(validate(unbounded, { key: 2147483648 })).toEqual([OutOfRange]);
    });
});

describe("Test NullableDecimalModSetting", () => {
    const setting = new NullableDecimalModSetting(
        "Test",
        "key",
        "Test setting",
        null,
        0,
        10,
        0.1,
        1,
    );

    test("Accepts null", () => {
        expect(validate(setting, { key: null })).toEqual([]);
    });

    test("Accepts valid numbers", () => {
        expect(validate(setting, { key: 7.3 })).toEqual([]);
        expect(validate(setting, { key: 7.3000002 })).toEqual([]);
    });

    test("Rejects wrong types", () => {
        expect(validate(setting, { key: "7" })).toEqual([InvalidType]);
        expect(validate(setting, { key: {} })).toEqual([InvalidType]);
        expect(validate(setting, { key: NaN })).toEqual([InvalidType]);
    });

    test("Rejects values that are out of range or not multiples of the step", () => {
        expect(validate(setting, { key: 10.1 })).toEqual([OutOfRange]);

        expect(validate(setting, { key: 7.35 })).toEqual([NotOnStep]);
    });
});

describe("Test NullableIntegerModSetting", () => {
    const setting = new NullableIntegerModSetting(
        "Test",
        "key",
        "Test setting",
        null,
        0,
    );

    test("Accepts null and integers", () => {
        expect(validate(setting, { key: null })).toEqual([]);
        expect(validate(setting, { key: 0 })).toEqual([]);
        expect(validate(setting, { key: 2147483647 })).toEqual([]);
    });

    test("Rejects non-integers, out of range values and wrong types", () => {
        expect(validate(setting, { key: 1.5 })).toEqual([NotInteger]);

        expect(validate(setting, { key: -1 })).toEqual([OutOfRange]);
        expect(validate(setting, { key: "1" })).toEqual([InvalidType]);
    });
});

describe("Test DifficultyAdjustModSetting", () => {
    const setting = new DifficultyAdjustModSetting(
        "Test",
        "key",
        "Test setting",
        0,
        11,
        0.1,
        1,
    );

    test("Accepts null and scalars", () => {
        expect(validate(setting, { key: null })).toEqual([]);
        expect(validate(setting, { key: 7.5 })).toEqual([]);
        expect(validate(setting, { key: 7.5000001 })).toEqual([]);
    });

    test("Rejects invalid scalars", () => {
        expect(validate(setting, { key: 11.5 })).toEqual([OutOfRange]);

        expect(validate(setting, { key: 7.55 })).toEqual([NotOnStep]);

        expect(validate(setting, { key: "7" })).toEqual([InvalidType]);
        expect(validate(setting, { key: true })).toEqual([InvalidType]);
        expect(validate(setting, { key: [7] })).toEqual([InvalidType]);
    });

    describe("Legacy object format", () => {
        test("Accepts valid objects", () => {
            expect(
                validate(setting, { key: { adjusted: 7, original: 4 } }),
            ).toEqual([]);
        });

        test("Accepts absent and null fields", () => {
            expect(validate(setting, { key: {} })).toEqual([]);

            expect(
                validate(setting, {
                    key: { adjusted: null, original: null },
                }),
            ).toEqual([]);

            expect(validate(setting, { key: { adjusted: 7 } })).toEqual([]);
            expect(validate(setting, { key: { original: 4 } })).toEqual([]);
        });

        test("Does not range check original", () => {
            expect(
                validate(setting, {
                    key: { adjusted: 7, original: 99.123 },
                }),
            ).toEqual([]);

            expect(
                validate(setting, { key: { adjusted: 7, original: -5 } }),
            ).toEqual([]);
        });

        test("Rejects bad adjusted", () => {
            expect(
                validate(setting, { key: { adjusted: 12, original: 4 } }),
            ).toEqual([OutOfRange]);

            expect(
                validate(setting, { key: { adjusted: 7.55, original: 4 } }),
            ).toEqual([NotOnStep]);

            expect(
                validate(setting, { key: { adjusted: "7", original: 4 } }),
            ).toEqual([InvalidType]);
        });

        test("Rejects bad original", () => {
            const issues = validateIssues(setting, {
                key: { adjusted: 7, original: "4" },
            });

            expect(issues.map((issue) => issue.type)).toEqual([InvalidType]);
            expect(issues[0].message).toMatch(/^original: /);
        });

        test("Reports one issue per bad field", () => {
            const issues = validateIssues(setting, {
                key: { adjusted: 12, original: "4" },
            });

            expect(issues.map((issue) => issue.type)).toEqual([
                OutOfRange,
                InvalidType,
            ]);
            expect(issues[0].message).toMatch(/^adjusted: /);
            expect(issues[1].message).toMatch(/^original: /);
        });
    });
});

describe("Test EnumModSetting", () => {
    const setting = new EnumModSetting("Test", "key", "Test setting", "a", [
        "a",
        "b",
        "c",
    ]);

    test("Accepts valid indices", () => {
        for (const index of [0, 1, 2]) {
            expect(validate(setting, { key: index })).toEqual([]);
        }
    });

    test.each([[-1], [3]])("Rejects out of bounds index %p", (value) => {
        expect(validate(setting, { key: value })).toEqual([OutOfRange]);
    });

    test.each([[1.5], [NaN]])("Rejects non-integer index %p", (value) => {
        expect(validate(setting, { key: value })).toEqual([NotInteger]);
    });

    test.each([["1"], [null], [true], [{}]])("Rejects type %p", (value) => {
        expect(validate(setting, { key: value })).toEqual([InvalidType]);
    });
});
