import { PathType, Vector2, SliderPath } from "../../src";

const parseSlider = (str: string) => {
    const parts = str.split(",");

    const position = new Vector2(+parts[0], +parts[1]);

    const anchorPoints = parts[5].split("|");

    const type = anchorPoints.shift()!;

    let pathType: PathType;

    switch (type) {
        case "B":
            pathType = PathType.Bezier;
            break;
        case "L":
            pathType = PathType.Linear;
            break;
        case "P":
            pathType = PathType.PerfectCurve;
            break;
        default:
            pathType = PathType.Catmull;
    }

    const controlPoints = [new Vector2(0, 0)];

    for (const point of anchorPoints) {
        const temp = point.split(":");
        const vec = new Vector2(+temp[0], +temp[1]);
        controlPoints.push(vec.subtract(position));
    }

    // A special case for old beatmaps where the first
    // control point is in the position of the slider.
    if (controlPoints[0].equals(controlPoints[1])) {
        controlPoints.shift();
    }

    return {
        pathType: pathType,
        controlPoints: controlPoints,
        expectedDistance: Math.max(0, +parts[7]),
    };
};

const testPathValidity = (path: SliderPath) => {
    for (const controlPoint of path.calculatedPath) {
        expect(controlPoint.x).not.toBeNaN();
        expect(controlPoint.y).not.toBeNaN();

        expect(controlPoint.x).not.toBe(Infinity);
        expect(controlPoint.y).not.toBe(Infinity);

        expect(controlPoint.x).not.toBe(-Infinity);
        expect(controlPoint.y).not.toBe(-Infinity);
    }
};

describe("Test bezier slider", () => {
    test("Without red anchor point", () => {
        const slider = parseSlider(
            "387,350,73381,6,0,B|262:394|299:299|153:344,1,215.999993408203,10|0,2:0|3:0,2:0:0:0:",
        );

        const path = new SliderPath(slider);

        expect(path.cumulativeLength.at(-1)).toBeCloseTo(
            slider.expectedDistance,
        );

        testPathValidity(path);
    });

    test("With red anchor point", () => {
        const slider = parseSlider(
            "45,352,22787,6,0,B|-27:363|-27:363|3:269,1,170.999994781494,4|10,1:2|2:0,2:0:0:0:",
        );

        const path = new SliderPath(slider);

        testPathValidity(path);

        expect(path.cumulativeLength.at(-1)).toBeCloseTo(
            slider.expectedDistance,
        );
        expect(path.calculatedPath).toContainEqual(new Vector2(-72, 11));
    });
});

test("Test linear slider", () => {
    const slider = parseSlider(
        "36,53,24587,2,0,L|102:42,1,56.9999982604981,10|0,1:2|2:0,2:0:0:0:",
    );

    const path = new SliderPath(slider);

    expect(path.cumulativeLength.at(-1)).toBeCloseTo(slider.expectedDistance);
    testPathValidity(path);
});

describe("Test perfect curve slider", () => {
    test("With 3 anchor points", () => {
        const slider = parseSlider(
            "117,124,25187,6,0,P|167:148|196:196,1,113.999996520996,4|2,1:2|2:0,2:0:0:0:",
        );

        const path = new SliderPath(slider);

        expect(path.cumulativeLength.at(-1)).toBeCloseTo(
            slider.expectedDistance,
        );
        testPathValidity(path);
    });

    test("Not with 3 anchor points", () => {
        const slider = parseSlider(
            "117,124,25187,6,0,P|167:148|196:196|225:225,1,113.999996520996,4|2,1:2|2:0,2:0:0:0:",
        );

        const path = new SliderPath(slider);

        expect(path.cumulativeLength.at(-1)).toBeCloseTo(
            slider.expectedDistance,
        );
        testPathValidity(path);
    });
});

describe("Test catmull slider", () => {
    test("With last two anchor points being equal", () => {
        const slider = parseSlider(
            "416,320,11119,6,0,C|416:320|128:320|128:320,1,300",
        );

        const path = new SliderPath(slider);

        expect(path.cumulativeLength.at(-1)).toBeCloseTo(300);
        testPathValidity(path);
    });

    test("Regular catmull slider", () => {
        const slider = parseSlider("416,320,11119,6,0,C|416:320|128:320,1,280");

        const path = new SliderPath(slider);

        expect(path.cumulativeLength.at(-1)).toBeCloseTo(
            slider.expectedDistance,
        );
        testPathValidity(path);
    });
});

test("Test negative length path", () => {
    const path = new SliderPath({
        pathType: PathType.Linear,
        controlPoints: [new Vector2(0, 0), new Vector2(0, 0)],
        expectedDistance: -1,
    });

    expect(path.calculatedPath.length).toBe(1);
    expect(path.cumulativeLength.length).toBe(1);

    testPathValidity(path);
});

describe("Test path positionAt", () => {
    test("Without control points", () => {
        const path = new SliderPath({
            pathType: PathType.Linear,
            controlPoints: [],
            expectedDistance: 0,
        });

        expect(path.positionAt(0)).toEqual(new Vector2(0, 0));
    });

    test("With control points", () => {
        const path = new SliderPath({
            pathType: PathType.Linear,
            controlPoints: [new Vector2(0, 0), new Vector2(100, 0)],
            expectedDistance: 100,
        });

        expect(path.positionAt(0).x).toBe(0);
        expect(path.positionAt(0.1).x).toBeCloseTo(10);
        expect(path.positionAt(0.2).x).toBeCloseTo(20);
        expect(path.positionAt(0.25).x).toBeCloseTo(25);
        expect(path.positionAt(0.5).x).toBeCloseTo(50);
        expect(path.positionAt(0.75).x).toBeCloseTo(75);
        expect(path.positionAt(1).x).toBe(100);
    });

    test("Control points are extremely close to each other", () => {
        const path = new SliderPath({
            pathType: PathType.Linear,
            controlPoints: [new Vector2(0, 0), new Vector2(0.001, 0)],
            expectedDistance: 0.001,
        });

        expect(path.positionAt(0).x).toBeCloseTo(0);
        expect(path.positionAt(0.5).x).toBeCloseTo(0.0005);
        expect(path.positionAt(1).x).toBeCloseTo(0.001);
    });
});
