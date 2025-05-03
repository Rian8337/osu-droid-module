import {
    BeatmapDifficulty,
    ModCustomSpeed,
    ModDifficultyAdjust,
    ModDoubleTime,
    ModEasy,
    ModHalfTime,
    ModHardRock,
    ModHidden,
    ModMap,
    ModNightCore,
    ModNoFail,
    ModPrecise,
    ModUtil,
    Modes,
} from "../../src";

describe("Test PC modbits to mods conversion", () => {
    test("NM", () => {
        const mods = ModUtil.pcModbitsToMods(0);

        expect(mods.size).toBe(0);
        expect(mods.isEmpty).toBe(true);
    });

    test("HDHR", () => {
        const mods = ModUtil.pcModbitsToMods(24);

        expect(mods.size).toBe(2);
        expect(mods.has(ModHidden)).toBe(true);
        expect(mods.has(ModHardRock)).toBe(true);
    });

    test("HDDT", () => {
        const mods = ModUtil.pcModbitsToMods(72);

        expect(mods.size).toBe(2);
        expect(mods.has(ModHidden)).toBe(true);
        expect(mods.has(ModDoubleTime)).toBe(true);
    });

    test("NFHDHT", () => {
        const mods = ModUtil.pcModbitsToMods(265);

        expect(mods.size).toBe(3);
        expect(mods.has(ModNoFail)).toBe(true);
        expect(mods.has(ModHidden)).toBe(true);
        expect(mods.has(ModHalfTime)).toBe(true);
    });
});

describe("Test PC string to mods conversion", () => {
    test("NM", () => {
        const mods = ModUtil.pcStringToMods("");

        expect(mods.size).toBe(0);
        expect(mods.isEmpty).toBe(true);
    });

    test("HDHR", () => {
        const mods = ModUtil.pcStringToMods("HDHR");

        expect(mods.size).toBe(2);
        expect(mods.has(ModHidden)).toBe(true);
        expect(mods.has(ModHardRock)).toBe(true);
    });

    test("HDDT", () => {
        const mods = ModUtil.pcStringToMods("HDDT");

        expect(mods.size).toBe(2);
        expect(mods.has(ModHidden)).toBe(true);
        expect(mods.has(ModDoubleTime)).toBe(true);
    });

    test("NFHTPR", () => {
        const mods = ModUtil.pcStringToMods("NFHTPR");

        expect(mods.size).toBe(3);
        expect(mods.has(ModNoFail)).toBe(true);
        expect(mods.has(ModHalfTime)).toBe(true);
        expect(mods.has(ModPrecise)).toBe(true);
    });

    test("HREZ (incompatible mods)", () => {
        const mods = ModUtil.pcStringToMods("HREZ");

        expect(mods.size).toBe(1);
        expect(mods.has(ModEasy)).toBe(true);
    });
});

describe("Test mods array to osu!standard string conversion", () => {
    test("NM", () => {
        const mods = ModUtil.pcStringToMods("");

        expect(ModUtil.modsToOsuString(mods.values())).toBe("");
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

test("Calculate track rate multiplier", () => {
    const mods = [new ModHidden(), new ModDoubleTime()];

    expect(ModUtil.calculateRateWithMods(mods)).toBe(1.5);
});

describe("Test apply mods to beatmap difficulty", () => {
    describe("osu!droid game mode", () => {
        test("No Mod", () => {
            const difficulty = new BeatmapDifficulty();

            ModUtil.applyModsToBeatmapDifficulty(difficulty, Modes.droid);

            expect(difficulty.cs).toBe(5);
            expect(difficulty.ar).toBe(5);
            expect(difficulty.od).toBe(5);
            expect(difficulty.hp).toBe(5);
        });

        test("HR", () => {
            const difficulty = new BeatmapDifficulty();
            const mods = new ModMap();
            mods.set(new ModHardRock());

            ModUtil.applyModsToBeatmapDifficulty(difficulty, Modes.droid, mods);

            expect(difficulty.cs).toBeCloseTo(6.5);
            expect(difficulty.ar).toBe(7);
            expect(difficulty.od).toBe(7);
            expect(difficulty.hp).toBe(7);
        });

        test("DT", () => {
            const difficulty = new BeatmapDifficulty();
            const mods = new ModMap();
            mods.set(new ModDoubleTime());

            ModUtil.applyModsToBeatmapDifficulty(
                difficulty,
                Modes.droid,
                mods,
                true,
            );

            expect(difficulty.cs).toBe(5);
            expect(difficulty.ar).toBeCloseTo(7.666666666666666, 5);
            expect(difficulty.od).toBe(10);
            expect(difficulty.hp).toBe(5);
        });

        test("NC", () => {
            const difficulty = new BeatmapDifficulty();
            const mods = new ModMap();
            mods.set(new ModNightCore());

            ModUtil.applyModsToBeatmapDifficulty(
                difficulty,
                Modes.droid,
                mods,
                true,
            );

            expect(difficulty.cs).toBe(5);
            expect(difficulty.ar).toBeCloseTo(7.666666666666666, 5);
            expect(difficulty.od).toBe(10);
            expect(difficulty.hp).toBe(5);
        });

        test("CS 1.25x", () => {
            const difficulty = new BeatmapDifficulty();
            const mods = new ModMap();
            mods.set(new ModCustomSpeed(1.25));

            ModUtil.applyModsToBeatmapDifficulty(
                difficulty,
                Modes.droid,
                mods,
                true,
            );

            expect(difficulty.cs).toBe(5);
            expect(difficulty.ar).toBeCloseTo(6.6);
            expect(difficulty.od).toBe(8);
            expect(difficulty.hp).toBe(5);
        });

        test("DTHR, CS 1.25x", () => {
            const difficulty = new BeatmapDifficulty();
            const mods = new ModMap();
            mods.set(new ModDoubleTime());
            mods.set(new ModHardRock());
            mods.set(new ModCustomSpeed(1.25));

            ModUtil.applyModsToBeatmapDifficulty(
                difficulty,
                Modes.droid,
                mods,
                true,
            );

            expect(difficulty.cs).toBeCloseTo(6.5);
            expect(difficulty.ar).toBeCloseTo(9.8);
            expect(difficulty.od).toBeCloseTo(13.066666666666666, 5);
            expect(difficulty.hp).toBe(7);
        });

        test("PR", () => {
            const difficulty = new BeatmapDifficulty();
            const mods = new ModMap();
            mods.set(new ModPrecise());

            ModUtil.applyModsToBeatmapDifficulty(difficulty, Modes.droid, mods);

            expect(difficulty.cs).toBe(5);
            expect(difficulty.ar).toBe(5);
            expect(difficulty.od).toBe(5);
            expect(difficulty.hp).toBe(5);
        });

        test("DTPR", () => {
            const difficulty = new BeatmapDifficulty();
            const mods = new ModMap();
            mods.set(new ModDoubleTime());
            mods.set(new ModPrecise());

            ModUtil.applyModsToBeatmapDifficulty(
                difficulty,
                Modes.droid,
                mods,
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

            ModUtil.applyModsToBeatmapDifficulty(difficulty, Modes.osu);

            expect(difficulty.cs).toBe(5);
            expect(difficulty.ar).toBe(5);
            expect(difficulty.od).toBe(5);
            expect(difficulty.hp).toBe(5);
        });

        test("HR", () => {
            const difficulty = new BeatmapDifficulty();
            const mods = new ModMap();
            mods.set(new ModHardRock());

            ModUtil.applyModsToBeatmapDifficulty(difficulty, Modes.osu, mods);

            expect(difficulty.cs).toBeCloseTo(6.5);
            expect(difficulty.ar).toBe(7);
            expect(difficulty.od).toBe(7);
            expect(difficulty.hp).toBe(7);
        });

        test("DT", () => {
            const difficulty = new BeatmapDifficulty();
            const mods = new ModMap();
            mods.set(new ModDoubleTime());

            ModUtil.applyModsToBeatmapDifficulty(
                difficulty,
                Modes.osu,
                mods,
                true,
            );

            expect(difficulty.cs).toBe(5);
            expect(difficulty.ar).toBeCloseTo(7.666666666666666, 5);
            expect(difficulty.od).toBeCloseTo(7.777777777777778, 5);
            expect(difficulty.hp).toBe(5);
        });

        test("NC", () => {
            const difficulty = new BeatmapDifficulty();
            const mods = new ModMap();
            mods.set(new ModNightCore());

            ModUtil.applyModsToBeatmapDifficulty(
                difficulty,
                Modes.osu,
                mods,
                true,
            );

            expect(difficulty.cs).toBe(5);
            expect(difficulty.ar).toBeCloseTo(7.666666666666666, 5);
            expect(difficulty.od).toBeCloseTo(7.777777777777778, 5);
            expect(difficulty.hp).toBe(5);
        });

        test("CS 1.25x", () => {
            const difficulty = new BeatmapDifficulty();
            const mods = new ModMap();
            mods.set(new ModCustomSpeed(1.25));

            ModUtil.applyModsToBeatmapDifficulty(
                difficulty,
                Modes.osu,
                mods,
                true,
            );

            expect(difficulty.cs).toBe(5);
            expect(difficulty.ar).toBeCloseTo(6.6, 2);
            expect(difficulty.od).toBeCloseTo(6.666666666666667, 5);
            expect(difficulty.hp).toBe(5);
        });

        test("DTHR, CS 1.25x", () => {
            const difficulty = new BeatmapDifficulty();
            const mods = new ModMap();
            mods.set(new ModDoubleTime());
            mods.set(new ModHardRock());
            mods.set(new ModCustomSpeed(1.25));

            ModUtil.applyModsToBeatmapDifficulty(
                difficulty,
                Modes.osu,
                mods,
                true,
            );

            expect(difficulty.cs).toBeCloseTo(6.5);
            expect(difficulty.ar).toBeCloseTo(9.8);
            expect(difficulty.od).toBeCloseTo(9.955555555555556, 5);
            expect(difficulty.hp).toBe(7);
        });
    });
});

test("Test ordered mod string", () => {
    expect(ModUtil.modsToOrderedString([new ModDoubleTime()])).toBe("DT");

    expect(
        ModUtil.modsToOrderedString([new ModHidden(), new ModHardRock()]),
    ).toBe("HD,HR");

    expect(
        ModUtil.modsToOrderedString([
            new ModHidden(),
            new ModCustomSpeed(1.25),
        ]),
    ).toBe("HD,CS (1.25x)");

    expect(
        ModUtil.modsToOrderedString([
            new ModHardRock(),
            new ModDifficultyAdjust({ cs: 4 }),
        ]),
    ).toBe("HR,DA (CS4.0)");
});
