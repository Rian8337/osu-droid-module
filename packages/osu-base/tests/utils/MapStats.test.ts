import { MapStats, ModDoubleTime } from "../../src";

test("Test multiple calculate calls", () => {
    const stats = new MapStats({
        cs: 4,
        ar: 9,
        od: 8,
        hp: 6,
        speedMultiplier: 1.5,
    }).calculate();

    expect(stats.ar).toBeCloseTo(10.33);
    expect(stats.od).toBeCloseTo(9.78);

    stats.calculate();

    expect(stats.ar).toBeCloseTo(10.33);
    expect(stats.od).toBeCloseTo(9.78);
});

describe("Test calculation using calculate parameters", () => {
    test("Mods", () => {
        const stats = new MapStats({
            cs: 4,
            ar: 9,
            od: 8,
            hp: 6,
        }).calculate({ mods: "DT" });

        expect(stats.mods[0]).toBeInstanceOf(ModDoubleTime);
        expect(stats.ar).toBeCloseTo(10.33);
        expect(stats.od).toBeCloseTo(9.78);
    });

    test("Force AR", () => {
        const stats = new MapStats({
            cs: 4,
            ar: 9,
            od: 8,
            hp: 6,
            speedMultiplier: 1.5,
        }).calculate({ isForceAR: true });

        expect(stats.ar).toBe(9);
    });

    test("Speed multiplier", () => {
        const stats = new MapStats({
            cs: 4,
            ar: 9,
            od: 8,
            hp: 6,
        }).calculate({ speedMultiplier: 1.5 });

        expect(stats.ar).toBeCloseTo(10.33);
        expect(stats.od).toBeCloseTo(9.78);
    });
});

test("Test string concatenation", () => {
    const stats = new MapStats({
        cs: 4,
        ar: 9,
        od: 8,
        hp: 6,
    });

    expect(stats.toString()).toBe("CS: 4.00, AR: 9.00, OD: 8.00, HP: 6.00");
});
