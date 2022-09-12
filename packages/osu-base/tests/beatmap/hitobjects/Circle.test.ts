import { Circle, modes, objectTypes, Vector2 } from "../../../src";

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

    describe("Circle stacked position", () => {
        test("Without height", () => {
            const circle = createCircle();

            expect(circle.getStackedPosition(modes.droid)).toEqual(
                circle.position
            );
            expect(circle.getStackedPosition(modes.osu)).toEqual(
                circle.position
            );
        });

        describe("With height", () => {
            const executeTest = (mode: modes) => {
                const circle = createCircle();

                circle.stackHeight = 1;

                const scale =
                    mode === modes.droid ? circle.droidScale : circle.osuScale;

                let positionOffset = circle
                    .getStackedPosition(mode)
                    .subtract(circle.position);

                expect(positionOffset.x).toBeCloseTo(
                    scale * circle.stackHeight * -6.4
                );
                expect(positionOffset.y).toBeCloseTo(
                    scale * circle.stackHeight * -6.4
                );

                circle.stackHeight = 2;

                positionOffset = circle
                    .getStackedPosition(mode)
                    .subtract(circle.position);

                expect(positionOffset.x).toBeCloseTo(
                    scale * circle.stackHeight * -6.4
                );
                expect(positionOffset.y).toBeCloseTo(
                    scale * circle.stackHeight * -6.4
                );

                circle.stackHeight = 4;

                positionOffset = circle
                    .getStackedPosition(mode)
                    .subtract(circle.position);

                expect(positionOffset.x).toBeCloseTo(
                    scale * circle.stackHeight * -6.4
                );
                expect(positionOffset.y).toBeCloseTo(
                    scale * circle.stackHeight * -6.4
                );
            };

            test("osu!droid gamemode", () => executeTest(modes.droid));
            test("osu!standard gamemode", () => executeTest(modes.osu));
        });
    });

    describe("Circle stacked end position", () => {
        test("Without height", () => {
            const circle = createCircle();

            expect(circle.getStackedEndPosition(modes.droid)).toEqual(
                circle.position
            );
            expect(circle.getStackedEndPosition(modes.osu)).toEqual(
                circle.position
            );
        });

        describe("With height", () => {
            const executeTest = (mode: modes) => {
                const circle = createCircle();

                circle.stackHeight = 1;

                const scale =
                    mode === modes.droid ? circle.droidScale : circle.osuScale;

                let positionOffset = circle
                    .getStackedEndPosition(mode)
                    .subtract(circle.position);

                expect(positionOffset.x).toBeCloseTo(
                    scale * circle.stackHeight * -6.4
                );
                expect(positionOffset.y).toBeCloseTo(
                    scale * circle.stackHeight * -6.4
                );

                circle.stackHeight = 2;

                positionOffset = circle
                    .getStackedEndPosition(mode)
                    .subtract(circle.position);

                expect(positionOffset.x).toBeCloseTo(
                    scale * circle.stackHeight * -6.4
                );
                expect(positionOffset.y).toBeCloseTo(
                    scale * circle.stackHeight * -6.4
                );

                circle.stackHeight = 4;

                positionOffset = circle
                    .getStackedEndPosition(mode)
                    .subtract(circle.position);

                expect(positionOffset.x).toBeCloseTo(
                    scale * circle.stackHeight * -6.4
                );
                expect(positionOffset.y).toBeCloseTo(
                    scale * circle.stackHeight * -6.4
                );
            };

            test("osu!droid gamemode", () => executeTest(modes.droid));
            test("osu!standard gamemode", () => executeTest(modes.osu));
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

describe("Test circle radius", () => {
    const baseRadius = 64;

    test("osu!droid gamemode", () => {
        const circle = createCircle();

        expect(circle.getRadius(modes.droid)).toEqual(baseRadius);

        circle.droidScale = 0.5;

        expect(circle.getRadius(modes.droid)).toBeCloseTo(baseRadius / 2);

        circle.droidScale = 2;

        expect(circle.getRadius(modes.droid)).toBeCloseTo(baseRadius * 2);
    });

    test("osu!standard gamemode", () => {
        const circle = createCircle();

        expect(circle.getRadius(modes.osu)).toEqual(baseRadius);

        circle.osuScale = 0.5;

        expect(circle.getRadius(modes.osu)).toBeCloseTo(baseRadius / 2);

        circle.osuScale = 2;

        expect(circle.getRadius(modes.osu)).toBeCloseTo(baseRadius * 2);
    });
});

test("Test type string", () => {
    const circle = createCircle();

    expect(circle.typeStr()).toBe("circle");
});

test("Test string concatenation", () => {
    const circle = createCircle();

    expect(circle.toString()).toBe("Position: [256, 192]");
});
