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

describe("Test PC modbits to mods conversion", () => {
    test("NM", () => {
        const mods = ModUtil.pcModbitsToMods(0);

        expect(mods.length).toBe(0);
    });

    test("HDHR", () => {
        const mods = ModUtil.pcModbitsToMods(24);

        expect(mods.length).toBe(2);
        expect(mods.some((m) => m instanceof ModHidden)).toBe(true);
        expect(mods.some((m) => m instanceof ModHardRock)).toBe(true);
    });

    test("HDDT", () => {
        const mods = ModUtil.pcModbitsToMods(72);

        expect(mods.length).toBe(2);
        expect(mods.some((m) => m instanceof ModHidden)).toBe(true);
        expect(mods.some((m) => m instanceof ModDoubleTime)).toBe(true);
    });

    test("NFHDHT", () => {
        const mods = ModUtil.pcModbitsToMods(265);

        expect(mods.length).toBe(3);
        expect(mods.some((m) => m instanceof ModNoFail)).toBe(true);
        expect(mods.some((m) => m instanceof ModHidden)).toBe(true);
        expect(mods.some((m) => m instanceof ModHalfTime)).toBe(true);
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

    test("HREZ (incompatible mods)", () => {
        const mods = ModUtil.pcStringToMods("HREZ");

        expect(mods.length).toBe(1);
        expect(mods[0]).toBeInstanceOf(ModHardRock);
    });
});

describe("Test mods array to osu!droid string conversion", () => {
    test("NM", () => {
        const mods = ModUtil.droidStringToMods("");

        expect(ModUtil.modsToDroidString(mods)).toBe("");
    });

    test("HDHR", () => {
        const mods = [new ModHidden(), new ModHardRock()];

        expect(ModUtil.modsToDroidString(mods)).toBe("hr");
    });

    test("NFHTPR", () => {
        const mods = [new ModNoFail(), new ModHalfTime(), new ModPrecise()];

        expect(ModUtil.modsToDroidString(mods)).toBe("nts");
    });
});

describe("Test mods array to osu!standard string conversion", () => {
    test("NM", () => {
        const mods = ModUtil.pcStringToMods("");

        expect(ModUtil.modsToOsuString(mods)).toBe("");
    });

    test("HDHR", () => {
        const mods = [new ModHidden(), new ModHardRock()];

        expect(ModUtil.modsToOsuString(mods)).toBe("HDHR");
    });

    test("NFHTPR", () => {
        const mods = [new ModNoFail(), new ModHalfTime(), new ModPrecise()];

        expect(ModUtil.modsToOsuString(mods)).toBe("NFHTPR");
    });
});
