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
