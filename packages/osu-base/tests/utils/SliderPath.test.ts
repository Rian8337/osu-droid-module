import { PathType } from "../../src/constants/PathType";
import { Vector2 } from "../../src/mathutil/Vector2";
import { SliderPath } from "../../src/utils/SliderPath";

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

    return {
        pathType: pathType,
        controlPoints: controlPoints,
        expectedDistance: Math.max(0, +parts[7]),
    };
};

const testSliderValidity = (str: string) => {
    const slider = parseSlider(str);

    const path = new SliderPath(slider);

    expect(path.cumulativeLength.at(-1)).toBeCloseTo(slider.expectedDistance);

    for (const controlPoint of path.calculatedPath) {
        expect(controlPoint.x).not.toBeNaN();
        expect(controlPoint.y).not.toBeNaN();

        expect(controlPoint.x).not.toBe(Infinity);
        expect(controlPoint.y).not.toBe(Infinity);

        expect(controlPoint.x).not.toBe(-Infinity);
        expect(controlPoint.y).not.toBe(-Infinity);
    }

    return path;
};

describe("Test bezier slider", () => {
    test("Without red anchor point", () => {
        testSliderValidity(
            "387,350,73381,6,0,B|262:394|299:299|153:344,1,215.999993408203,10|0,2:0|3:0,2:0:0:0:"
        );
    });

    test("With red anchor point", () => {
        const path = testSliderValidity(
            "45,352,22787,6,0,B|-27:363|-27:363|3:269,1,170.999994781494,4|10,1:2|2:0,2:0:0:0:"
        );

        expect(path.calculatedPath).toContainEqual(new Vector2(-72, 11));
    });
});

test("Test linear slider", () => {
    testSliderValidity(
        "36,53,24587,2,0,L|102:42,1,56.9999982604981,10|0,1:2|2:0,2:0:0:0:"
    );
});

test("Test perfect curve slider", () => {
    testSliderValidity(
        "117,124,25187,6,0,P|167:148|196:196,1,113.999996520996,4|2,1:2|2:0,2:0:0:0:"
    );
});

test("Test catmull slider", () => {
    testSliderValidity("416,320,11119,6,0,C|416:320|128:320,1,280");
});
