import { Circle, objectTypes, Vector2 } from "../../../src";

const createCircle = (newCombo?: boolean) => {
    return new Circle({
        startTime: 1000,
        position: new Vector2(256, 192),
        type: objectTypes.circle,
        newCombo: newCombo,
    });
};

describe("Test circle position", () => {
    test("Circle same position", () => {
        const circle = createCircle();

        expect(circle.position).toEqual(circle.endPosition);
    });

    test("Circle stacked position without height", () => {
        const circle = createCircle();

        expect(circle.stackedPosition).toEqual(circle.position);
    });

    test("Circle stacked end position without height", () => {
        const circle = createCircle();

        expect(circle.stackedEndPosition).toEqual(circle.position);
    });

    test("Circle stacked position with height", () => {
        const circle = createCircle();

        circle.stackHeight = 1;

        let positionOffset = circle.stackedPosition.subtract(circle.position);

        expect(positionOffset.x).toBeCloseTo(
            circle.scale * circle.stackHeight * -6.4
        );
        expect(positionOffset.y).toBeCloseTo(
            circle.scale * circle.stackHeight * -6.4
        );

        circle.stackHeight = 2;

        positionOffset = circle.stackedPosition.subtract(circle.position);

        expect(positionOffset.x).toBeCloseTo(
            circle.scale * circle.stackHeight * -6.4
        );
        expect(positionOffset.y).toBeCloseTo(
            circle.scale * circle.stackHeight * -6.4
        );

        circle.stackHeight = 4;

        positionOffset = circle.stackedPosition.subtract(circle.position);

        expect(positionOffset.x).toBeCloseTo(
            circle.scale * circle.stackHeight * -6.4
        );
        expect(positionOffset.y).toBeCloseTo(
            circle.scale * circle.stackHeight * -6.4
        );
    });

    test("Circle stacked end position with height", () => {
        const circle = createCircle();

        circle.stackHeight = 1;

        let positionOffset = circle.stackedEndPosition.subtract(
            circle.position
        );

        expect(positionOffset.x).toBeCloseTo(
            circle.scale * circle.stackHeight * -6.4
        );
        expect(positionOffset.y).toBeCloseTo(
            circle.scale * circle.stackHeight * -6.4
        );

        circle.stackHeight = 2;

        positionOffset = circle.stackedEndPosition.subtract(circle.position);

        expect(positionOffset.x).toBeCloseTo(
            circle.scale * circle.stackHeight * -6.4
        );
        expect(positionOffset.y).toBeCloseTo(
            circle.scale * circle.stackHeight * -6.4
        );

        circle.stackHeight = 0.5;

        positionOffset = circle.stackedEndPosition.subtract(circle.position);

        expect(positionOffset.x).toBeCloseTo(
            circle.scale * circle.stackHeight * -6.4
        );
        expect(positionOffset.y).toBeCloseTo(
            circle.scale * circle.stackHeight * -6.4
        );
    });
});

test("Test start time and end time", () => {
    const circle = createCircle();

    expect(circle.startTime).toBe(circle.endTime);
});

test("Test new combo", () => {
    const circle = createCircle(true);

    expect(circle.isNewCombo).toBe(true);
});

test("Test circle radius", () => {
    const baseRadius = 64;

    const circle = createCircle();

    expect(circle.radius).toEqual(baseRadius);

    circle.scale = 0.5;

    expect(circle.radius).toBeCloseTo(baseRadius / 2);

    circle.scale = 2;

    expect(circle.radius).toBeCloseTo(baseRadius * 2);
});
