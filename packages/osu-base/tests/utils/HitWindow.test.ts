import {
    DroidHitWindow,
    EmptyHitWindow,
    OsuHitWindow,
    PreciseDroidHitWindow,
} from "../../src";

describe("Test osu!droid OD to hit window conversion without PR mod", () => {
    test("OD 10", () => {
        const hitWindow = new DroidHitWindow(10);

        expect(hitWindow.greatWindow).toBeCloseTo(50);
        expect(hitWindow.okWindow).toBeCloseTo(100);
        expect(hitWindow.mehWindow).toBeCloseTo(200);
    });

    test("OD 8.2", () => {
        const hitWindow = new DroidHitWindow(8.2);

        expect(hitWindow.greatWindow).toBeCloseTo(59);
        expect(hitWindow.okWindow).toBeCloseTo(118);
        expect(hitWindow.mehWindow).toBeCloseTo(218);
    });

    test("OD 6.5", () => {
        const hitWindow = new DroidHitWindow(6.5);

        expect(hitWindow.greatWindow).toBeCloseTo(67.5);
        expect(hitWindow.okWindow).toBeCloseTo(135);
        expect(hitWindow.mehWindow).toBeCloseTo(235);
    });

    test("OD 3.7", () => {
        const hitWindow = new DroidHitWindow(3.7);

        expect(hitWindow.greatWindow).toBeCloseTo(81.5);
        expect(hitWindow.okWindow).toBeCloseTo(163);
        expect(hitWindow.mehWindow).toBeCloseTo(263);
    });

    test("OD -1.6", () => {
        const hitWindow = new DroidHitWindow(-1.6);

        expect(hitWindow.greatWindow).toBeCloseTo(108);
        expect(hitWindow.okWindow).toBeCloseTo(216);
        expect(hitWindow.mehWindow).toBeCloseTo(316);
    });
});

describe("Test osu!droid OD to hit window conversion with PR mod", () => {
    test("OD 10", () => {
        const hitWindow = new PreciseDroidHitWindow(10);

        expect(hitWindow.greatWindow).toBeCloseTo(25);
        expect(hitWindow.okWindow).toBeCloseTo(80);
        expect(hitWindow.mehWindow).toBeCloseTo(130);
    });

    test("OD 8.2", () => {
        const hitWindow = new PreciseDroidHitWindow(8.2);

        expect(hitWindow.greatWindow).toBeCloseTo(35.8);
        expect(hitWindow.okWindow).toBeCloseTo(94.4);
        expect(hitWindow.mehWindow).toBeCloseTo(148);
    });

    test("OD 6.5", () => {
        const hitWindow = new PreciseDroidHitWindow(6.5);

        expect(hitWindow.greatWindow).toBeCloseTo(46);
        expect(hitWindow.okWindow).toBeCloseTo(108);
        expect(hitWindow.mehWindow).toBeCloseTo(165);
    });

    test("OD 3.7", () => {
        const hitWindow = new PreciseDroidHitWindow(3.7);

        expect(hitWindow.greatWindow).toBeCloseTo(62.8);
        expect(hitWindow.okWindow).toBeCloseTo(130.4);
        expect(hitWindow.mehWindow).toBeCloseTo(193);
    });

    test("OD -1.6", () => {
        const hitWindow = new PreciseDroidHitWindow(-1.6);

        expect(hitWindow.greatWindow).toBeCloseTo(94.6);
        expect(hitWindow.okWindow).toBeCloseTo(172.8);
        expect(hitWindow.mehWindow).toBeCloseTo(246);
    });
});

describe("Test osu!droid hit window to OD conversion without PR mod", () => {
    test("OD 10", () => {
        expect(DroidHitWindow.greatWindowToOD(50)).toBeCloseTo(10);
        expect(DroidHitWindow.okWindowToOD(100)).toBeCloseTo(10);
        expect(DroidHitWindow.mehWindowToOD(200)).toBeCloseTo(10);
    });

    test("OD 8.2", () => {
        expect(DroidHitWindow.greatWindowToOD(59)).toBeCloseTo(8.2);
        expect(DroidHitWindow.okWindowToOD(118)).toBeCloseTo(8.2);
        expect(DroidHitWindow.mehWindowToOD(218)).toBeCloseTo(8.2);
    });

    test("OD 6.5", () => {
        expect(DroidHitWindow.greatWindowToOD(67.5)).toBeCloseTo(6.5);
        expect(DroidHitWindow.okWindowToOD(135)).toBeCloseTo(6.5);
        expect(DroidHitWindow.mehWindowToOD(235)).toBeCloseTo(6.5);
    });

    test("OD 3.7", () => {
        expect(DroidHitWindow.greatWindowToOD(81.5)).toBeCloseTo(3.7);
        expect(DroidHitWindow.okWindowToOD(163)).toBeCloseTo(3.7);
        expect(DroidHitWindow.mehWindowToOD(263)).toBeCloseTo(3.7);
    });

    test("OD -1.6", () => {
        expect(DroidHitWindow.greatWindowToOD(108)).toBeCloseTo(-1.6);
        expect(DroidHitWindow.okWindowToOD(216)).toBeCloseTo(-1.6);
        expect(DroidHitWindow.mehWindowToOD(316)).toBeCloseTo(-1.6);
    });
});

describe("Test osu!droid hit window to OD conversion with PR mod", () => {
    test("OD 10", () => {
        expect(PreciseDroidHitWindow.greatWindowToOD(25)).toBeCloseTo(10);
        expect(PreciseDroidHitWindow.okWindowToOD(80)).toBeCloseTo(10);
        expect(PreciseDroidHitWindow.mehWindowToOD(130)).toBeCloseTo(10);
    });

    test("OD 8.2", () => {
        expect(PreciseDroidHitWindow.greatWindowToOD(35.8)).toBeCloseTo(8.2);
        expect(PreciseDroidHitWindow.okWindowToOD(94.4)).toBeCloseTo(8.2);
        expect(PreciseDroidHitWindow.mehWindowToOD(148)).toBeCloseTo(8.2);
    });

    test("OD 6.5", () => {
        expect(PreciseDroidHitWindow.greatWindowToOD(46)).toBeCloseTo(6.5);
        expect(PreciseDroidHitWindow.okWindowToOD(108)).toBeCloseTo(6.5);
        expect(PreciseDroidHitWindow.mehWindowToOD(165)).toBeCloseTo(6.5);
    });

    test("OD 3.7", () => {
        expect(PreciseDroidHitWindow.greatWindowToOD(62.8)).toBeCloseTo(3.7);
        expect(PreciseDroidHitWindow.okWindowToOD(130.4)).toBeCloseTo(3.7);
        expect(PreciseDroidHitWindow.mehWindowToOD(193)).toBeCloseTo(3.7);
    });

    test("OD -1.6", () => {
        expect(PreciseDroidHitWindow.greatWindowToOD(94.6)).toBeCloseTo(-1.6);
        expect(PreciseDroidHitWindow.okWindowToOD(172.8)).toBeCloseTo(-1.6);
        expect(PreciseDroidHitWindow.mehWindowToOD(246)).toBeCloseTo(-1.6);
    });
});

describe("Test osu!standard OD to hit window conversion", () => {
    test("OD 10", () => {
        const hitWindow = new OsuHitWindow(10);

        expect(hitWindow.greatWindow).toBeCloseTo(20);
        expect(hitWindow.okWindow).toBeCloseTo(60);
        expect(hitWindow.mehWindow).toBeCloseTo(100);
    });

    test("OD 8.2", () => {
        const hitWindow = new OsuHitWindow(8.2);

        expect(hitWindow.greatWindow).toBeCloseTo(30.8);
        expect(hitWindow.okWindow).toBeCloseTo(74.4);
        expect(hitWindow.mehWindow).toBeCloseTo(118);
    });

    test("OD 6.5", () => {
        const hitWindow = new OsuHitWindow(6.5);

        expect(hitWindow.greatWindow).toBeCloseTo(41);
        expect(hitWindow.okWindow).toBeCloseTo(88);
        expect(hitWindow.mehWindow).toBeCloseTo(135);
    });

    test("OD 3.7", () => {
        const hitWindow = new OsuHitWindow(3.7);

        expect(hitWindow.greatWindow).toBeCloseTo(57.8);
        expect(hitWindow.okWindow).toBeCloseTo(110.4);
        expect(hitWindow.mehWindow).toBeCloseTo(163);
    });

    test("OD -1.6", () => {
        const hitWindow = new OsuHitWindow(-1.6);

        expect(hitWindow.greatWindow).toBeCloseTo(89.6);
        expect(hitWindow.okWindow).toBeCloseTo(152.8);
        expect(hitWindow.mehWindow).toBeCloseTo(216);
    });
});

describe("Test osu!standard hit window to OD conversion", () => {
    test("OD 10", () => {
        expect(OsuHitWindow.greatWindowToOD(20)).toBeCloseTo(10);
        expect(OsuHitWindow.okWindowToOD(60)).toBeCloseTo(10);
        expect(OsuHitWindow.mehWindowToOD(100)).toBeCloseTo(10);
    });

    test("OD 8.2", () => {
        expect(OsuHitWindow.greatWindowToOD(30.8)).toBeCloseTo(8.2);
        expect(OsuHitWindow.okWindowToOD(74.4)).toBeCloseTo(8.2);
        expect(OsuHitWindow.mehWindowToOD(118)).toBeCloseTo(8.2);
    });

    test("OD 6.5", () => {
        expect(OsuHitWindow.greatWindowToOD(41)).toBeCloseTo(6.5);
        expect(OsuHitWindow.okWindowToOD(88)).toBeCloseTo(6.5);
        expect(OsuHitWindow.mehWindowToOD(135)).toBeCloseTo(6.5);
    });

    test("OD 3.7", () => {
        expect(OsuHitWindow.greatWindowToOD(57.8)).toBeCloseTo(3.7);
        expect(OsuHitWindow.okWindowToOD(110.4)).toBeCloseTo(3.7);
        expect(OsuHitWindow.mehWindowToOD(163)).toBeCloseTo(3.7);
    });

    test("OD -1.6", () => {
        expect(OsuHitWindow.greatWindowToOD(89.6)).toBeCloseTo(-1.6);
        expect(OsuHitWindow.okWindowToOD(152.8)).toBeCloseTo(-1.6);
        expect(OsuHitWindow.mehWindowToOD(216)).toBeCloseTo(-1.6);
    });
});

test("Test empty hit window", () => {
    const hitWindow = new EmptyHitWindow();

    expect(hitWindow.greatWindow).toBe(0);
    expect(hitWindow.okWindow).toBe(0);
    expect(hitWindow.mehWindow).toBe(0);
});
