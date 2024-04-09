import { PathApproximator, Vector2 } from "../../src";

const testControlPointsValidity = (controlPoints: Vector2[]): void => {
    for (const controlPoint of controlPoints) {
        expect(controlPoint.x).not.toBeNaN();
        expect(controlPoint.y).not.toBeNaN();

        expect(controlPoint.x).not.toBe(Infinity);
        expect(controlPoint.y).not.toBe(Infinity);

        expect(controlPoint.x).not.toBe(-Infinity);
        expect(controlPoint.y).not.toBe(-Infinity);
    }
};

test("Test linear approximation", () => {
    const controlPoints = [
        new Vector2(0, 0),
        new Vector2(100, 0),
        new Vector2(200, 0),
    ];

    const approximatedControlPoints =
        PathApproximator.approximateLinear(controlPoints);

    expect(approximatedControlPoints).toEqual(controlPoints);
});

test("Test catmull approximation", () => {
    const controlPoints = [
        new Vector2(0, 0),
        new Vector2(-29, -90),
        new Vector2(96, -224),
    ];

    const approximatedControlPoints =
        PathApproximator.approximateCatmull(controlPoints);

    for (const controlPoint of controlPoints) {
        expect(approximatedControlPoints).toContainEqual(controlPoint);
    }

    testControlPointsValidity(approximatedControlPoints);
});

describe("Test perfect curve approximation", () => {
    test("Side-length of triangle is almost zero", () => {
        testControlPointsValidity(
            PathApproximator.approximateCircularArc([
                new Vector2(0, 0),
                new Vector2(1e-5, 0),
                new Vector2(0, 1e-5),
            ]),
        );
    });

    test("Radius is smaller than tolerance", () => {
        testControlPointsValidity(
            PathApproximator.approximateCircularArc([
                new Vector2(0, 0),
                new Vector2(0.05, 0),
                new Vector2(0, 0.05),
            ]),
        );
    });

    test("Regular arc", () => {
        testControlPointsValidity(
            PathApproximator.approximateCircularArc([
                new Vector2(0, 0),
                new Vector2(-25, 25),
                new Vector2(58, 39),
            ]),
        );
    });
});

describe("Test bezier curve approximation", () => {
    test("Empty control points", () => {
        expect(PathApproximator.approximateBezier([]).length).toBe(0);
    });

    test("With control points", () => {
        testControlPointsValidity(
            PathApproximator.approximateBezier([
                new Vector2(0, 0),
                new Vector2(-125, 44),
                new Vector2(-88, -88),
                new Vector2(-234, -6),
            ]),
        );
    });
});

describe("Test Reumann-Witkam simplification", () => {
    test("Empty control points", () => {
        expect(
            PathApproximator.simplifyPolylineReumannWitkam([], 10).length,
        ).toBe(0);
    });

    test("With control points", () => {
        const originalPoints = [
            new Vector2(50, 50),
            new Vector2(55, 80),
            new Vector2(60, 100),
            new Vector2(65, 115),
            new Vector2(80, 120),
            new Vector2(95, 117.5),
            new Vector2(115, 105),
            new Vector2(145, 80),
            new Vector2(175, 50),
        ];

        const simplifiedPoints = PathApproximator.simplifyPolylineReumannWitkam(
            originalPoints,
            10,
        );

        expect(simplifiedPoints.length).toBe(4);

        testControlPointsValidity(simplifiedPoints);

        expect(simplifiedPoints[0]).toStrictEqual(originalPoints[0]);
        expect(simplifiedPoints[1]).toStrictEqual(originalPoints[3]);
        expect(simplifiedPoints[2]).toStrictEqual(originalPoints[5]);
        expect(simplifiedPoints[3]).toStrictEqual(originalPoints[8]);
    });
});
