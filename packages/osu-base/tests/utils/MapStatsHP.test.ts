import {
    MapStats,
    Mod,
    ModEasy,
    Modes,
    ModHardRock,
    ModReallyEasy,
} from "../../src";

describe("Test HP conversion", () => {
    const createStats = (hp: number, mode: Modes, mods: Mod[] = []) => {
        return new MapStats({
            hp: hp,
            mods: mods,
        }).calculate({ mode: mode });
    };

    describe("Test osu!droid HP conversion", () => {
        test("HP 6 without mods", () => {
            const stats = createStats(6, Modes.droid);

            expect(stats.hp).toBeCloseTo(6);
        });

        test("HP 7 with HR", () => {
            const stats = createStats(7, Modes.droid, [new ModHardRock()]);

            expect(stats.hp).toBeCloseTo(9.8);
        });

        test("HP 10 with EZ", () => {
            const stats = createStats(10, Modes.droid, [new ModEasy()]);

            expect(stats.hp).toBeCloseTo(5);
        });

        test("HP 9 with REZ", () => {
            const stats = createStats(9, Modes.droid, [new ModReallyEasy()]);

            expect(stats.hp).toBeCloseTo(4.5);
        });

        test("HP 5 with HR + REZ", () => {
            const stats = createStats(5, Modes.droid, [
                new ModHardRock(),
                new ModReallyEasy(),
            ]);

            expect(stats.hp).toBeCloseTo(3.5);
        });
    });

    describe("Test osu!standard HP conversion", () => {
        test("HP 6 without mods", () => {
            const stats = createStats(6, Modes.osu);

            expect(stats.hp).toBeCloseTo(6);
        });

        test("HP 7 with HR", () => {
            const stats = createStats(7, Modes.osu, [new ModHardRock()]);

            expect(stats.hp).toBeCloseTo(9.8);
        });

        test("HP 10 with EZ", () => {
            const stats = createStats(10, Modes.osu, [new ModEasy()]);

            expect(stats.hp).toBeCloseTo(5);
        });

        test("HP 9 with REZ", () => {
            const stats = createStats(9, Modes.osu, [new ModReallyEasy()]);

            expect(stats.hp).toBeCloseTo(9);
        });

        test("HP 5 with HR + REZ", () => {
            const stats = createStats(5, Modes.osu, [
                new ModHardRock(),
                new ModReallyEasy(),
            ]);

            expect(stats.hp).toBeCloseTo(7);
        });
    });
});
