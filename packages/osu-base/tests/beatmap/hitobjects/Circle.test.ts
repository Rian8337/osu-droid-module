import { Circle, HitObject, Modes, ObjectTypes, Vector2 } from "../../../src";

const createCircle = (newCombo?: boolean) => {
    return new Circle({
        startTime: 1000,
        position: new Vector2(256, 192),
        type: ObjectTypes.circle,
        newCombo: newCombo,
    });
};

describe("Test circle position", () => {
    test("Circle same position", () => {
        const circle = createCircle();

        expect(circle.position).toEqual(circle.endPosition);
    });

    describe("Circle stacked position", () => {
        test("Without height", () => {
            const circle = createCircle();

            expect(circle.getStackedPosition(Modes.droid)).toEqual(
                circle.position,
            );
            expect(circle.getStackedPosition(Modes.osu)).toEqual(
                circle.position,
            );
        });

        describe("With height", () => {
            const executeTest = (mode: Modes) => {
                const circle = createCircle();

                circle.stackHeight = 1;

                const stackMultiplier = mode === Modes.droid ? 4 : -6.4;

                let positionOffset = circle
                    .getStackedPosition(mode)
                    .subtract(circle.position);

                expect(positionOffset.x).toBeCloseTo(
                    circle.scale * circle.stackHeight * stackMultiplier,
                );
                expect(positionOffset.y).toBeCloseTo(
                    circle.scale * circle.stackHeight * stackMultiplier,
                );

                circle.stackHeight = 2;

                positionOffset = circle
                    .getStackedPosition(mode)
                    .subtract(circle.position);

                expect(positionOffset.x).toBeCloseTo(
                    circle.scale * circle.stackHeight * stackMultiplier,
                );
                expect(positionOffset.y).toBeCloseTo(
                    circle.scale * circle.stackHeight * stackMultiplier,
                );

                circle.stackHeight = 4;

                positionOffset = circle
                    .getStackedPosition(mode)
                    .subtract(circle.position);

                expect(positionOffset.x).toBeCloseTo(
                    circle.scale * circle.stackHeight * stackMultiplier,
                );
                expect(positionOffset.y).toBeCloseTo(
                    circle.scale * circle.stackHeight * stackMultiplier,
                );
            };

            test("osu!droid gamemode", () => executeTest(Modes.droid));
            test("osu!standard gamemode", () => executeTest(Modes.osu));
        });
    });

    describe("Circle stacked end position", () => {
        test("Without height", () => {
            const circle = createCircle();

            expect(circle.getStackedEndPosition(Modes.droid)).toEqual(
                circle.position,
            );
            expect(circle.getStackedEndPosition(Modes.osu)).toEqual(
                circle.position,
            );
        });

        describe("With height", () => {
            const executeTest = (mode: Modes) => {
                const circle = createCircle();

                circle.stackHeight = 1;

                const stackMultiplier = mode === Modes.droid ? 4 : -6.4;

                let positionOffset = circle
                    .getStackedEndPosition(mode)
                    .subtract(circle.endPosition);

                expect(positionOffset.x).toBeCloseTo(
                    circle.scale * circle.stackHeight * stackMultiplier,
                );
                expect(positionOffset.y).toBeCloseTo(
                    circle.scale * circle.stackHeight * stackMultiplier,
                );

                circle.stackHeight = 2;

                positionOffset = circle
                    .getStackedEndPosition(mode)
                    .subtract(circle.endPosition);

                expect(positionOffset.x).toBeCloseTo(
                    circle.scale * circle.stackHeight * stackMultiplier,
                );
                expect(positionOffset.y).toBeCloseTo(
                    circle.scale * circle.stackHeight * stackMultiplier,
                );

                circle.stackHeight = 4;

                positionOffset = circle
                    .getStackedEndPosition(mode)
                    .subtract(circle.endPosition);

                expect(positionOffset.x).toBeCloseTo(
                    circle.scale * circle.stackHeight * stackMultiplier,
                );
                expect(positionOffset.y).toBeCloseTo(
                    circle.scale * circle.stackHeight * stackMultiplier,
                );
            };

            test("osu!droid gamemode", () => executeTest(Modes.droid));
            test("osu!standard gamemode", () => executeTest(Modes.osu));
        });
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
    const circle = createCircle();

    expect(circle.radius).toEqual(HitObject.baseRadius);

    circle.scale = 0.5;

    expect(circle.radius).toBeCloseTo(HitObject.baseRadius / 2);

    circle.scale = 2;

    expect(circle.radius).toBeCloseTo(HitObject.baseRadius * 2);
});

test("Test type string", () => {
    const circle = createCircle();

    expect(circle.typeStr).toBe("circle");
});

test("Test string concatenation", () => {
    const circle = createCircle();

    expect(circle.toString()).toBe("Position: [256, 192]");
});
