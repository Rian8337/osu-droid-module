import {
    BeatmapDifficulty,
    ModCustomSpeed,
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
    Modes,
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

test("Calculate track rate multiplier", () => {
    const mods = [new ModHidden(), new ModDoubleTime()];

    expect(ModUtil.calculateRateWithMods(mods)).toBe(1.5);
});

describe("Test apply mods to beatmap difficulty", () => {
    describe("osu!droid game mode", () => {
        test("No Mod", () => {
            const difficulty = new BeatmapDifficulty();

            ModUtil.applyModsToBeatmapDifficulty(difficulty, Modes.droid, []);

            expect(difficulty.cs).toBe(5);
            expect(difficulty.ar).toBe(5);
            expect(difficulty.od).toBe(5);
            expect(difficulty.hp).toBe(5);
        });

        test("HR", () => {
            const difficulty = new BeatmapDifficulty();

            ModUtil.applyModsToBeatmapDifficulty(difficulty, Modes.droid, [
                new ModHardRock(),
            ]);

            expect(difficulty.cs).toBeCloseTo(6.258653241032096, 5);
            expect(difficulty.ar).toBe(7);
            expect(difficulty.od).toBe(7);
            expect(difficulty.hp).toBe(7);
        });

        test("DT", () => {
            const difficulty = new BeatmapDifficulty();

            ModUtil.applyModsToBeatmapDifficulty(
                difficulty,
                Modes.droid,
                [new ModDoubleTime()],
                true,
            );

            expect(difficulty.cs).toBe(5);
            expect(difficulty.ar).toBeCloseTo(7.666666666666666, 5);
            expect(difficulty.od).toBe(10);
            expect(difficulty.hp).toBe(5);
        });

        test("NC", () => {
            const difficulty = new BeatmapDifficulty();

            ModUtil.applyModsToBeatmapDifficulty(
                difficulty,
                Modes.droid,
                [new ModNightCore()],
                true,
            );

            expect(difficulty.cs).toBe(5);
            expect(difficulty.ar).toBeCloseTo(7.666666666666666, 5);
            expect(difficulty.od).toBe(10);
            expect(difficulty.hp).toBe(5);
        });

        test("CS 1.25x", () => {
            const difficulty = new BeatmapDifficulty();

            ModUtil.applyModsToBeatmapDifficulty(
                difficulty,
                Modes.droid,
                [new ModCustomSpeed(1.25)],
                true,
            );

            expect(difficulty.cs).toBe(5);
            expect(difficulty.ar).toBeCloseTo(6.6);
            expect(difficulty.od).toBe(8);
            expect(difficulty.hp).toBe(5);
        });

        test("DTHR, CS 1.25x", () => {
            const difficulty = new BeatmapDifficulty();

            ModUtil.applyModsToBeatmapDifficulty(
                difficulty,
                Modes.droid,
                [
                    new ModDoubleTime(),
                    new ModHardRock(),
                    new ModCustomSpeed(1.25),
                ],
                true,
            );

            expect(difficulty.cs).toBeCloseTo(6.258653241032096, 5);
            expect(difficulty.ar).toBeCloseTo(9.8);
            expect(difficulty.od).toBeCloseTo(13.066666666666666, 5);
            expect(difficulty.hp).toBe(7);
        });

        test("PR", () => {
            const difficulty = new BeatmapDifficulty();

            ModUtil.applyModsToBeatmapDifficulty(difficulty, Modes.droid, [
                new ModPrecise(),
            ]);

            expect(difficulty.cs).toBe(5);
            expect(difficulty.ar).toBe(5);
            expect(difficulty.od).toBe(5);
            expect(difficulty.hp).toBe(5);
        });

        test("DTPR", () => {
            const difficulty = new BeatmapDifficulty();

            ModUtil.applyModsToBeatmapDifficulty(
                difficulty,
                Modes.droid,
                [new ModDoubleTime(), new ModPrecise()],
                true,
            );

            expect(difficulty.cs).toBe(5);
            expect(difficulty.ar).toBeCloseTo(7.666666666666666, 5);
            expect(difficulty.od).toBeCloseTo(8.055555555555555, 5);
            expect(difficulty.hp).toBe(5);
        });
    });

    describe("osu!standard game mode", () => {
        test("No Mod", () => {
            const difficulty = new BeatmapDifficulty();

            ModUtil.applyModsToBeatmapDifficulty(difficulty, Modes.osu, []);

            expect(difficulty.cs).toBe(5);
            expect(difficulty.ar).toBe(5);
            expect(difficulty.od).toBe(5);
            expect(difficulty.hp).toBe(5);
        });

        test("HR", () => {
            const difficulty = new BeatmapDifficulty();

            ModUtil.applyModsToBeatmapDifficulty(difficulty, Modes.osu, [
                new ModHardRock(),
            ]);

            expect(difficulty.cs).toBeCloseTo(6.5);
            expect(difficulty.ar).toBe(7);
            expect(difficulty.od).toBe(7);
            expect(difficulty.hp).toBe(7);
        });

        test("DT", () => {
            const difficulty = new BeatmapDifficulty();

            ModUtil.applyModsToBeatmapDifficulty(
                difficulty,
                Modes.osu,
                [new ModDoubleTime()],
                true,
            );

            expect(difficulty.cs).toBe(5);
            expect(difficulty.ar).toBeCloseTo(7.666666666666666, 5);
            expect(difficulty.od).toBeCloseTo(7.777777777777778, 5);
            expect(difficulty.hp).toBe(5);
        });

        test("NC", () => {
            const difficulty = new BeatmapDifficulty();

            ModUtil.applyModsToBeatmapDifficulty(
                difficulty,
                Modes.osu,
                [new ModNightCore()],
                true,
            );

            expect(difficulty.cs).toBe(5);
            expect(difficulty.ar).toBeCloseTo(7.666666666666666, 5);
            expect(difficulty.od).toBeCloseTo(7.777777777777778, 5);
            expect(difficulty.hp).toBe(5);
        });

        test("CS 1.25x", () => {
            const difficulty = new BeatmapDifficulty();

            ModUtil.applyModsToBeatmapDifficulty(
                difficulty,
                Modes.osu,
                [new ModCustomSpeed(1.25)],
                true,
            );

            expect(difficulty.cs).toBe(5);
            expect(difficulty.ar).toBeCloseTo(6.6, 2);
            expect(difficulty.od).toBeCloseTo(6.666666666666667, 5);
            expect(difficulty.hp).toBe(5);
        });

        test("DTHR, CS 1.25x", () => {
            const difficulty = new BeatmapDifficulty();

            ModUtil.applyModsToBeatmapDifficulty(
                difficulty,
                Modes.osu,
                [
                    new ModDoubleTime(),
                    new ModHardRock(),
                    new ModCustomSpeed(1.25),
                ],
                true,
            );

            expect(difficulty.cs).toBeCloseTo(6.5);
            expect(difficulty.ar).toBeCloseTo(9.8);
            expect(difficulty.od).toBeCloseTo(9.955555555555556, 5);
            expect(difficulty.hp).toBe(7);
        });
    });
});
