import {
    ModDoubleTime,
    ModHalfTime,
    ModHardRock,
    ModHidden,
    ModNoFail,
    ModPrecise,
    ModUtil,
} from "../../src";

describe("Test droid string to mods conversion", () => {
    test("NM", () => {
        const mods = ModUtil.droidStringToMods("");

        expect(mods.length).toBe(0);
    });

    test("HDHR", () => {
        const mods = ModUtil.droidStringToMods("hr");

        expect(mods.length).toBe(2);
        expect(mods.some((m) => m instanceof ModHidden)).toBe(true);
        expect(mods.some((m) => m instanceof ModHardRock)).toBe(true);
    });

    test("HDDT", () => {
        const mods = ModUtil.droidStringToMods("hd");

        expect(mods.length).toBe(2);
        expect(mods.some((m) => m instanceof ModHidden)).toBe(true);
        expect(mods.some((m) => m instanceof ModDoubleTime)).toBe(true);
    });

    test("NFHTPR", () => {
        const mods = ModUtil.droidStringToMods("nts");

        expect(mods.length).toBe(3);
        expect(mods.some((m) => m instanceof ModNoFail)).toBe(true);
        expect(mods.some((m) => m instanceof ModHalfTime)).toBe(true);
        expect(mods.some((m) => m instanceof ModPrecise)).toBe(true);
    });
});

describe("Test PC string to mods conversion", () => {
    test("NM", () => {
        const mods = ModUtil.pcStringToMods("");

        expect(mods.length).toBe(0);
    });

    test("HDHR", () => {
        const mods = ModUtil.pcStringToMods("HDHR");

        expect(mods.length).toBe(2);
        expect(mods.some((m) => m instanceof ModHidden)).toBe(true);
        expect(mods.some((m) => m instanceof ModHardRock)).toBe(true);
    });

    test("HDDT", () => {
        const mods = ModUtil.pcStringToMods("HDDT");

        expect(mods.length).toBe(2);
        expect(mods.some((m) => m instanceof ModHidden)).toBe(true);
        expect(mods.some((m) => m instanceof ModDoubleTime)).toBe(true);
    });

    test("NFHTPR", () => {
        const mods = ModUtil.pcStringToMods("NFHTPR");

        expect(mods.length).toBe(3);
        expect(mods.some((m) => m instanceof ModNoFail)).toBe(true);
        expect(mods.some((m) => m instanceof ModHalfTime)).toBe(true);
        expect(mods.some((m) => m instanceof ModPrecise)).toBe(true);
    });
});
