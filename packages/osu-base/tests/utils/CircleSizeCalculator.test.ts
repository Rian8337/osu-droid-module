import {
    CircleSizeCalculator,
    Mod,
    ModEasy,
    ModHardRock,
    ModReallyEasy,
    ModSmallCircle,
} from "../../src";

describe("Test osu!droid circle size to osu!droid scale conversion", () => {
    const expectScale = (cs: number, scale: number, mods: Mod[] = []) => {
        expect(CircleSizeCalculator.droidCSToDroidScale(cs, mods)).toBeCloseTo(
            scale,
            7
        );
    };

    test("Without mods", () => {
        expectScale(0, 1.7818791522125481);
        expectScale(2, 1.583254152212548);
        expectScale(3.5, 1.4342854022125482);
        expectScale(4, 1.384629152212548);
        expectScale(5, 1.2853166522125479);
        expectScale(6, 1.186004152212548);
        expectScale(8, 0.987379152212548);
        expectScale(10, 0.788754152212548);
        expectScale(12, 0.590129152212548);
        expectScale(14, 0.391504152212548);
        expectScale(16, 0.19287915221254798);
        expectScale(17, 0.09356665221254784);
        expectScale(18, 0.001);
        expectScale(20, 0.001);
    });

    describe("With mods", () => {
        test("Hard Rock", () => {
            const hr = [new ModHardRock()];
            expectScale(0, 1.6568791522125481, hr);
            expectScale(2, 1.458254152212548, hr);
            expectScale(4, 1.259629152212548, hr);
            expectScale(7, 0.961691652212548, hr);
        });

        test("Easy", () => {
            const ez = [new ModEasy()];
            expectScale(0, 1.9068791522125481, ez);
            expectScale(2, 1.708254152212548, ez);
            expectScale(4, 1.509629152212548, ez);
            expectScale(7, 1.211691652212548, ez);
        });

        test("Really Easy", () => {
            const rez = [new ModReallyEasy()];
            expectScale(0, 1.9068791522125481, rez);
            expectScale(2, 1.708254152212548, rez);
            expectScale(4, 1.509629152212548, rez);
            expectScale(7, 1.211691652212548, rez);
        });

        test("Small Circle", () => {
            const sc = [new ModSmallCircle()];
            expectScale(0, 1.384629152212548, sc);
            expectScale(2, 1.186004152212548, sc);
            expectScale(4, 0.9873791522125479, sc);
            expectScale(7, 0.6894416522125479, sc);
        });
    });
});

test("Test osu!droid scale to osu!standard radius conversion", () => {
    const expectRadius = (scale: number, radius: number) => {
        expect(
            CircleSizeCalculator.droidScaleToStandardRadius(scale)
        ).toBeCloseTo(radius, 7);
    };

    // CS 0 osu!droid
    expectRadius(1.7818791522125481, 75.65252145594813);
    // CS 2 osu!droid
    expectRadius(1.583254152212548, 67.21958027947754);
    // CS 4 osu!droid
    expectRadius(1.384629152212548, 58.786639103006955);
    // CS 6 osu!droid
    expectRadius(1.186004152212548, 50.35369792653637);
    // CS 8 osu!droid
    expectRadius(0.987379152212548, 41.920756750065785);
    // CS 10 osu!droid
    expectRadius(0.788754152212548, 33.48781557359519);
    // CS 12 osu!droid
    expectRadius(0.590129152212548, 25.054874397124607);
    // CS 14 osu!droid
    expectRadius(0.391504152212548, 16.621933220654018);
    // CS 16 osu!droid
    expectRadius(0.19287915221254798, 8.188992044183431);
    // CS 17 osu!droid
    expectRadius(0.09356665221254784, 3.9725214559481308);
    // Beyond CS 17.62 osu!droid
    expectRadius(0.001, 0.042456594972790876);
});

test("Test osu!standard radius to osu!standard CS conversion", () => {
    const expectCS = (radius: number, cs: number) => {
        expect(
            CircleSizeCalculator.standardRadiusToStandardCS(radius)
        ).toBeCloseTo(cs, 7);
    };

    expectCS(100, -10.178571428571429);
    expectCS(90, -7.946428571428573);
    expectCS(80, -5.714285714285715);
    expectCS(70, -3.4821428571428577);
    expectCS(60, -1.25);
    expectCS(50, 0.9821428571428568);
    expectCS(40, 3.2142857142857144);
    expectCS(30, 5.446428571428571);
    expectCS(20, 7.678571428571429);
    expectCS(10, 9.910714285714285);
    expectCS(5, 11.026785714285715);
});

test("Test osu!standard CS to osu!standard scale conversion", () => {
    const expectScale = (cs: number, scale: number) => {
        expect(CircleSizeCalculator.standardCSToStandardScale(cs)).toBeCloseTo(
            scale,
            7
        );
    };

    expectScale(0, 0.85);
    expectScale(2, 0.71);
    expectScale(4, 0.57);
    expectScale(6, 0.43);
    expectScale(8, 0.29);
    expectScale(10, 0.15);
});
