import {
    MapStats,
    Mod,
    ModEasy,
    Modes,
    ModHardRock,
    ModReallyEasy,
    ModSmallCircle,
} from "../../src";

describe("Test CS conversion", () => {
    const createStats = (cs: number, mode: Modes, mods: Mod[] = []) => {
        return new MapStats({
            cs: cs,
            mods: mods,
        }).calculate({ mode: mode });
    };

    describe("Test osu!droid CS conversion", () => {
        test("CS 4 without mods", () => {
            const stats = createStats(4, Modes.droid);

            expect(stats.cs).toBeCloseTo(-0.98);
        });

        test("CS 4 with HR", () => {
            const stats = createStats(4, Modes.droid, [new ModHardRock()]);

            expect(stats.cs).toBeCloseTo(0.21);
        });

        test("CS 5 with EZ", () => {
            const stats = createStats(5, Modes.droid, [new ModEasy()]);

            expect(stats.cs).toBeCloseTo(-1.22);
        });

        test("CS 5 with REZ", () => {
            const stats = createStats(5, Modes.droid, [new ModReallyEasy()]);

            expect(stats.cs).toBeCloseTo(-1.22);
        });

        test("CS 3 with HR + REZ", () => {
            const stats = createStats(3, Modes.droid, [
                new ModHardRock(),
                new ModReallyEasy(),
            ]);

            expect(stats.cs).toBeCloseTo(-1.92);
        });

        test("CS 4 with SC", () => {
            const stats = createStats(4, Modes.droid, [new ModSmallCircle()]);

            expect(stats.cs).toBeCloseTo(2.79);
        });
    });

    describe("Test osu!standard CS conversion", () => {
        test("CS 4 without mods", () => {
            const stats = createStats(4, Modes.osu);

            expect(stats.cs).toBeCloseTo(4);
        });

        test("CS 4 with HR", () => {
            const stats = createStats(4, Modes.osu, [new ModHardRock()]);

            expect(stats.cs).toBeCloseTo(5.2);
        });

        test("CS 5 with EZ", () => {
            const stats = createStats(5, Modes.osu, [new ModEasy()]);

            expect(stats.cs).toBeCloseTo(2.5);
        });

        test("CS 5 with REZ", () => {
            const stats = createStats(5, Modes.osu, [new ModReallyEasy()]);

            expect(stats.cs).toBeCloseTo(5);
        });

        test("CS 3 with HR + REZ", () => {
            const stats = createStats(3, Modes.osu, [
                new ModHardRock(),
                new ModReallyEasy(),
            ]);

            expect(stats.cs).toBeCloseTo(3.9);
        });
    });
});
