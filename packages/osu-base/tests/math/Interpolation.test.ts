import { Easing, Interpolation, Vector2 } from "../../src";

test("Test linear interpolation of numbers", () => {
    expect(Interpolation.lerp(4, 5, 2)).toBe(6);
    expect(Interpolation.lerp(2, 5, 2)).toBe(8);
    expect(Interpolation.lerp(-1, 7, 2)).toBe(15);
});

test("Test linear interpolation of vectors", () => {
    expect(Interpolation.lerp(new Vector2(4), new Vector2(5), 2)).toEqual(
        new Vector2(6),
    );

    expect(Interpolation.lerp(new Vector2(2, 3), new Vector2(5, 6), 2)).toEqual(
        new Vector2(8, 9),
    );

    expect(
        Interpolation.lerp(new Vector2(-1, 2), new Vector2(7, 8), 2),
    ).toEqual(new Vector2(15, 14));
});

describe("Test interpolation using easing functions", () => {
    const testEasing = (easing: Easing, t: number, expected: number) => {
        expect(Interpolation.easing(easing, t)).toBeCloseTo(expected);
    };

    test("Easing.none", () => {
        testEasing(Easing.none, 0.5, 0.5);
        testEasing(Easing.none, 0.75, 0.75);
    });

    test("Easing.out", () => {
        testEasing(Easing.out, 0.5, 0.75);
        testEasing(Easing.out, 0.75, 0.9375);
    });

    test("Easing.outQuad", () => {
        testEasing(Easing.outQuad, 0.5, 0.75);
        testEasing(Easing.outQuad, 0.75, 0.9375);
    });

    test("Easing.in", () => {
        testEasing(Easing.in, 0.5, 0.25);
        testEasing(Easing.in, 0.75, 0.5625);
    });

    test("Easing.inQuad", () => {
        testEasing(Easing.inQuad, 0.5, 0.25);
        testEasing(Easing.inQuad, 0.75, 0.5625);
    });

    test("Easing.inOutQuad", () => {
        testEasing(Easing.inOutQuad, 0.5, 0.5);
        testEasing(Easing.inOutQuad, 0.75, 0.875);
    });

    test("Easing.inCubic", () => {
        testEasing(Easing.inCubic, 0.5, 0.125);
        testEasing(Easing.inCubic, 0.75, 0.421875);
    });

    test("Easing.outCubic", () => {
        testEasing(Easing.outCubic, 0.5, 0.875);
        testEasing(Easing.outCubic, 0.75, 0.984375);
    });

    test("Easing.inOutCubic", () => {
        testEasing(Easing.inOutCubic, 0.5, 0.5);
        testEasing(Easing.inOutCubic, 0.75, 0.9375);
    });

    test("Easing.inQuart", () => {
        testEasing(Easing.inQuart, 0.5, 0.0625);
        testEasing(Easing.inQuart, 0.75, 0.31640625);
    });

    test("Easing.outQuart", () => {
        testEasing(Easing.outQuart, 0.5, 0.9375);
        testEasing(Easing.outQuart, 0.75, 0.99609375);
    });

    test("Easing.inOutQuart", () => {
        testEasing(Easing.inOutQuart, 0.5, 0.5);
        testEasing(Easing.inOutQuart, 0.75, 0.96875);
    });

    test("Easing.inQuint", () => {
        testEasing(Easing.inQuint, 0.5, 0.03125);
        testEasing(Easing.inQuint, 0.75, 0.2373046875);
    });

    test("Easing.outQuint", () => {
        testEasing(Easing.outQuint, 0.5, 0.96875);
        testEasing(Easing.outQuint, 0.75, 0.9990234375);
    });

    test("Easing.inOutQuint", () => {
        testEasing(Easing.inOutQuint, 0.5, 0.5);
        testEasing(Easing.inOutQuint, 0.75, 0.984375);
    });

    test("Easing.inSine", () => {
        testEasing(Easing.inSine, 0.5, 0.292893);
        testEasing(Easing.inSine, 0.75, 0.6173165676349102);
    });

    test("Easing.outSine", () => {
        testEasing(Easing.outSine, 0.5, 0.707107);
        testEasing(Easing.outSine, 0.75, 0.9238795325112867);
    });

    test("Easing.inOutSine", () => {
        testEasing(Easing.inOutSine, 0.5, 0.5);
        testEasing(Easing.inOutSine, 0.75, 0.853553);
    });

    test("Easing.inExpo", () => {
        testEasing(Easing.inExpo, 0.5, 0.03125);
        testEasing(Easing.inExpo, 0.75, 0.17677669529663687);
    });

    test("Easing.outExpo", () => {
        testEasing(Easing.outExpo, 0.5, 0.96875);
        testEasing(Easing.outExpo, 0.75, 0.99447572827198);
    });

    test("Easing.inOutExpo", () => {
        testEasing(Easing.inOutExpo, 0.5, 0.5);
        testEasing(Easing.inOutExpo, 0.75, 0.984375);
    });

    test("Easing.inCirc", () => {
        testEasing(Easing.inCirc, 0.5, 0.1339745962155614);
        testEasing(Easing.inCirc, 0.75, 0.3385621722338523);
    });

    test("Easing.outCirc", () => {
        testEasing(Easing.outCirc, 0.5, 0.8660254037844386);
        testEasing(Easing.outCirc, 0.75, 0.9682458365518543);
    });

    test("Easing.inOutCirc", () => {
        testEasing(Easing.inOutCirc, 0.5, 0.5);
        testEasing(Easing.inOutCirc, 0.75, 0.9330127018922193);
    });

    test("Easing.inElastic", () => {
        testEasing(Easing.inElastic, 0.5, -0.015624999999999993);
        testEasing(Easing.inElastic, 0.75, 0.08838834764831859);
    });

    test("Easing.outElastic", () => {
        testEasing(Easing.outElastic, 0.5, 1.015625);
        testEasing(Easing.outElastic, 0.75, 1.00552427172802);
    });

    test("Easing.outElasticHalf", () => {
        testEasing(Easing.outElasticHalf, 0.5, 0.984375);
        testEasing(Easing.outElasticHalf, 0.75, 1);
    });

    test("Easing.outElasticQuarter", () => {
        testEasing(Easing.outElasticQuarter, 0.5, 1.0270632938682638);
        testEasing(Easing.outElasticQuarter, 0.75, 1.00390625);
    });

    test("Easing.inOutElastic", () => {
        testEasing(Easing.inOutElastic, 0.5, 0.5);
        testEasing(Easing.inOutElastic, 0.75, 0.988030555576266);
    });

    test("Easing.inBack", () => {
        testEasing(Easing.inBack, 0.5, -0.08769750000000004);
        testEasing(Easing.inBack, 0.75, 0.1825903124999999);
    });

    test("Easing.outBack", () => {
        testEasing(Easing.outBack, 0.5, 1.0876975);
        testEasing(Easing.outBack, 0.75, 1.0641365625);
    });

    test("Easing.inOutBack", () => {
        testEasing(Easing.inOutBack, 0.5, 0.5);
        testEasing(Easing.inOutBack, 0.75, 1.09968184375);
    });

    test("Easing.inBounce", () => {
        testEasing(Easing.inBounce, 0.5, 0.234375);
        testEasing(Easing.inBounce, 0.75, 0.52734375);
    });

    test("Easing.outBounce", () => {
        testEasing(Easing.outBounce, 0.5, 0.765625);
        testEasing(Easing.outBounce, 0.75, 0.97265625);
    });

    test("Easing.inOutBounce", () => {
        testEasing(Easing.inOutBounce, 0.5, 0.5);
        testEasing(Easing.inOutBounce, 0.75, 0.8828125);
    });

    test("Easing.outPow10", () => {
        testEasing(Easing.outPow10, 0.5, 0.9999999999999999);
        testEasing(Easing.outPow10, 0.75, 1);
    });
});
