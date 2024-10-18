import {
    ModDifficultyAdjust,
    ModDoubleTime,
    ModEasy,
    ModHalfTime,
    ModHardRock,
    ModHidden,
    ModNightCore,
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

    test("NFDTDA", () => {
        const mods = [
            new ModNoFail(),
            new ModDoubleTime(),
            new ModDifficultyAdjust(),
        ];

        expect(ModUtil.modsToOsuString(mods)).toBe("NFDT");
    });
});

describe("Test removing speed changing mods", () => {
    test("Remove DT from HDDT", () => {
        const mods = [new ModHidden(), new ModDoubleTime()];

        expect(ModUtil.removeSpeedChangingMods(mods)).toEqual([
            new ModHidden(),
        ]);
    });

    test("Remove HT from NFHT", () => {
        const mods = [new ModNoFail(), new ModHalfTime()];

        expect(ModUtil.removeSpeedChangingMods(mods)).toEqual([
            new ModNoFail(),
        ]);
    });

    test("Remove NC from NFNC", () => {
        const mods = [new ModNoFail(), new ModNightCore()];

        expect(ModUtil.removeSpeedChangingMods(mods)).toEqual([
            new ModNoFail(),
        ]);
    });
});

test("Remove incompatible mods", () => {
    const mods = [new ModHardRock(), new ModEasy()];

    expect(ModUtil.checkIncompatibleMods(mods)).toEqual([new ModHardRock()]);
});

describe("Calculate track rate multiplier", () => {
    test("Without old statistics flag", () => {
        const mods = [new ModHidden(), new ModDoubleTime()];

        expect(ModUtil.calculateRateWithMods(mods)).toBe(1.5);
    });

    test("With old statistics flag", () => {
        const mods = [new ModHidden(), new ModNightCore()];

        expect(ModUtil.calculateRateWithMods(mods, true)).toBe(1.39);
    });
});
