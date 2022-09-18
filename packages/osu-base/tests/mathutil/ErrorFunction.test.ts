import { ErrorFunction } from "../../src";

test("Test error function", () => {
    expect(ErrorFunction.erf(Number.NaN)).toBeNaN();
    expect(ErrorFunction.erf(-1)).toBeCloseTo(-0.8427007929497149, 10);
    expect(ErrorFunction.erf(0)).toBe(0);
    expect(ErrorFunction.erf(1e-15)).toBeCloseTo(
        0.000000000000001128379167095513,
        10
    );
    expect(ErrorFunction.erf(0.1)).toBeCloseTo(0.1124629160182849, 10);
    expect(ErrorFunction.erf(0.2)).toBeCloseTo(0.2227025892104785, 10);
    expect(ErrorFunction.erf(0.3)).toBeCloseTo(0.3286267594591274, 10);
    expect(ErrorFunction.erf(0.4)).toBeCloseTo(0.4283923550466685, 10);
    expect(ErrorFunction.erf(0.5)).toBeCloseTo(0.5204998778130465, 10);
    expect(ErrorFunction.erf(1)).toBeCloseTo(0.8427007929497149, 10);
    expect(ErrorFunction.erf(1.5)).toBeCloseTo(0.966105146475311, 10);
    expect(ErrorFunction.erf(2)).toBeCloseTo(0.9953222650189527, 10);
    expect(ErrorFunction.erf(2.5)).toBeCloseTo(0.999593047982555, 10);
    expect(ErrorFunction.erf(3)).toBeCloseTo(0.9999779095030014, 10);
    expect(ErrorFunction.erf(4)).toBeCloseTo(0.9999999845827421, 10);
    expect(ErrorFunction.erf(5)).toBeCloseTo(0.9999999999984625, 10);
    expect(ErrorFunction.erf(6)).toBeCloseTo(0.9999999999999999, 10);
    expect(ErrorFunction.erf(Number.POSITIVE_INFINITY)).toBe(1);
    expect(ErrorFunction.erf(Number.NEGATIVE_INFINITY)).toBe(-1);
});

test("Test complementary error function", () => {
    expect(ErrorFunction.erfc(Number.NaN)).toBeNaN();
    expect(ErrorFunction.erfc(-1)).toBeCloseTo(1.8427007929497148, 10);
    expect(ErrorFunction.erfc(0)).toBe(1);
    expect(ErrorFunction.erfc(0.1)).toBeCloseTo(0.887537083981715, 10);
    expect(ErrorFunction.erfc(0.2)).toBeCloseTo(0.77729741078952153, 10);
    expect(ErrorFunction.erfc(0.3)).toBeCloseTo(0.6713732405408726, 10);
    expect(ErrorFunction.erfc(0.4)).toBeCloseTo(0.5716076449533315, 10);
    expect(ErrorFunction.erfc(0.5)).toBeCloseTo(0.4795001221869535, 10);
    expect(ErrorFunction.erfc(1)).toBeCloseTo(0.15729920705028513, 10);
    expect(ErrorFunction.erfc(1.5)).toBeCloseTo(0.03389485352468927, 10);
    expect(ErrorFunction.erfc(2)).toBeCloseTo(0.004677734981047266, 10);
    expect(ErrorFunction.erfc(2.5)).toBeCloseTo(0.0004069520174449589, 10);
    expect(ErrorFunction.erfc(3)).toBeCloseTo(0.000022090496998585441, 10);
    expect(ErrorFunction.erfc(4)).toBeCloseTo(0.00000001541725790028002, 10);
    expect(ErrorFunction.erfc(5)).toBeCloseTo(
        0.000000000001537459794428035,
        10
    );
    expect(ErrorFunction.erfc(6)).toBeCloseTo(2.1519736712498913e-17, 10);
    expect(ErrorFunction.erfc(10)).toBeCloseTo(2.088487583762545e-45, 10);
    expect(ErrorFunction.erfc(15)).toBeCloseTo(7.212994172451207e-100, 10);
    expect(ErrorFunction.erfc(20)).toBeCloseTo(5.395865611607901e-176, 10);
    expect(ErrorFunction.erfc(30)).toBeCloseTo(
        2.5646562037561116000333972775014471465488897227786155e-393,
        10
    );
    expect(ErrorFunction.erfc(50)).toBeCloseTo(
        2.0709207788416560484484478751657887929322509209953988e-1088,
        10
    );
    expect(ErrorFunction.erfc(80)).toBeCloseTo(
        2.3100265595063985852034904366341042118385080919280966e-2782,
        10
    );
    expect(ErrorFunction.erfc(Number.POSITIVE_INFINITY)).toBe(0);
    expect(ErrorFunction.erfc(Number.NEGATIVE_INFINITY)).toBe(2);
});

test("Test inverse error function", () => {
    expect(ErrorFunction.erfInv(Number.NaN)).toBeNaN();
    expect(ErrorFunction.erfInv(-0.8427007929497149)).toBeCloseTo(-1, 4);
    expect(ErrorFunction.erfInv(0)).toBe(0);
    expect(ErrorFunction.erfInv(0.0000000000000011283791670955127)).toBeCloseTo(
        1e-15,
        4
    );
    expect(ErrorFunction.erfInv(0.1124629160182849)).toBeCloseTo(0.1, 4);
    expect(ErrorFunction.erfInv(0.2227025892104785)).toBeCloseTo(0.2, 4);
    expect(ErrorFunction.erfInv(0.3286267594591274)).toBeCloseTo(0.3, 4);
    expect(ErrorFunction.erfInv(0.4283923550466685)).toBeCloseTo(0.4, 4);
    expect(ErrorFunction.erfInv(0.5204998778130465)).toBeCloseTo(0.5, 4);
    expect(ErrorFunction.erfInv(0.8427007929497149)).toBeCloseTo(1, 4);
    expect(ErrorFunction.erfInv(0.966105146475311)).toBeCloseTo(1.5, 4);
    expect(ErrorFunction.erfInv(0.9953222650189527)).toBeCloseTo(2, 4);
    expect(ErrorFunction.erfInv(0.999593047982555)).toBeCloseTo(2.5, 4);
    expect(ErrorFunction.erfInv(0.9999779095030014)).toBeCloseTo(3, 4);
    expect(ErrorFunction.erfInv(0.9999999845827421)).toBeCloseTo(4, 4);
    expect(ErrorFunction.erfInv(0.9999999999984625)).toBeCloseTo(5, 4);
    expect(ErrorFunction.erfInv(1)).toBe(Number.POSITIVE_INFINITY);
    expect(ErrorFunction.erfInv(-1)).toBe(Number.NEGATIVE_INFINITY);
});
