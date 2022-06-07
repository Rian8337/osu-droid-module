import { DroidHitWindow, OsuHitWindow } from "../../src";

describe("Test osu!droid OD to hit window conversion without PR mod", () => {
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

describe("Test osu!droid OD to hit window conversion with PR mod", () => {
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

describe("Test osu!droid hit window to OD conversion without PR mod", () => {
    test("OD 10", () => {
        expect(DroidHitWindow.hitWindow300ToOD(50)).toBeCloseTo(10);
        expect(DroidHitWindow.hitWindow100ToOD(100)).toBeCloseTo(10);
        expect(DroidHitWindow.hitWindow50ToOD(200)).toBeCloseTo(10);
    });

    test("OD 8.2", () => {
        expect(DroidHitWindow.hitWindow300ToOD(59)).toBeCloseTo(8.2);
        expect(DroidHitWindow.hitWindow100ToOD(118)).toBeCloseTo(8.2);
        expect(DroidHitWindow.hitWindow50ToOD(218)).toBeCloseTo(8.2);
    });

    test("OD 6.5", () => {
        expect(DroidHitWindow.hitWindow300ToOD(67.5)).toBeCloseTo(6.5);
        expect(DroidHitWindow.hitWindow100ToOD(135)).toBeCloseTo(6.5);
        expect(DroidHitWindow.hitWindow50ToOD(235)).toBeCloseTo(6.5);
    });

    test("OD 3.7", () => {
        expect(DroidHitWindow.hitWindow300ToOD(81.5)).toBeCloseTo(3.7);
        expect(DroidHitWindow.hitWindow100ToOD(163)).toBeCloseTo(3.7);
        expect(DroidHitWindow.hitWindow50ToOD(263)).toBeCloseTo(3.7);
    });

    test("OD -1.6", () => {
        expect(DroidHitWindow.hitWindow300ToOD(108)).toBeCloseTo(-1.6);
        expect(DroidHitWindow.hitWindow100ToOD(216)).toBeCloseTo(-1.6);
        expect(DroidHitWindow.hitWindow50ToOD(316)).toBeCloseTo(-1.6);
    });
});

describe("Test osu!droid hit window to OD conversion with PR mod", () => {
    test("OD 10", () => {
        expect(DroidHitWindow.hitWindow300ToOD(25, true)).toBeCloseTo(10);
        expect(DroidHitWindow.hitWindow100ToOD(80, true)).toBeCloseTo(10);
        expect(DroidHitWindow.hitWindow50ToOD(130, true)).toBeCloseTo(10);
    });

    test("OD 8.2", () => {
        expect(DroidHitWindow.hitWindow300ToOD(35.8, true)).toBeCloseTo(8.2);
        expect(DroidHitWindow.hitWindow100ToOD(94.4, true)).toBeCloseTo(8.2);
        expect(DroidHitWindow.hitWindow50ToOD(148, true)).toBeCloseTo(8.2);
    });

    test("OD 6.5", () => {
        expect(DroidHitWindow.hitWindow300ToOD(46, true)).toBeCloseTo(6.5);
        expect(DroidHitWindow.hitWindow100ToOD(108, true)).toBeCloseTo(6.5);
        expect(DroidHitWindow.hitWindow50ToOD(165, true)).toBeCloseTo(6.5);
    });

    test("OD 3.7", () => {
        expect(DroidHitWindow.hitWindow300ToOD(62.8, true)).toBeCloseTo(3.7);
        expect(DroidHitWindow.hitWindow100ToOD(130.4, true)).toBeCloseTo(3.7);
        expect(DroidHitWindow.hitWindow50ToOD(193, true)).toBeCloseTo(3.7);
    });

    test("OD -1.6", () => {
        expect(DroidHitWindow.hitWindow300ToOD(94.6, true)).toBeCloseTo(-1.6);
        expect(DroidHitWindow.hitWindow100ToOD(172.8, true)).toBeCloseTo(-1.6);
        expect(DroidHitWindow.hitWindow50ToOD(246, true)).toBeCloseTo(-1.6);
    });
});

describe("Test osu!standard OD to hit window conversion", () => {
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

describe("Test osu!standard hit window to OD conversion", () => {
    test("OD 10", () => {
        expect(OsuHitWindow.hitWindow300ToOD(20)).toBeCloseTo(10);
        expect(OsuHitWindow.hitWindow100ToOD(60)).toBeCloseTo(10);
        expect(OsuHitWindow.hitWindow50ToOD(100)).toBeCloseTo(10);
    });

    test("OD 8.2", () => {
        expect(OsuHitWindow.hitWindow300ToOD(30.8)).toBeCloseTo(8.2);
        expect(OsuHitWindow.hitWindow100ToOD(74.4)).toBeCloseTo(8.2);
        expect(OsuHitWindow.hitWindow50ToOD(118)).toBeCloseTo(8.2);
    });

    test("OD 6.5", () => {
        expect(OsuHitWindow.hitWindow300ToOD(41)).toBeCloseTo(6.5);
        expect(OsuHitWindow.hitWindow100ToOD(88)).toBeCloseTo(6.5);
        expect(OsuHitWindow.hitWindow50ToOD(135)).toBeCloseTo(6.5);
    });

    test("OD 3.7", () => {
        expect(OsuHitWindow.hitWindow300ToOD(57.8)).toBeCloseTo(3.7);
        expect(OsuHitWindow.hitWindow100ToOD(110.4)).toBeCloseTo(3.7);
        expect(OsuHitWindow.hitWindow50ToOD(163)).toBeCloseTo(3.7);
    });

    test("OD -1.6", () => {
        expect(OsuHitWindow.hitWindow300ToOD(89.6)).toBeCloseTo(-1.6);
        expect(OsuHitWindow.hitWindow100ToOD(152.8)).toBeCloseTo(-1.6);
        expect(OsuHitWindow.hitWindow50ToOD(216)).toBeCloseTo(-1.6);
    });
});
