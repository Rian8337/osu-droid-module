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

test("Test reverse linear interpolation", () => {
    expect(Interpolation.reverseLerp(5, 4, 6)).toBe(0.5);
    expect(Interpolation.reverseLerp(5, 2, 8)).toBe(0.5);
    expect(Interpolation.reverseLerp(7, -1, 15)).toBe(0.5);
});

describe("Test interpolation using easing functions", () => {
    const testEasing = (easing: Easing, t: number, expected: number) => {
        expect(Interpolation.easing(easing, t)).toBeCloseTo(expected);
    };

    test("Easing.none", () => {
        testEasing(Easing.None, 0.5, 0.5);
        testEasing(Easing.None, 0.75, 0.75);
    });

    test("Easing.out", () => {
        testEasing(Easing.Out, 0.5, 0.75);
        testEasing(Easing.Out, 0.75, 0.9375);
    });

    test("Easing.outQuad", () => {
        testEasing(Easing.OutQuad, 0.5, 0.75);
        testEasing(Easing.OutQuad, 0.75, 0.9375);
    });

    test("Easing.in", () => {
        testEasing(Easing.In, 0.5, 0.25);
        testEasing(Easing.In, 0.75, 0.5625);
    });

    test("Easing.inQuad", () => {
        testEasing(Easing.InQuad, 0.5, 0.25);
        testEasing(Easing.InQuad, 0.75, 0.5625);
    });

    test("Easing.inOutQuad", () => {
        testEasing(Easing.InOutQuad, 0.5, 0.5);
        testEasing(Easing.InOutQuad, 0.75, 0.875);
    });

    test("Easing.inCubic", () => {
        testEasing(Easing.InCubic, 0.5, 0.125);
        testEasing(Easing.InCubic, 0.75, 0.421875);
    });

    test("Easing.outCubic", () => {
        testEasing(Easing.OutCubic, 0.5, 0.875);
        testEasing(Easing.OutCubic, 0.75, 0.984375);
    });

    test("Easing.inOutCubic", () => {
        testEasing(Easing.InOutCubic, 0.5, 0.5);
        testEasing(Easing.InOutCubic, 0.75, 0.9375);
    });

    test("Easing.inQuart", () => {
        testEasing(Easing.InQuart, 0.5, 0.0625);
        testEasing(Easing.InQuart, 0.75, 0.31640625);
    });

    test("Easing.outQuart", () => {
        testEasing(Easing.OutQuart, 0.5, 0.9375);
        testEasing(Easing.OutQuart, 0.75, 0.99609375);
    });

    test("Easing.inOutQuart", () => {
        testEasing(Easing.InOutQuart, 0.5, 0.5);
        testEasing(Easing.InOutQuart, 0.75, 0.96875);
    });

    test("Easing.inQuint", () => {
        testEasing(Easing.InQuint, 0.5, 0.03125);
        testEasing(Easing.InQuint, 0.75, 0.2373046875);
    });

    test("Easing.outQuint", () => {
        testEasing(Easing.OutQuint, 0.5, 0.96875);
        testEasing(Easing.OutQuint, 0.75, 0.9990234375);
    });

    test("Easing.inOutQuint", () => {
        testEasing(Easing.InOutQuint, 0.5, 0.5);
        testEasing(Easing.InOutQuint, 0.75, 0.984375);
    });

    test("Easing.inSine", () => {
        testEasing(Easing.InSine, 0.5, 0.292893);
        testEasing(Easing.InSine, 0.75, 0.6173165676349102);
    });

    test("Easing.outSine", () => {
        testEasing(Easing.OutSine, 0.5, 0.707107);
        testEasing(Easing.OutSine, 0.75, 0.9238795325112867);
    });

    test("Easing.inOutSine", () => {
        testEasing(Easing.InOutSine, 0.5, 0.5);
        testEasing(Easing.InOutSine, 0.75, 0.853553);
    });

    test("Easing.inExpo", () => {
        testEasing(Easing.InExpo, 0.5, 0.03125);
        testEasing(Easing.InExpo, 0.75, 0.17677669529663687);
    });

    test("Easing.outExpo", () => {
        testEasing(Easing.OutExpo, 0.5, 0.96875);
        testEasing(Easing.OutExpo, 0.75, 0.99447572827198);
    });

    test("Easing.inOutExpo", () => {
        testEasing(Easing.InOutExpo, 0.5, 0.5);
        testEasing(Easing.InOutExpo, 0.75, 0.984375);
    });

    test("Easing.inCirc", () => {
        testEasing(Easing.InCirc, 0.5, 0.1339745962155614);
        testEasing(Easing.InCirc, 0.75, 0.3385621722338523);
    });

    test("Easing.outCirc", () => {
        testEasing(Easing.OutCirc, 0.5, 0.8660254037844386);
        testEasing(Easing.OutCirc, 0.75, 0.9682458365518543);
    });

    test("Easing.inOutCirc", () => {
        testEasing(Easing.InOutCirc, 0.5, 0.5);
        testEasing(Easing.InOutCirc, 0.75, 0.9330127018922193);
    });

    test("Easing.inElastic", () => {
        testEasing(Easing.InElastic, 0.5, -0.015624999999999993);
        testEasing(Easing.InElastic, 0.75, 0.08838834764831859);
    });

    test("Easing.outElastic", () => {
        testEasing(Easing.OutElastic, 0.5, 1.015625);
        testEasing(Easing.OutElastic, 0.75, 1.00552427172802);
    });

    test("Easing.outElasticHalf", () => {
        testEasing(Easing.OutElasticHalf, 0.5, 0.984375);
        testEasing(Easing.OutElasticHalf, 0.75, 1);
    });

    test("Easing.outElasticQuarter", () => {
        testEasing(Easing.OutElasticQuarter, 0.5, 1.0270632938682638);
        testEasing(Easing.OutElasticQuarter, 0.75, 1.00390625);
    });

    test("Easing.inOutElastic", () => {
        testEasing(Easing.InOutElastic, 0.5, 0.5);
        testEasing(Easing.InOutElastic, 0.75, 0.988030555576266);
    });

    test("Easing.inBack", () => {
        testEasing(Easing.InBack, 0.5, -0.08769750000000004);
        testEasing(Easing.InBack, 0.75, 0.1825903124999999);
    });

    test("Easing.outBack", () => {
        testEasing(Easing.OutBack, 0.5, 1.0876975);
        testEasing(Easing.OutBack, 0.75, 1.0641365625);
    });

    test("Easing.inOutBack", () => {
        testEasing(Easing.InOutBack, 0.5, 0.5);
        testEasing(Easing.InOutBack, 0.75, 1.09968184375);
    });

    test("Easing.inBounce", () => {
        testEasing(Easing.InBounce, 0.5, 0.234375);
        testEasing(Easing.InBounce, 0.75, 0.52734375);
    });

    test("Easing.outBounce", () => {
        testEasing(Easing.OutBounce, 0.5, 0.765625);
        testEasing(Easing.OutBounce, 0.75, 0.97265625);
    });

    test("Easing.inOutBounce", () => {
        testEasing(Easing.InOutBounce, 0.5, 0.5);
        testEasing(Easing.InOutBounce, 0.75, 0.8828125);
    });

    test("Easing.outPow10", () => {
        testEasing(Easing.OutPow10, 0.5, 0.9999999999999999);
        testEasing(Easing.OutPow10, 0.75, 1);
    });
});
