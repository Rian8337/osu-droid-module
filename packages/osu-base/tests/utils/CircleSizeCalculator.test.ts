import {
    CircleSizeCalculator,
    ModEasy,
    ModHardRock,
    ModMap,
    ModReallyEasy,
    ModSmallCircle,
} from "../../src";

test("Test osu!droid circle size to osu!droid scale conversion", () => {
    const expectScale = (cs: number, scale: number) => {
        expect(CircleSizeCalculator.droidCSToDroidScale(cs)).toBeCloseTo(
            scale,
            7,
        );
    };

    expectScale(0, 1.3304396674103878);
    expectScale(2, 1.1903822674103879);
    expectScale(3.5, 1.0853392174103877);
    expectScale(4, 1.050324867410388);
    expectScale(5, 0.9802961674103878);
    expectScale(6, 0.9102674674103878);
    expectScale(8, 0.7702100674103879);
    expectScale(10, 0.6301526674103879);
    expectScale(12, 0.49009526741038784);
    expectScale(14, 0.35003786741038784);
    expectScale(16, 0.20998046741038776);
    expectScale(17, 0.1399517674103878);
    expectScale(18, 0.0699230674103878);
    expectScale(19, 0.001);
    expectScale(20, 0.001);
});

test("Test osu!droid scale to osu!droid circle size conversion", () => {
    const expectCS = (scale: number, cs: number) => {
        expect(CircleSizeCalculator.droidScaleToDroidCS(scale)).toBeCloseTo(
            cs,
            7,
        );
    };

    expectCS(1.3304396674103878, 0);
    expectCS(1.1903822674103879, 2);
    expectCS(1.0853392174103877, 3.5);
    expectCS(1.050324867410388, 4);
    expectCS(0.9802961674103878, 5);
    expectCS(0.9102674674103878, 6);
    expectCS(0.7702100674103879, 8);
    expectCS(0.6301526674103879, 10);
    expectCS(0.49009526741038784, 12);
    expectCS(0.35003786741038784, 14);
    expectCS(0.20998046741038776, 16);
    expectCS(0.1399517674103878, 17);
    expectCS(0.0699230674103878, 18);
    expectCS(0.001, 18.98421172191384);
});

describe("Test osu!droid circle size to old osu!droid scale conversion", () => {
    const expectScale = (cs: number, scale: number, mods = new ModMap()) => {
        expect(
            CircleSizeCalculator.droidCSToOldDroidScale(cs, mods),
        ).toBeCloseTo(scale, 7);
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
            const mods = new ModMap();
            mods.set(new ModHardRock());

            expectScale(0, 1.6568791522125481, mods);
            expectScale(2, 1.458254152212548, mods);
            expectScale(4, 1.259629152212548, mods);
            expectScale(7, 0.961691652212548, mods);
        });

        test("Easy", () => {
            const mods = new ModMap();
            mods.set(new ModEasy());

            expectScale(0, 1.9068791522125481, mods);
            expectScale(2, 1.708254152212548, mods);
            expectScale(4, 1.509629152212548, mods);
            expectScale(7, 1.211691652212548, mods);
        });

        test("Really Easy", () => {
            const mods = new ModMap();
            mods.set(new ModReallyEasy());

            expectScale(0, 1.9068791522125481, mods);
            expectScale(2, 1.708254152212548, mods);
            expectScale(4, 1.509629152212548, mods);
            expectScale(7, 1.211691652212548, mods);
        });

        test("Small Circle", () => {
            const mods = new ModMap();
            mods.set(new ModSmallCircle());

            expectScale(0, 1.384629152212548, mods);
            expectScale(2, 1.186004152212548, mods);
            expectScale(4, 0.9873791522125479, mods);
            expectScale(7, 0.6894416522125479, mods);
        });
    });
});

test("Test old osu!droid scale screen pixels to osu! pixels conversion", () => {
    const expectScale = (screenPixelsScale: number, osuPixelsScale: number) => {
        expect(
            CircleSizeCalculator.oldDroidScaleScreenPixelsToOsuPixels(
                screenPixelsScale,
            ),
        ).toBeCloseTo(osuPixelsScale, 7);
    };

    expectScale(1.7818792043749998, 1.2559501);
    expectScale(1.5832540625, 1.11595);
    expectScale(1.434285454375, 1.0109501);
    expectScale(1.3846293462500001, 0.9759502);
    expectScale(1.285316704375, 0.9059501);
    expectScale(1.186004204375, 0.8359501);
    expectScale(0.9873792043749999, 0.6959501);
    expectScale(0.788754204375, 0.5559501);
    expectScale(0.59012923275, 0.41595012);
    expectScale(0.39150420437499994, 0.2759501);
    expectScale(0.192879204375, 0.1359501);
    expectScale(0.09356670437499999, 0.0659501);
    expectScale(0.001, 7.048458e-4);
});

test("Test old osu!droid scale osu! pixels to screen pixels conversion", () => {
    const expectScale = (osuPixelsScale: number, screenPixelsScale: number) => {
        expect(
            CircleSizeCalculator.oldDroidScaleOsuPixelsToScreenPixels(
                osuPixelsScale,
            ),
        ).toBeCloseTo(screenPixelsScale, 7);
    };

    expectScale(1.2559501, 1.7818792043749998);
    expectScale(1.11595, 1.5832540625);
    expectScale(1.0109501, 1.434285454375);
    expectScale(0.9759502, 1.3846293462500001);
    expectScale(0.9059501, 1.285316704375);
    expectScale(0.8359501, 1.186004204375);
    expectScale(0.6959501, 0.9873792043749999);
    expectScale(0.5559501, 0.788754204375);
    expectScale(0.41595012, 0.59012923275);
    expectScale(0.2759501, 0.39150420437499994);
    expectScale(0.1359501, 0.192879204375);
    expectScale(0.0659501, 0.09356670437499999);
    expectScale(7.048458e-4, 0.001);
});

test("Test old osu!droid scale to osu!standard radius conversion", () => {
    const expectRadius = (scale: number, radius: number) => {
        expect(
            CircleSizeCalculator.oldDroidScaleToStandardRadius(scale),
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

test("Test osu!standard radius to old osu!droid scale conversion", () => {
    const expectScale = (radius: number, scale: number) => {
        expect(
            CircleSizeCalculator.standardRadiusToOldDroidScale(radius),
        ).toBeCloseTo(scale, 7);
    };

    expectScale(75.65252145594813, 1.7818791522125481);
    expectScale(67.21958027947754, 1.583254152212548);
    expectScale(58.786639103006955, 1.384629152212548);
    expectScale(50.35369792653637, 1.186004152212548);
    expectScale(41.920756750065785, 0.987379152212548);
    expectScale(33.48781557359519, 0.788754152212548);
    expectScale(25.054874397124607, 0.590129152212548);
    expectScale(16.621933220654018, 0.391504152212548);
    expectScale(8.188992044183431, 0.19287915221254798);
    expectScale(3.9725214559481308, 0.09356665221254784);
    expectScale(0.042456594972790876, 0.001);
});

test("Test osu!standard radius to osu!standard CS conversion", () => {
    const expectCS = (radius: number, cs: number) => {
        expect(
            CircleSizeCalculator.standardRadiusToStandardCS(radius),
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

describe("Test osu!standard CS to osu!standard scale conversion", () => {
    const expectScale = (cs: number, scale: number, applyFudge: boolean) => {
        expect(
            CircleSizeCalculator.standardCSToStandardScale(cs, applyFudge),
        ).toBeCloseTo(scale, 7);
    };

    test("Without fudge", () => {
        expectScale(0, 0.85, false);
        expectScale(2, 0.71, false);
        expectScale(4, 0.57, false);
        expectScale(6, 0.43, false);
        expectScale(8, 0.29, false);
        expectScale(10, 0.15, false);
    });

    test("With fudge", () => {
        expectScale(0, 0.8503485, true);
        expectScale(2, 0.7102911, true);
        expectScale(4, 0.5702337, true);
        expectScale(6, 0.4301763, true);
        expectScale(8, 0.2901189, true);
        expectScale(10, 0.1500615, true);
    });
});

describe("Test osu!standard scale to osu!standard CS conversion", () => {
    const expectCS = (scale: number, cs: number, applyFudge: boolean) => {
        expect(
            CircleSizeCalculator.standardScaleToStandardCS(scale, applyFudge),
        ).toBeCloseTo(cs, 7);
    };

    test("Without fudge", () => {
        expectCS(0.85, 0, false);
        expectCS(0.71, 2, false);
        expectCS(0.57, 4, false);
        expectCS(0.43, 6, false);
        expectCS(0.29, 8, false);
        expectCS(0.15, 10, false);
    });

    test("With fudge", () => {
        expectCS(0.8503485, 0, true);
        expectCS(0.7102911, 2, true);
        expectCS(0.5702337, 4, true);
        expectCS(0.4301763, 6, true);
        expectCS(0.2901189, 8, true);
        expectCS(0.1500615, 10, true);
    });
});

describe("Test osu!standard scale to old osu!droid scale conversion", () => {
    const expectScale = (
        standardScale: number,
        droidScale: number,
        applyFudge: boolean,
    ) => {
        expect(
            CircleSizeCalculator.standardScaleToOldDroidScale(
                standardScale,
                applyFudge,
            ),
        ).toBeCloseTo(droidScale, 7);
    };

    test("Without fudge", () => {
        // CS 0 osu!standard
        expectScale(0.85, 1.2813085937500002, false);
        // CS 2 osu!standard
        expectScale(0.71, 1.0702695312500001, false);
        // CS 4 osu!standard
        expectScale(0.57, 0.85923046875, false);
        // CS 6 osu!standard
        expectScale(0.43, 0.64819140625, false);
        // CS 8 osu!standard
        expectScale(0.29, 0.43715234375, false);
        // CS 10 osu!standard
        expectScale(0.15, 0.22611328125000002, false);
    });

    test("With fudge", () => {
        // CS 0 osu!standard
        expectScale(0.8503485, 1.2813085937500002, true);
        // CS 2 osu!standard
        expectScale(0.7102911, 1.0702695312500001, true);
        // CS 4 osu!standard
        expectScale(0.5702337, 0.85923046875, true);
        // CS 6 osu!standard
        expectScale(0.4301763, 0.64819140625, true);
        // CS 8 osu!standard
        expectScale(0.2901189, 0.43715234375, true);
        // CS 10 osu!standard
        expectScale(0.1500615, 0.22611328125000002, true);
    });
});
