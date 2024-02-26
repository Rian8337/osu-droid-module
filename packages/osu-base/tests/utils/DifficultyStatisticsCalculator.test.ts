import {
    Mod,
    ModDifficultyAdjust,
    ModDoubleTime,
    ModEasy,
    ModHalfTime,
    ModHardRock,
    ModNightCore,
    ModPrecise,
    ModReallyEasy,
    ModSmallCircle,
    calculateDroidDifficultyStatistics,
    calculateOsuDifficultyStatistics,
} from "../../src";

describe("Test circle size conversion", () => {
    describe("osu!droid game mode", () => {
        describe("Without conversion to osu!standard circle size", () => {
            const computeCS = (cs: number, mods: Mod[] = []) =>
                calculateDroidDifficultyStatistics({
                    circleSize: cs,
                    mods: mods,
                    convertCircleSize: false,
                }).circleSize;

            test("CS 4 without mods", () => {
                expect(computeCS(4)).toBeCloseTo(4);
            });

            test("CS 4 with HR", () => {
                expect(computeCS(4, [new ModHardRock()])).toBeCloseTo(
                    5.258653241032095,
                );
            });

            test("CS 5 with EZ", () => {
                expect(computeCS(5, [new ModEasy()])).toBeCloseTo(
                    3.7413467589679064,
                );
            });

            test("CS 5 with REZ", () => {
                expect(computeCS(5, [new ModReallyEasy()])).toBeCloseTo(
                    3.7413467589679064,
                );
            });

            test("CS 3 with HR + REZ", () => {
                expect(
                    computeCS(3, [new ModHardRock(), new ModReallyEasy()]),
                ).toBeCloseTo(3);
            });

            test("CS 4 with SC", () => {
                expect(computeCS(4, [new ModSmallCircle()])).toBeCloseTo(8);
            });

            test("CS 4 with force CS, HR", () => {
                expect(
                    calculateDroidDifficultyStatistics({
                        circleSize: 4,
                        mods: [
                            new ModHardRock(),
                            new ModDifficultyAdjust({ cs: 4 }),
                        ],
                        convertCircleSize: false,
                    }).circleSize,
                ).toBeCloseTo(4);
            });
        });

        describe("With conversion to osu!standard circle size", () => {
            const computeCS = (cs: number, mods: Mod[] = []) =>
                calculateDroidDifficultyStatistics({
                    circleSize: cs,
                    mods: mods,
                }).circleSize;

            test("CS 4 without mods", () => {
                expect(computeCS(4)).toBeCloseTo(-0.9737826917318708);
            });

            test("CS 4 with HR", () => {
                expect(computeCS(4, [new ModHardRock()])).toBeCloseTo(0.21);
            });

            test("CS 5 with EZ", () => {
                expect(computeCS(5, [new ModEasy()])).toBeCloseTo(-1.22);
            });

            test("CS 5 with REZ", () => {
                expect(computeCS(5, [new ModReallyEasy()])).toBeCloseTo(-1.22);
            });

            test("CS 3 with HR + REZ", () => {
                expect(
                    computeCS(3, [new ModHardRock(), new ModReallyEasy()]),
                ).toBeCloseTo(-1.9145734381140915);
            });

            test("CS 4 with SC", () => {
                expect(computeCS(4, [new ModSmallCircle()])).toBeCloseTo(2.79);
            });

            test("CS 4 with force CS, HR", () => {
                expect(
                    calculateDroidDifficultyStatistics({
                        circleSize: 4,
                        mods: [
                            new ModHardRock(),
                            new ModDifficultyAdjust({ cs: 4 }),
                        ],
                    }).circleSize,
                ).toBeCloseTo(-0.9737826917318708);
            });
        });
    });

    describe("osu!standard game mode", () => {
        const computeCS = (cs: number, mods: Mod[] = []) =>
            calculateOsuDifficultyStatistics({
                circleSize: cs,
                mods: mods,
            }).circleSize;

        test("CS 4 without mods", () => {
            expect(computeCS(4)).toBeCloseTo(4);
        });

        test("CS 4 with HR", () => {
            expect(computeCS(4, [new ModHardRock()])).toBeCloseTo(5.2);
        });

        test("CS 5 with EZ", () => {
            expect(computeCS(5, [new ModEasy()])).toBeCloseTo(2.5);
        });

        test("CS 5 with REZ", () => {
            expect(computeCS(5, [new ModReallyEasy()])).toBeCloseTo(5);
        });

        test("CS 3 with HR + REZ", () => {
            expect(
                computeCS(3, [new ModHardRock(), new ModReallyEasy()]),
            ).toBeCloseTo(3.9);
        });

        test("CS 4 with force CS, HR", () => {
            expect(
                calculateOsuDifficultyStatistics({
                    circleSize: 4,
                    mods: [
                        new ModHardRock(),
                        new ModDifficultyAdjust({ cs: 4 }),
                    ],
                }).circleSize,
            ).toBeCloseTo(4);
        });
    });
});

describe("Test approach rate conversion", () => {
    describe("osu!droid game mode", () => {
        const computeAR = (
            ar: number,
            mods: Mod[] = [],
            customSpeedMultiplier = 1,
            oldStatistics = false,
        ) => {
            return calculateDroidDifficultyStatistics({
                approachRate: ar,
                mods: mods,
                customSpeedMultiplier: customSpeedMultiplier,
                oldStatistics: oldStatistics,
            }).approachRate;
        };

        test("AR 9 without mods", () => {
            expect(computeAR(9)).toBeCloseTo(9);
        });

        test("AR 9 with HR", () => {
            expect(computeAR(9, [new ModHardRock()])).toBeCloseTo(10);
        });

        test("AR 8 with EZ", () => {
            expect(computeAR(8, [new ModEasy()])).toBeCloseTo(4);
        });

        test("AR 8 with REZ", () => {
            expect(computeAR(8, [new ModReallyEasy()])).toBeCloseTo(7.5);
        });

        test("AR 8 with EZ + REZ", () => {
            expect(computeAR(8, [new ModEasy(), new ModReallyEasy()])).toBe(7);
        });

        test("AR 7 with HR + REZ", () => {
            expect(
                computeAR(7, [new ModHardRock(), new ModReallyEasy()]),
            ).toBeCloseTo(9.3);
        });

        test("AR 9 with DT", () => {
            expect(computeAR(9, [new ModDoubleTime()])).toBeCloseTo(10.33);
        });

        test("AR 10 with HT", () => {
            expect(computeAR(10, [new ModHalfTime()])).toBeCloseTo(9);
        });

        test("AR 9 with NC, NC bug applied", () => {
            expect(
                computeAR(9, [new ModNightCore()], undefined, true),
            ).toBeCloseTo(10.12);
        });

        test("AR 9 with NC, NC bug not applied", () => {
            expect(computeAR(9, [new ModNightCore()])).toBeCloseTo(10.33);
        });

        test("AR 8 with force AR", () => {
            expect(
                computeAR(8, [
                    new ModHardRock(),
                    new ModDifficultyAdjust({ ar: 8 }),
                ]),
            ).toBeCloseTo(8);
        });

        test("AR 9 without mods, 1.25x speed multiplier", () => {
            expect(computeAR(9, undefined, 1.25)).toBeCloseTo(9.8);
        });

        test("AR 9 with HR, 1.5x speed multiplier", () => {
            expect(computeAR(9, [new ModHardRock()], 1.5)).toBeCloseTo(11);
        });

        test("AR 8 with EZ, 1.3x speed multiplier", () => {
            expect(computeAR(8, [new ModEasy()], 1.3)).toBeCloseTo(6.23);
        });

        test("AR 8 with REZ, 1.75x speed multiplier", () => {
            expect(computeAR(8, [new ModReallyEasy()], 1.75)).toBeCloseTo(9.43);
        });

        test("AR 7 with HR + REZ, 2x speed multiplier", () => {
            expect(
                computeAR(7, [new ModHardRock(), new ModReallyEasy()], 2),
            ).toBeCloseTo(10.65);
        });

        test("AR 9 with DT, 0.75x speed multiplier", () => {
            expect(computeAR(9, [new ModDoubleTime()], 0.75)).toBeCloseTo(9.44);
        });

        test("AR 10 with HT, 1.1x speed multiplier", () => {
            expect(computeAR(10, [new ModHalfTime()], 1.1)).toBeCloseTo(9.36);
        });

        test("AR 9 with NC, NC bug applied, 1.2x speed multiplier", () => {
            expect(computeAR(9, [new ModNightCore()], 1.2, true)).toBeCloseTo(
                10.6,
            );
        });

        test("AR 9 with NC, NC bug not applied, 1.05x speed multiplier", () => {
            expect(computeAR(9, [new ModNightCore()], 1.05)).toBeCloseTo(10.46);
        });

        test("AR 8 with force AR, 1.65x speed multiplier", () => {
            expect(
                computeAR(
                    8,
                    [new ModHardRock(), new ModDifficultyAdjust({ ar: 8 })],
                    1.65,
                ),
            ).toBeCloseTo(8);
        });
    });

    describe("osu!standard game mode", () => {
        const computeAR = (
            ar: number,
            mods: Mod[] = [],
            customSpeedMultiplier = 1,
        ) => {
            return calculateOsuDifficultyStatistics({
                approachRate: ar,
                mods: mods,
                customSpeedMultiplier: customSpeedMultiplier,
            }).approachRate;
        };

        test("AR 9 without mods", () => {
            expect(computeAR(9)).toBeCloseTo(9);
        });

        test("AR 9 with HR", () => {
            expect(computeAR(9, [new ModHardRock()])).toBeCloseTo(10);
        });

        test("AR 8 with EZ", () => {
            expect(computeAR(8, [new ModEasy()])).toBeCloseTo(4);
        });

        test("AR 8 with REZ", () => {
            expect(computeAR(8, [new ModReallyEasy()])).toBeCloseTo(8);
        });

        test("AR 7 with HR + REZ", () => {
            expect(
                computeAR(7, [new ModHardRock(), new ModReallyEasy()]),
            ).toBeCloseTo(9.8);
        });

        test("AR 9 with DT", () => {
            expect(computeAR(9, [new ModDoubleTime()])).toBeCloseTo(10.33);
        });

        test("AR 10 with HT", () => {
            expect(computeAR(10, [new ModHalfTime()])).toBeCloseTo(9);
        });

        test("AR 9 with NC", () => {
            expect(computeAR(9, [new ModNightCore()])).toBeCloseTo(10.33);
        });

        test("AR 9 with force AR", () => {
            expect(
                computeAR(9, [
                    new ModHardRock(),
                    new ModDifficultyAdjust({ ar: 9 }),
                ]),
            ).toBeCloseTo(9);
        });

        test("AR 9 without mods, 1.25x speed multiplier", () => {
            expect(computeAR(9, undefined, 1.25)).toBeCloseTo(9.8);
        });

        test("AR 9 with HR, 1.5x speed multiplier", () => {
            expect(computeAR(9, [new ModHardRock()], 1.5)).toBeCloseTo(11);
        });

        test("AR 8 with EZ, 1.3x speed multiplier", () => {
            expect(computeAR(8, [new ModEasy()], 1.3)).toBeCloseTo(6.23);
        });

        test("AR 8 with REZ, 1.75x speed multiplier", () => {
            expect(computeAR(8, [new ModReallyEasy()], 1.75)).toBeCloseTo(
                10.14,
            );
        });

        test("AR 7 with HR + REZ, 2x speed multiplier", () => {
            expect(
                computeAR(7, [new ModHardRock(), new ModReallyEasy()], 2),
            ).toBeCloseTo(11.4);
        });

        test("AR 9 with DT, 0.75x speed multiplier", () => {
            expect(computeAR(9, [new ModDoubleTime()], 0.75)).toBeCloseTo(9.44);
        });

        test("AR 10 with HT, 1.1x speed multiplier", () => {
            expect(computeAR(10, [new ModHalfTime()], 1.1)).toBeCloseTo(9.36);
        });

        test("AR 9 with DT, 0.75x speed multiplier", () => {
            expect(computeAR(9, [new ModDoubleTime()], 0.75)).toBeCloseTo(9.44);
        });

        test("AR 9 with NC, 1.2x speed multiplier", () => {
            expect(computeAR(9, [new ModNightCore()], 1.2)).toBeCloseTo(10.78);
        });

        test("AR 9 with NC, 1.05x speed multiplier", () => {
            expect(computeAR(9, [new ModNightCore()], 1.05)).toBeCloseTo(10.46);
        });

        test("AR 8 with force AR, 1.65x speed multiplier", () => {
            expect(
                computeAR(
                    8,
                    [new ModHardRock(), new ModDifficultyAdjust({ ar: 8 })],
                    1.65,
                ),
            ).toBeCloseTo(8);
        });
    });
});

describe("Test overall difficulty conversion", () => {
    describe("osu!droid game mode", () => {
        describe("Without conversion to osu!standard overall difficulty", () => {
            const computeOD = (
                od: number,
                mods: Mod[] = [],
                oldStatistics = false,
            ) => {
                return calculateDroidDifficultyStatistics({
                    overallDifficulty: od,
                    mods: mods,
                    convertOverallDifficulty: false,
                    oldStatistics: oldStatistics,
                }).overallDifficulty;
            };

            test("OD 9 without mods", () => {
                expect(computeOD(9)).toBeCloseTo(9);
            });

            test("OD 9 with HR", () => {
                expect(computeOD(9, [new ModHardRock()])).toBeCloseTo(10);
            });

            test("OD 8 with EZ", () => {
                expect(computeOD(8, [new ModEasy()])).toBeCloseTo(4);
            });

            test("OD 8 with REZ", () => {
                expect(computeOD(8, [new ModReallyEasy()])).toBeCloseTo(4);
            });

            test("OD 7 with HR + REZ", () => {
                expect(
                    computeOD(7, [new ModHardRock(), new ModReallyEasy()]),
                ).toBeCloseTo(4.9);
            });

            test("OD 10 with PR", () => {
                expect(computeOD(10, [new ModPrecise()])).toBeCloseTo(10);
            });

            test("OD 9 with DT", () => {
                expect(computeOD(9, [new ModDoubleTime()])).toBeCloseTo(
                    12.666666666666668,
                );
            });

            test("OD 10 with HT", () => {
                expect(computeOD(10, [new ModHalfTime()])).toBeCloseTo(
                    6.666666666666666,
                );
            });

            test("OD 9 with NC, NC bug applied", () => {
                expect(computeOD(9, [new ModNightCore()], true)).toBeCloseTo(
                    12.086330935251798,
                );
            });

            test("OD 9 with NC, NC bug not applied", () => {
                expect(computeOD(9, [new ModNightCore()])).toBeCloseTo(
                    12.666666666666668,
                );
            });

            test("OD 8 with force OD", () => {
                expect(
                    computeOD(8, [
                        new ModHardRock(),
                        new ModDifficultyAdjust({ od: 8 }),
                    ]),
                ).toBeCloseTo(8);
            });
        });

        describe("With conversion to osu!standard overall difficulty", () => {
            const computeOD = (
                od: number,
                mods: Mod[] = [],
                oldStatistics = false,
            ) => {
                return calculateDroidDifficultyStatistics({
                    overallDifficulty: od,
                    mods: mods,
                    oldStatistics: oldStatistics,
                }).overallDifficulty;
            };

            test("OD 9 without mods", () => {
                expect(computeOD(9)).toBeCloseTo(4.17);
            });

            test("OD 9 with HR", () => {
                expect(computeOD(9, [new ModHardRock()])).toBeCloseTo(5);
            });

            test("OD 8 with EZ", () => {
                expect(computeOD(8, [new ModEasy()])).toBeCloseTo(0);
            });

            test("OD 8 with REZ", () => {
                expect(computeOD(8, [new ModReallyEasy()])).toBeCloseTo(0);
            });

            test("OD 7 with HR + REZ", () => {
                expect(
                    computeOD(7, [new ModHardRock(), new ModReallyEasy()]),
                ).toBeCloseTo(0.75);
            });

            test("OD 10 with PR", () => {
                expect(computeOD(10, [new ModPrecise()])).toBeCloseTo(9.17);
            });

            test("OD 9 with DT", () => {
                expect(computeOD(9, [new ModDoubleTime()])).toBeCloseTo(7.22);
            });

            test("OD 10 with HT", () => {
                expect(computeOD(10, [new ModHalfTime()])).toBeCloseTo(2.22);
            });

            test("OD 9 with NC, NC bug applied", () => {
                expect(computeOD(9, [new ModNightCore()], true)).toBeCloseTo(
                    6.738609112709831,
                );
            });

            test("OD 9 with NC, NC bug not applied", () => {
                expect(computeOD(9, [new ModNightCore()])).toBeCloseTo(7.22);
            });
        });
    });

    describe("osu!standard game mode", () => {
        const computeOD = (od: number, mods: Mod[] = []) => {
            return calculateOsuDifficultyStatistics({
                overallDifficulty: od,
                mods: mods,
            }).overallDifficulty;
        };

        test("OD 9 without mods", () => {
            expect(computeOD(9)).toBeCloseTo(9);
        });

        test("OD 9 with HR", () => {
            expect(computeOD(9, [new ModHardRock()])).toBeCloseTo(10);
        });

        test("OD 8 with EZ", () => {
            expect(computeOD(8, [new ModEasy()])).toBeCloseTo(4);
        });

        test("OD 8 with REZ", () => {
            expect(computeOD(8, [new ModReallyEasy()])).toBeCloseTo(8);
        });

        test("OD 7 with HR + REZ", () => {
            expect(
                computeOD(7, [new ModHardRock(), new ModReallyEasy()]),
            ).toBeCloseTo(9.8);
        });

        test("OD 10 with PR", () => {
            expect(computeOD(10, [new ModPrecise()])).toBeCloseTo(10);
        });

        test("OD 9 with DT", () => {
            expect(computeOD(9, [new ModDoubleTime()])).toBeCloseTo(10.44);
        });

        test("OD 10 with HT", () => {
            expect(computeOD(10, [new ModHalfTime()])).toBeCloseTo(8.89);
        });

        test("OD 9 with NC", () => {
            expect(computeOD(9, [new ModNightCore()])).toBeCloseTo(10.44);
        });

        test("OD 9 with force OD", () => {
            expect(
                computeOD(9, [
                    new ModHardRock(),
                    new ModDifficultyAdjust({ od: 9 }),
                ]),
            ).toBeCloseTo(9);
        });
    });
});

describe("Test health drain conversion", () => {
    describe("osu!droid game mode", () => {
        const computeHP = (hp: number, mods: Mod[] = []) => {
            return calculateDroidDifficultyStatistics({
                healthDrain: hp,
                mods: mods,
            }).healthDrain;
        };

        test("HP 6 without mods", () => {
            expect(computeHP(6)).toBeCloseTo(6);
        });

        test("HP 7 with HR", () => {
            expect(computeHP(7, [new ModHardRock()])).toBeCloseTo(9.8);
        });

        test("HP 10 with EZ", () => {
            expect(computeHP(10, [new ModEasy()])).toBeCloseTo(5);
        });

        test("HP 9 with REZ", () => {
            expect(computeHP(9, [new ModReallyEasy()])).toBeCloseTo(4.5);
        });

        test("HP 5 with HR + REZ", () => {
            expect(
                computeHP(5, [new ModHardRock(), new ModReallyEasy()]),
            ).toBeCloseTo(3.5);
        });

        test("HP 6 with force HP, HR", () => {
            expect(
                computeHP(6, [
                    new ModHardRock(),
                    new ModDifficultyAdjust({ hp: 6 }),
                ]),
            ).toBeCloseTo(6);
        });
    });

    describe("osu!standard game mode", () => {
        const computeHP = (hp: number, mods: Mod[] = []) => {
            return calculateOsuDifficultyStatistics({
                healthDrain: hp,
                mods: mods,
            }).healthDrain;
        };

        test("HP 6 without mods", () => {
            expect(computeHP(6)).toBeCloseTo(6);
        });

        test("HP 7 with HR", () => {
            expect(computeHP(7, [new ModHardRock()])).toBeCloseTo(9.8);
        });

        test("HP 10 with EZ", () => {
            expect(computeHP(10, [new ModEasy()])).toBeCloseTo(5);
        });

        test("HP 9 with REZ", () => {
            expect(computeHP(9, [new ModReallyEasy()])).toBeCloseTo(9);
        });

        test("HP 5 with HR + REZ", () => {
            expect(
                computeHP(5, [new ModHardRock(), new ModReallyEasy()]),
            ).toBeCloseTo(7);
        });

        test("HP 7 with force HP, HR", () => {
            expect(
                computeHP(7, [
                    new ModHardRock(),
                    new ModDifficultyAdjust({ hp: 7 }),
                ]),
            ).toBeCloseTo(7);
        });
    });
});
