import { DroidHitWindow, OsuHitWindow } from "../../src";

describe("Test osu!droid hit window without PR mod", () => {
    test("OD 10", () => {
        const hitWindow = new DroidHitWindow(10);

        expect(hitWindow.hitWindowFor300()).toBeCloseTo(50);
        expect(hitWindow.hitWindowFor100()).toBeCloseTo(100);
        expect(hitWindow.hitWindowFor50()).toBeCloseTo(200);
    });

    test("OD 8.2", () => {
        const hitWindow = new DroidHitWindow(8.2);

        expect(hitWindow.hitWindowFor300()).toBeCloseTo(59);
        expect(hitWindow.hitWindowFor100()).toBeCloseTo(118);
        expect(hitWindow.hitWindowFor50()).toBeCloseTo(218);
    });

    test("OD 6.5", () => {
        const hitWindow = new DroidHitWindow(6.5);

        expect(hitWindow.hitWindowFor300()).toBeCloseTo(67.5);
        expect(hitWindow.hitWindowFor100()).toBeCloseTo(135);
        expect(hitWindow.hitWindowFor50()).toBeCloseTo(235);
    });

    test("OD 3.7", () => {
        const hitWindow = new DroidHitWindow(3.7);

        expect(hitWindow.hitWindowFor300()).toBeCloseTo(81.5);
        expect(hitWindow.hitWindowFor100()).toBeCloseTo(163);
        expect(hitWindow.hitWindowFor50()).toBeCloseTo(263);
    });

    test("OD -1.6", () => {
        const hitWindow = new DroidHitWindow(-1.6);

        expect(hitWindow.hitWindowFor300()).toBeCloseTo(108);
        expect(hitWindow.hitWindowFor100()).toBeCloseTo(216);
        expect(hitWindow.hitWindowFor50()).toBeCloseTo(316);
    });
});

describe("Test osu!droid hit window with PR mod", () => {
    test("OD 10", () => {
        const hitWindow = new DroidHitWindow(10);

        expect(hitWindow.hitWindowFor300(true)).toBeCloseTo(25);
        expect(hitWindow.hitWindowFor100(true)).toBeCloseTo(80);
        expect(hitWindow.hitWindowFor50(true)).toBeCloseTo(130);
    });

    test("OD 8.2", () => {
        const hitWindow = new DroidHitWindow(8.2);

        expect(hitWindow.hitWindowFor300(true)).toBeCloseTo(35.8);
        expect(hitWindow.hitWindowFor100(true)).toBeCloseTo(94.4);
        expect(hitWindow.hitWindowFor50(true)).toBeCloseTo(148);
    });

    test("OD 6.5", () => {
        const hitWindow = new DroidHitWindow(6.5);

        expect(hitWindow.hitWindowFor300(true)).toBeCloseTo(46);
        expect(hitWindow.hitWindowFor100(true)).toBeCloseTo(108);
        expect(hitWindow.hitWindowFor50(true)).toBeCloseTo(165);
    });

    test("OD 3.7", () => {
        const hitWindow = new DroidHitWindow(3.7);

        expect(hitWindow.hitWindowFor300(true)).toBeCloseTo(62.8);
        expect(hitWindow.hitWindowFor100(true)).toBeCloseTo(130.4);
        expect(hitWindow.hitWindowFor50(true)).toBeCloseTo(193);
    });

    test("OD -1.6", () => {
        const hitWindow = new DroidHitWindow(-1.6);

        expect(hitWindow.hitWindowFor300(true)).toBeCloseTo(94.6);
        expect(hitWindow.hitWindowFor100(true)).toBeCloseTo(172.8);
        expect(hitWindow.hitWindowFor50(true)).toBeCloseTo(246);
    });
});

describe("Test osu!standard hit window", () => {
    test("OD 10", () => {
        const hitWindow = new OsuHitWindow(10);

        expect(hitWindow.hitWindowFor300()).toBeCloseTo(20);
        expect(hitWindow.hitWindowFor100()).toBeCloseTo(60);
        expect(hitWindow.hitWindowFor50()).toBeCloseTo(100);
    });

    test("OD 8.2", () => {
        const hitWindow = new OsuHitWindow(8.2);

        expect(hitWindow.hitWindowFor300()).toBeCloseTo(30.8);
        expect(hitWindow.hitWindowFor100()).toBeCloseTo(74.4);
        expect(hitWindow.hitWindowFor50()).toBeCloseTo(118);
    });

    test("OD 6.5", () => {
        const hitWindow = new OsuHitWindow(6.5);

        expect(hitWindow.hitWindowFor300()).toBeCloseTo(41);
        expect(hitWindow.hitWindowFor100()).toBeCloseTo(88);
        expect(hitWindow.hitWindowFor50()).toBeCloseTo(135);
    });

    test("OD 3.7", () => {
        const hitWindow = new OsuHitWindow(3.7);

        expect(hitWindow.hitWindowFor300()).toBeCloseTo(57.8);
        expect(hitWindow.hitWindowFor100()).toBeCloseTo(110.4);
        expect(hitWindow.hitWindowFor50()).toBeCloseTo(163);
    });

    test("OD -1.6", () => {
        const hitWindow = new OsuHitWindow(-1.6);

        expect(hitWindow.hitWindowFor300()).toBeCloseTo(89.6);
        expect(hitWindow.hitWindowFor100()).toBeCloseTo(152.8);
        expect(hitWindow.hitWindowFor50()).toBeCloseTo(216);
    });
});
