import {
    Mod,
    ModUtil,
    NullableDecimalModSetting,
    NumberModSetting,
} from "../../../src";

/**
 * We snap relative to 0 and then clamps, osu!lazer clamps and then snaps relative to 0, and the
 * osu!droid client clamps and then snaps relative to `min`. These agree only if `min` and `max` are
 * multiples of the step, so every setting must satisfy that.
 */
const tolerance = 1e-9;

function isStepMultiple(value: number, step: number): boolean {
    const multiple = value / step;

    return Math.abs(multiple - Math.round(multiple)) <= tolerance;
}

interface Case {
    readonly label: string;
    readonly value: number;
    readonly step: number;
}

function collectCases(): Case[] {
    const cases: Case[] = [];

    for (const [acronym, modType] of ModUtil.allMods) {
        const mod = new (modType as new () => Mod)();

        for (const setting of mod.settings) {
            if (
                !(setting instanceof NumberModSetting) &&
                !(setting instanceof NullableDecimalModSetting)
            ) {
                continue;
            }

            const step = setting.step!;

            if (step <= 0) {
                continue;
            }

            const label = `${acronym}.${setting.key ?? setting.name}`;

            cases.push(
                { label: `${label} min`, value: setting.min!, step },
                { label: `${label} max`, value: setting.max!, step },
            );

            if (setting.defaultValue !== null) {
                cases.push({
                    label: `${label} default`,
                    value: setting.defaultValue,
                    step,
                });
            }
        }
    }

    return cases;
}

describe("Test step alignment of mod settings", () => {
    const cases = collectCases();

    test("Cases are collected", () => {
        expect(cases.length).toBeGreaterThan(0);
    });

    test.each(cases.map((c) => [c.label, c] as const))(
        "%s is a multiple of the step",
        (_, c) => {
            expect(isStepMultiple(c.value, c.step)).toBe(true);
        },
    );
});
