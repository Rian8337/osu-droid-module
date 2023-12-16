import {
    MapStats,
    Mod,
    ModDoubleTime,
    ModEasy,
    Modes,
    ModHalfTime,
    ModHardRock,
    ModNightCore,
    ModReallyEasy,
} from "../../src";

describe("Test AR conversion without speed multiplier", () => {
    const createStats = (params: {
        ar: number;
        mode: Modes;
        mods?: Mod[];
        forceAR?: boolean;
        oldStatistics?: boolean;
    }) => {
        return new MapStats(params).calculate({ mode: params.mode });
    };

    describe("Test osu!droid AR conversion", () => {
        test("AR 9 without mods", () => {
            const stats = createStats({
                ar: 9,
                mode: Modes.droid,
            });

            expect(stats.ar).toBeCloseTo(9);
        });

        test("AR 9 with HR", () => {
            const stats = createStats({
                ar: 9,
                mode: Modes.droid,
                mods: [new ModHardRock()],
            });

            expect(stats.ar).toBeCloseTo(10);
        });

        test("AR 8 with EZ", () => {
            const stats = createStats({
                ar: 8,
                mode: Modes.droid,
                mods: [new ModEasy()],
            });

            expect(stats.ar).toBeCloseTo(4);
        });

        test("AR 8 with REZ", () => {
            const stats = createStats({
                ar: 8,
                mode: Modes.droid,
                mods: [new ModReallyEasy()],
            });

            expect(stats.ar).toBeCloseTo(7.5);
        });

        test("AR 8 with EZ + REZ", () => {
            const stats = createStats({
                ar: 8,
                mode: Modes.droid,
                mods: [new ModEasy(), new ModReallyEasy()],
            });

            expect(stats.ar).toBe(7);
        });

        test("AR 7 with HR + REZ", () => {
            const stats = createStats({
                ar: 7,
                mode: Modes.droid,
                mods: [new ModHardRock(), new ModReallyEasy()],
            });

            expect(stats.ar).toBeCloseTo(9.3);
        });

        test("AR 9 with DT", () => {
            const stats = createStats({
                ar: 9,
                mode: Modes.droid,
                mods: [new ModDoubleTime()],
            });

            expect(stats.ar).toBeCloseTo(10.33);
        });

        test("AR 10 with HT", () => {
            const stats = createStats({
                ar: 10,
                mode: Modes.droid,
                mods: [new ModHalfTime()],
            });

            expect(stats.ar).toBeCloseTo(9);
        });

        test("AR 9 with NC, NC bug applied", () => {
            const stats = createStats({
                ar: 9,
                mode: Modes.droid,
                mods: [new ModNightCore()],
                oldStatistics: true,
            });

            expect(stats.ar).toBeCloseTo(10.12);
        });

        test("AR 9 with NC, NC bug not applied", () => {
            const stats = createStats({
                ar: 9,
                mode: Modes.droid,
                mods: [new ModNightCore()],
            });

            expect(stats.ar).toBeCloseTo(10.33);
        });

        test("AR 8 with force AR", () => {
            const stats = createStats({
                ar: 8,
                mode: Modes.droid,
                mods: [new ModHardRock()],
                forceAR: true,
            });

            expect(stats.ar).toBeCloseTo(8);
        });
    });

    describe("Test osu!standard AR conversion", () => {
        test("AR 9 without mods", () => {
            const stats = createStats({
                ar: 9,
                mode: Modes.osu,
            });

            expect(stats.ar).toBeCloseTo(9);
        });

        test("AR 9 with HR", () => {
            const stats = createStats({
                ar: 9,
                mode: Modes.osu,
                mods: [new ModHardRock()],
            });

            expect(stats.ar).toBeCloseTo(10);
        });

        test("AR 8 with EZ", () => {
            const stats = createStats({
                ar: 8,
                mode: Modes.osu,
                mods: [new ModEasy()],
            });

            expect(stats.ar).toBeCloseTo(4);
        });

        test("AR 8 with REZ", () => {
            const stats = createStats({
                ar: 8,
                mode: Modes.osu,
                mods: [new ModReallyEasy()],
            });

            expect(stats.ar).toBeCloseTo(8);
        });

        test("AR 7 with HR + REZ", () => {
            const stats = createStats({
                ar: 7,
                mode: Modes.osu,
                mods: [new ModHardRock(), new ModReallyEasy()],
            });

            expect(stats.ar).toBeCloseTo(9.8);
        });

        test("AR 9 with DT", () => {
            const stats = createStats({
                ar: 9,
                mode: Modes.osu,
                mods: [new ModDoubleTime()],
            });

            expect(stats.ar).toBeCloseTo(10.33);
        });

        test("AR 10 with HT", () => {
            const stats = createStats({
                ar: 10,
                mode: Modes.osu,
                mods: [new ModHalfTime()],
            });

            expect(stats.ar).toBeCloseTo(9);
        });

        test("AR 9 with NC, NC bug applied", () => {
            const stats = createStats({
                ar: 9,
                mode: Modes.osu,
                mods: [new ModNightCore()],
                oldStatistics: true,
            });

            expect(stats.ar).toBeCloseTo(10.33);
        });

        test("AR 9 with NC, NC bug not applied", () => {
            const stats = createStats({
                ar: 9,
                mode: Modes.osu,
                mods: [new ModNightCore()],
            });

            expect(stats.ar).toBeCloseTo(10.33);
        });

        test("AR 8 with force AR", () => {
            const stats = createStats({
                ar: 8,
                mode: Modes.osu,
                mods: [new ModHardRock()],
                forceAR: true,
            });

            expect(stats.ar).toBeCloseTo(8);
        });
    });
});

describe("Test AR conversion with speed multiplier", () => {
    const createStats = (params: {
        ar: number;
        mode: Modes;
        speedMultiplier: number;
        mods?: Mod[];
        forceAR?: boolean;
        oldStatistics?: boolean;
    }) => {
        return new MapStats(params).calculate({ mode: params.mode });
    };

    describe("Test osu!droid AR conversion", () => {
        test("AR 9 without mods, 1.25x speed multiplier", () => {
            const stats = createStats({
                ar: 9,
                mode: Modes.droid,
                speedMultiplier: 1.25,
            });

            expect(stats.ar).toBeCloseTo(9.8);
        });

        test("AR 9 with HR, 1.5x speed multiplier", () => {
            const stats = createStats({
                ar: 9,
                mode: Modes.droid,
                speedMultiplier: 1.5,
                mods: [new ModHardRock()],
            });

            expect(stats.ar).toBeCloseTo(11);
        });

        test("AR 8 with EZ, 1.3x speed multiplier", () => {
            const stats = createStats({
                ar: 8,
                mode: Modes.droid,
                speedMultiplier: 1.3,
                mods: [new ModEasy()],
            });

            expect(stats.ar).toBeCloseTo(6.23);
        });

        test("AR 8 with REZ, 1.75x speed multiplier", () => {
            const stats = createStats({
                ar: 8,
                mode: Modes.droid,
                speedMultiplier: 1.75,
                mods: [new ModReallyEasy()],
            });

            expect(stats.ar).toBeCloseTo(9.43);
        });

        test("AR 7 with HR + REZ, 2x speed multiplier", () => {
            const stats = createStats({
                ar: 7,
                mode: Modes.droid,
                speedMultiplier: 2,
                mods: [new ModHardRock(), new ModReallyEasy()],
            });

            expect(stats.ar).toBeCloseTo(10.65);
        });

        test("AR 9 with DT, 0.75x speed multiplier", () => {
            const stats = createStats({
                ar: 9,
                mode: Modes.droid,
                speedMultiplier: 0.75,
                mods: [new ModDoubleTime()],
            });

            expect(stats.ar).toBeCloseTo(9.44);
        });

        test("AR 10 with HT, 1.1x speed multiplier", () => {
            const stats = createStats({
                ar: 10,
                mode: Modes.droid,
                speedMultiplier: 1.1,
                mods: [new ModHalfTime()],
            });

            expect(stats.ar).toBeCloseTo(9.36);
        });

        test("AR 9 with NC, NC bug applied, 1.2x speed multiplier", () => {
            const stats = createStats({
                ar: 9,
                mode: Modes.droid,
                speedMultiplier: 1.2,
                mods: [new ModNightCore()],
                oldStatistics: true,
            });

            expect(stats.ar).toBeCloseTo(10.6);
        });

        test("AR 9 with NC, NC bug not applied, 1.05x speed multiplier", () => {
            const stats = createStats({
                ar: 9,
                mode: Modes.droid,
                speedMultiplier: 1.05,
                mods: [new ModNightCore()],
            });

            expect(stats.ar).toBeCloseTo(10.46);
        });

        test("AR 8 with force AR, 1.65x speed multiplier", () => {
            const stats = createStats({
                ar: 8,
                mode: Modes.droid,
                speedMultiplier: 1.65,
                mods: [new ModHardRock()],
                forceAR: true,
            });

            expect(stats.ar).toBeCloseTo(8);
        });
    });

    describe("Test osu!standard AR conversion", () => {
        test("AR 9 without mods, 1.25x speed multiplier", () => {
            const stats = createStats({
                ar: 9,
                mode: Modes.osu,
                speedMultiplier: 1.25,
            });

            expect(stats.ar).toBeCloseTo(9.8);
        });

        test("AR 9 with HR, 1.5x speed multiplier", () => {
            const stats = createStats({
                ar: 9,
                mode: Modes.osu,
                speedMultiplier: 1.5,
                mods: [new ModHardRock()],
            });

            expect(stats.ar).toBeCloseTo(11);
        });

        test("AR 8 with EZ, 1.3x speed multiplier", () => {
            const stats = createStats({
                ar: 8,
                mode: Modes.osu,
                speedMultiplier: 1.3,
                mods: [new ModEasy()],
            });

            expect(stats.ar).toBeCloseTo(6.23);
        });

        test("AR 8 with REZ, 1.75x speed multiplier", () => {
            const stats = createStats({
                ar: 8,
                mode: Modes.osu,
                speedMultiplier: 1.75,
                mods: [new ModReallyEasy()],
            });

            expect(stats.ar).toBeCloseTo(10.14);
        });

        test("AR 7 with HR + REZ, 2x speed multiplier", () => {
            const stats = createStats({
                ar: 7,
                mode: Modes.osu,
                speedMultiplier: 2,
                mods: [new ModHardRock(), new ModReallyEasy()],
            });

            expect(stats.ar).toBeCloseTo(11.4);
        });

        test("AR 9 with DT, 0.75x speed multiplier", () => {
            const stats = createStats({
                ar: 9,
                mode: Modes.osu,
                speedMultiplier: 0.75,
                mods: [new ModDoubleTime()],
            });

            expect(stats.ar).toBeCloseTo(9.44);
        });

        test("AR 10 with HT, 1.1x speed multiplier", () => {
            const stats = createStats({
                ar: 10,
                mode: Modes.osu,
                speedMultiplier: 1.1,
                mods: [new ModHalfTime()],
            });

            expect(stats.ar).toBeCloseTo(9.36);
        });

        test("AR 9 with NC, NC bug applied, 1.2x speed multiplier", () => {
            const stats = createStats({
                ar: 9,
                mode: Modes.osu,
                speedMultiplier: 1.2,
                mods: [new ModNightCore()],
                oldStatistics: true,
            });

            expect(stats.ar).toBeCloseTo(10.78);
        });

        test("AR 9 with NC, NC bug not applied, 1.05x speed multiplier", () => {
            const stats = createStats({
                ar: 9,
                mode: Modes.osu,
                speedMultiplier: 1.05,
                mods: [new ModNightCore()],
            });

            expect(stats.ar).toBeCloseTo(10.46);
        });

        test("AR 8 with force AR, 1.65x speed multiplier", () => {
            const stats = createStats({
                ar: 8,
                mode: Modes.osu,
                speedMultiplier: 1.65,
                mods: [new ModHardRock()],
                forceAR: true,
            });

            expect(stats.ar).toBeCloseTo(8);
        });
    });
});
