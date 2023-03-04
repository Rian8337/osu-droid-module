import {
    MapStats,
    Mod,
    ModDoubleTime,
    ModEasy,
    Modes,
    ModHalfTime,
    ModHardRock,
    ModNightCore,
    ModPrecise,
    ModReallyEasy,
} from "../../src";

describe("Test OD conversion without speed multiplier", () => {
    const createStats = (params: {
        od: number;
        mode: Modes;
        mods?: Mod[];
        oldStatistics?: boolean;
        convertDroidOD?: boolean;
    }) => {
        return new MapStats(params).calculate({
            mode: params.mode,
            convertDroidOD: params.convertDroidOD,
        });
    };

    describe("Test osu!droid OD conversion", () => {
        describe("Without conversion to osu!standard OD", () => {
            test("OD 9 without mods", () => {
                const stats = createStats({
                    od: 9,
                    mode: Modes.droid,
                    convertDroidOD: false,
                });

                expect(stats.od).toBeCloseTo(9);
            });

            test("OD 9 with HR", () => {
                const stats = createStats({
                    od: 9,
                    mode: Modes.droid,
                    mods: [new ModHardRock()],
                    convertDroidOD: false,
                });

                expect(stats.od).toBeCloseTo(10);
            });

            test("OD 8 with EZ", () => {
                const stats = createStats({
                    od: 8,
                    mode: Modes.droid,
                    mods: [new ModEasy()],
                    convertDroidOD: false,
                });

                expect(stats.od).toBeCloseTo(4);
            });

            test("OD 8 with REZ", () => {
                const stats = createStats({
                    od: 8,
                    mode: Modes.droid,
                    mods: [new ModReallyEasy()],
                    convertDroidOD: false,
                });

                expect(stats.od).toBeCloseTo(4);
            });

            test("OD 7 with HR + REZ", () => {
                const stats = createStats({
                    od: 7,
                    mode: Modes.droid,
                    mods: [new ModHardRock(), new ModReallyEasy()],
                    convertDroidOD: false,
                });

                expect(stats.od).toBeCloseTo(4.9);
            });

            test("OD 10 with PR", () => {
                const stats = createStats({
                    od: 10,
                    mode: Modes.droid,
                    mods: [new ModPrecise()],
                    convertDroidOD: false,
                });

                expect(stats.od).toBeCloseTo(10);
            });

            test("OD 9 with DT", () => {
                const stats = createStats({
                    od: 9,
                    mode: Modes.droid,
                    mods: [new ModDoubleTime()],
                    convertDroidOD: false,
                });

                expect(stats.od).toBeCloseTo(12.666666666666668);
            });

            test("OD 10 with HT", () => {
                const stats = createStats({
                    od: 10,
                    mode: Modes.droid,
                    mods: [new ModHalfTime()],
                    convertDroidOD: false,
                });

                expect(stats.od).toBeCloseTo(6.666666666666666);
            });

            test("OD 9 with NC, NC bug applied", () => {
                const stats = createStats({
                    od: 9,
                    mode: Modes.droid,
                    mods: [new ModNightCore()],
                    oldStatistics: true,
                    convertDroidOD: false,
                });

                expect(stats.od).toBeCloseTo(12.086330935251798);
            });

            test("OD 9 with NC, NC bug not applied", () => {
                const stats = createStats({
                    od: 9,
                    mode: Modes.droid,
                    mods: [new ModNightCore()],
                    convertDroidOD: false,
                });

                expect(stats.od).toBeCloseTo(12.666666666666668);
            });
        });

        describe("With conversion to osu!standard OD", () => {
            test("OD 9 without mods", () => {
                const stats = createStats({
                    od: 9,
                    mode: Modes.droid,
                });

                expect(stats.od).toBeCloseTo(4.17);
            });

            test("OD 9 with HR", () => {
                const stats = createStats({
                    od: 9,
                    mode: Modes.droid,
                    mods: [new ModHardRock()],
                });

                expect(stats.od).toBeCloseTo(5);
            });

            test("OD 8 with EZ", () => {
                const stats = createStats({
                    od: 8,
                    mode: Modes.droid,
                    mods: [new ModEasy()],
                });

                expect(stats.od).toBeCloseTo(0);
            });

            test("OD 8 with REZ", () => {
                const stats = createStats({
                    od: 8,
                    mode: Modes.droid,
                    mods: [new ModReallyEasy()],
                });

                expect(stats.od).toBeCloseTo(0);
            });

            test("OD 7 with HR + REZ", () => {
                const stats = createStats({
                    od: 7,
                    mode: Modes.droid,
                    mods: [new ModHardRock(), new ModReallyEasy()],
                });

                expect(stats.od).toBeCloseTo(0.75);
            });

            test("OD 10 with PR", () => {
                const stats = createStats({
                    od: 10,
                    mode: Modes.droid,
                    mods: [new ModPrecise()],
                });

                expect(stats.od).toBeCloseTo(9.17);
            });

            test("OD 9 with DT", () => {
                const stats = createStats({
                    od: 9,
                    mode: Modes.droid,
                    mods: [new ModDoubleTime()],
                });

                expect(stats.od).toBeCloseTo(7.22);
            });

            test("OD 10 with HT", () => {
                const stats = createStats({
                    od: 10,
                    mode: Modes.droid,
                    mods: [new ModHalfTime()],
                });

                expect(stats.od).toBeCloseTo(2.22);
            });

            test("OD 9 with NC, NC bug applied", () => {
                const stats = createStats({
                    od: 9,
                    mode: Modes.droid,
                    mods: [new ModNightCore()],
                    oldStatistics: true,
                });

                expect(stats.od).toBeCloseTo(6.74);
            });

            test("OD 9 with NC, NC bug not applied", () => {
                const stats = createStats({
                    od: 9,
                    mode: Modes.droid,
                    mods: [new ModNightCore()],
                });

                expect(stats.od).toBeCloseTo(7.22);
            });
        });
    });

    describe("Test osu!standard OD conversion", () => {
        test("OD 9 without mods", () => {
            const stats = createStats({
                od: 9,
                mode: Modes.osu,
            });

            expect(stats.od).toBeCloseTo(9);
        });

        test("OD 9 with HR", () => {
            const stats = createStats({
                od: 9,
                mode: Modes.osu,
                mods: [new ModHardRock()],
            });

            expect(stats.od).toBeCloseTo(10);
        });

        test("OD 8 with EZ", () => {
            const stats = createStats({
                od: 8,
                mode: Modes.osu,
                mods: [new ModEasy()],
            });

            expect(stats.od).toBeCloseTo(4);
        });

        test("OD 8 with REZ", () => {
            const stats = createStats({
                od: 8,
                mode: Modes.osu,
                mods: [new ModReallyEasy()],
            });

            expect(stats.od).toBeCloseTo(8);
        });

        test("OD 7 with HR + REZ", () => {
            const stats = createStats({
                od: 7,
                mode: Modes.osu,
                mods: [new ModHardRock(), new ModReallyEasy()],
            });

            expect(stats.od).toBeCloseTo(9.8);
        });

        test("OD 10 with PR", () => {
            const stats = createStats({
                od: 10,
                mode: Modes.osu,
                mods: [new ModPrecise()],
            });

            expect(stats.od).toBeCloseTo(10);
        });

        test("OD 9 with DT", () => {
            const stats = createStats({
                od: 9,
                mode: Modes.osu,
                mods: [new ModDoubleTime()],
            });

            expect(stats.od).toBeCloseTo(10.44);
        });

        test("OD 10 with HT", () => {
            const stats = createStats({
                od: 10,
                mode: Modes.osu,
                mods: [new ModHalfTime()],
            });

            expect(stats.od).toBeCloseTo(8.89);
        });

        test("OD 9 with NC, NC bug applied", () => {
            const stats = createStats({
                od: 9,
                mode: Modes.osu,
                mods: [new ModNightCore()],
                oldStatistics: true,
            });

            expect(stats.od).toBeCloseTo(10.44);
        });

        test("OD 9 with NC, NC bug not applied", () => {
            const stats = createStats({
                od: 9,
                mode: Modes.osu,
                mods: [new ModNightCore()],
            });

            expect(stats.od).toBeCloseTo(10.44);
        });
    });
});

describe("Test OD conversion with speed multiplier", () => {
    const createStats = (params: {
        od: number;
        mode: Modes;
        speedMultiplier: number;
        mods?: Mod[];
        isForceAR?: boolean;
        oldStatistics?: boolean;
        convertDroidOD?: boolean;
    }) => {
        return new MapStats(params).calculate({
            mode: params.mode,
            convertDroidOD: params.convertDroidOD,
        });
    };

    describe("Test osu!droid OD conversion", () => {
        describe("Without conversion to osu!standard OD", () => {
            test("OD 9 without mods, 1.25x speed multiplier", () => {
                const stats = createStats({
                    od: 9,
                    mode: Modes.droid,
                    speedMultiplier: 1.25,
                    convertDroidOD: false,
                });

                expect(stats.od).toBeCloseTo(11.2);
            });

            test("OD 9 with HR, 1.5x speed multiplier", () => {
                const stats = createStats({
                    od: 9,
                    mode: Modes.droid,
                    speedMultiplier: 1.5,
                    mods: [new ModHardRock()],
                    convertDroidOD: false,
                });

                expect(stats.od).toBeCloseTo(13.333333333333332);
            });

            test("OD 8 with EZ, 1.3x speed multiplier", () => {
                const stats = createStats({
                    od: 8,
                    mode: Modes.droid,
                    speedMultiplier: 1.3,
                    mods: [new ModEasy()],
                    convertDroidOD: false,
                });

                expect(stats.od).toBeCloseTo(7.692307692307693);
            });

            test("OD 8 with REZ, 1.75x speed multiplier", () => {
                const stats = createStats({
                    od: 8,
                    mode: Modes.droid,
                    speedMultiplier: 1.75,
                    mods: [new ModReallyEasy()],
                    convertDroidOD: false,
                });

                expect(stats.od).toBeCloseTo(10.857142857142858);
            });

            test("OD 7 with HR + REZ, 2x speed multiplier", () => {
                const stats = createStats({
                    od: 7,
                    mode: Modes.droid,
                    speedMultiplier: 2,
                    mods: [new ModHardRock(), new ModReallyEasy()],
                    convertDroidOD: false,
                });

                expect(stats.od).toBeCloseTo(12.45);
            });

            test("OD 10 with PR, 1.2x speed multiplier", () => {
                const stats = createStats({
                    od: 10,
                    mode: Modes.droid,
                    speedMultiplier: 1.2,
                    mods: [new ModPrecise()],
                    convertDroidOD: false,
                });

                expect(stats.od).toBeCloseTo(10.694444444444443);
            });

            test("OD 9 with DT, 0.75x speed multiplier", () => {
                const stats = createStats({
                    od: 9,
                    mode: Modes.droid,
                    speedMultiplier: 0.75,
                    mods: [new ModDoubleTime()],
                    convertDroidOD: false,
                });

                expect(stats.od).toBeCloseTo(10.222222222222223);
            });

            test("OD 10 with HT, 1.1x speed multiplier", () => {
                const stats = createStats({
                    od: 10,
                    mode: Modes.droid,
                    speedMultiplier: 1.1,
                    mods: [new ModHalfTime()],
                    convertDroidOD: false,
                });

                expect(stats.od).toBeCloseTo(7.87878787878788);
            });

            test("OD 9 with NC, NC bug applied, 1.2x speed multiplier", () => {
                const stats = createStats({
                    od: 9,
                    mode: Modes.droid,
                    speedMultiplier: 1.2,
                    mods: [new ModNightCore()],
                    oldStatistics: true,
                    convertDroidOD: false,
                });

                expect(stats.od).toBeCloseTo(13.405275779376499);
            });

            test("OD 9 with NC, NC bug not applied, 1.05x speed multiplier", () => {
                const stats = createStats({
                    od: 9,
                    mode: Modes.droid,
                    speedMultiplier: 1.05,
                    mods: [new ModNightCore()],
                    convertDroidOD: false,
                });

                expect(stats.od).toBeCloseTo(13.015873015873016);
            });
        });

        describe("With conversion to osu!standard OD", () => {
            test("OD 9 without mods, 1.25x speed multiplier", () => {
                const stats = createStats({
                    od: 9,
                    mode: Modes.droid,
                    speedMultiplier: 1.25,
                });

                expect(stats.od).toBeCloseTo(6);
            });

            test("OD 9 with HR, 1.5x speed multiplier", () => {
                const stats = createStats({
                    od: 9,
                    mode: Modes.droid,
                    speedMultiplier: 1.5,
                    mods: [new ModHardRock()],
                });

                expect(stats.od).toBeCloseTo(7.78);
            });

            test("OD 8 with EZ, 1.3x speed multiplier", () => {
                const stats = createStats({
                    od: 8,
                    mode: Modes.droid,
                    speedMultiplier: 1.3,
                    mods: [new ModEasy()],
                });

                expect(stats.od).toBeCloseTo(3.08);
            });

            test("OD 8 with REZ, 1.75x speed multiplier", () => {
                const stats = createStats({
                    od: 8,
                    mode: Modes.droid,
                    speedMultiplier: 1.75,
                    mods: [new ModReallyEasy()],
                });

                expect(stats.od).toBeCloseTo(5.714285714285714);
            });

            test("OD 7 with HR + REZ, 2x speed multiplier", () => {
                const stats = createStats({
                    od: 7,
                    mode: Modes.droid,
                    speedMultiplier: 2,
                    mods: [new ModHardRock(), new ModReallyEasy()],
                });

                expect(stats.od).toBeCloseTo(7.041666666666667);
            });

            test("OD 10 with PR, 1.2x speed multiplier", () => {
                const stats = createStats({
                    od: 10,
                    mode: Modes.droid,
                    speedMultiplier: 1.2,
                    mods: [new ModPrecise()],
                });

                expect(stats.od).toBeCloseTo(9.86);
            });

            test("OD 9 with DT, 0.75x speed multiplier", () => {
                const stats = createStats({
                    od: 9,
                    mode: Modes.droid,
                    speedMultiplier: 0.75,
                    mods: [new ModDoubleTime()],
                });

                expect(stats.od).toBeCloseTo(5.19);
            });

            test("OD 10 with HT, 1.1x speed multiplier", () => {
                const stats = createStats({
                    od: 10,
                    mode: Modes.droid,
                    speedMultiplier: 1.1,
                    mods: [new ModHalfTime()],
                });

                expect(stats.od).toBeCloseTo(3.23);
            });

            test("OD 9 with NC, NC bug applied, 1.2x speed multiplier", () => {
                const stats = createStats({
                    od: 9,
                    mode: Modes.droid,
                    speedMultiplier: 1.2,
                    mods: [new ModNightCore()],
                    oldStatistics: true,
                });

                expect(stats.od).toBeCloseTo(7.84);
            });

            test("OD 9 with NC, NC bug not applied, 1.05x speed multiplier", () => {
                const stats = createStats({
                    od: 9,
                    mode: Modes.droid,
                    speedMultiplier: 1.05,
                    mods: [new ModNightCore()],
                });

                expect(stats.od).toBeCloseTo(7.51);
            });
        });
    });

    describe("Test osu!standard OD conversion", () => {
        test("OD 9 without mods, 1.25x speed multiplier", () => {
            const stats = createStats({
                od: 9,
                mode: Modes.osu,
                speedMultiplier: 1.25,
            });

            expect(stats.od).toBeCloseTo(9.866);
        });

        test("OD 9 with HR, 1.5x speed multiplier", () => {
            const stats = createStats({
                od: 9,
                mode: Modes.osu,
                speedMultiplier: 1.5,
                mods: [new ModHardRock()],
            });

            expect(stats.od).toBeCloseTo(11.11);
        });

        test("OD 8 with EZ, 1.3x speed multiplier", () => {
            const stats = createStats({
                od: 8,
                mode: Modes.osu,
                speedMultiplier: 1.3,
                mods: [new ModEasy()],
            });

            expect(stats.od).toBeCloseTo(6.15);
        });

        test("OD 8 with REZ, 1.75x speed multiplier", () => {
            const stats = createStats({
                od: 8,
                mode: Modes.osu,
                speedMultiplier: 1.75,
                mods: [new ModReallyEasy()],
            });

            expect(stats.od).toBeCloseTo(10.29);
        });

        test("OD 7 with HR + REZ, 2x speed multiplier", () => {
            const stats = createStats({
                od: 7,
                mode: Modes.osu,
                speedMultiplier: 2,
                mods: [new ModHardRock(), new ModReallyEasy()],
            });

            expect(stats.od).toBeCloseTo(11.567);
        });

        test("OD 10 with PR, 1.2x speed multiplier", () => {
            const stats = createStats({
                od: 10,
                mode: Modes.osu,
                speedMultiplier: 1.2,
                mods: [new ModPrecise()],
            });

            expect(stats.od).toBeCloseTo(10.56);
        });

        test("OD 9 with DT, 0.75x speed multiplier", () => {
            const stats = createStats({
                od: 9,
                mode: Modes.osu,
                speedMultiplier: 0.75,
                mods: [new ModDoubleTime()],
            });

            expect(stats.od).toBeCloseTo(9.48);
        });

        test("OD 10 with HT, 1.1x speed multiplier", () => {
            const stats = createStats({
                od: 10,
                mode: Modes.osu,
                speedMultiplier: 1.1,
                mods: [new ModHalfTime()],
            });

            expect(stats.od).toBeCloseTo(9.29);
        });

        test("OD 9 with NC, NC bug applied, 1.2x speed multiplier", () => {
            const stats = createStats({
                od: 9,
                mode: Modes.osu,
                speedMultiplier: 1.2,
                mods: [new ModNightCore()],
                oldStatistics: true,
            });

            expect(stats.od).toBeCloseTo(10.93);
        });

        test("OD 9 with NC, NC bug not applied, 1.05x speed multiplier", () => {
            const stats = createStats({
                od: 9,
                mode: Modes.osu,
                speedMultiplier: 1.05,
                mods: [new ModNightCore()],
            });

            expect(stats.od).toBeCloseTo(10.58);
        });
    });
});
