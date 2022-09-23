import {
    DifficultyControlPoint,
    DifficultyControlPointManager,
} from "../../../src";

const createControlPoint = (
    time: number = 1000,
    speedMultiplier: number = 0.5
) =>
    new DifficultyControlPoint({
        time: time,
        speedMultiplier: speedMultiplier,
        generateTicks: true,
    });

describe("Test adding control points", () => {
    describe("Without existing control points", () => {
        test("Redundant control point", () => {
            const manager = new DifficultyControlPointManager();

            expect(manager.add(createControlPoint(undefined, 1))).toBe(false);
            expect(manager.points.length).toBe(0);
        });

        test("Not redundant control point", () => {
            const manager = new DifficultyControlPointManager();

            expect(manager.add(createControlPoint())).toBe(true);

            expect(manager.points.length).toBe(1);
            expect(manager.points[0].time).toBe(1000);
            expect(manager.points[0].speedMultiplier).toBe(0.5);
        });

        test("At default control point", () => {
            const manager = new DifficultyControlPointManager();

            expect(manager.add(createControlPoint(0))).toBe(true);

            expect(manager.points.length).toBe(1);
            expect(manager.points[0].time).toBe(0);
            expect(manager.points[0].speedMultiplier).toBe(0.5);
        });
    });

    describe("With 1 existing control point", () => {
        const createManager = () => {
            const manager = new DifficultyControlPointManager();

            manager.add(createControlPoint());

            return manager;
        };

        test("Redundant control point", () => {
            const manager = createManager();

            expect(manager.add(createControlPoint(1500))).toBe(false);

            expect(manager.points.length).toBe(1);
        });

        test("Before the control point", () => {
            const manager = createManager();

            expect(manager.add(createControlPoint(500))).toBe(true);

            expect(manager.points.length).toBe(2);

            expect(manager.points[0].time).toBe(500);
            expect(manager.points[0].speedMultiplier).toBe(0.5);

            expect(manager.points[1].time).toBe(1000);
            expect(manager.points[1].speedMultiplier).toBe(0.5);
        });
    });

    describe("With 2 existing control points", () => {
        const createManager = () => {
            const manager = new DifficultyControlPointManager();

            manager.add(createControlPoint());
            manager.add(createControlPoint(1500, 0.75));

            return manager;
        };

        test("Before both", () => {
            const manager = createManager();

            expect(manager.add(createControlPoint(500, 0.8))).toBe(true);

            expect(manager.points.length).toBe(3);

            expect(manager.points[0].time).toBe(500);
            expect(manager.points[0].speedMultiplier).toBe(0.8);
        });

        test("Between both", () => {
            const manager = createManager();

            expect(manager.add(createControlPoint(1250, 1))).toBe(true);

            expect(manager.points.length).toBe(3);

            expect(manager.points[1].time).toBe(1250);
            expect(manager.points[1].speedMultiplier).toBe(1);
        });

        test("After both", () => {
            const manager = createManager();

            expect(manager.add(createControlPoint(2000, 1))).toBe(true);

            expect(manager.points.length).toBe(3);

            expect(manager.points[2].time).toBe(2000);
            expect(manager.points[2].speedMultiplier).toBe(1);
        });
    });
});

describe("Test removing control points", () => {
    describe("Without existing control points", () => {
        test("By index", () => {
            const manager = new DifficultyControlPointManager();

            expect(manager.removeAt(0)).toBeUndefined();
        });

        test("By instance", () => {
            const manager = new DifficultyControlPointManager();

            expect(manager.remove(createControlPoint(undefined, 1))).toBe(
                false
            );
        });
    });

    describe("With existing control points", () => {
        test("By index", () => {
            const manager = new DifficultyControlPointManager();

            manager.add(createControlPoint());

            manager.add(createControlPoint(1500, 0.75));

            const removed = manager.removeAt(1);

            expect(removed).toBeDefined();
            expect(removed.time).toBe(1500);
            expect(removed.speedMultiplier).toBe(0.75);
        });

        test("By instance", () => {
            const manager = new DifficultyControlPointManager();

            manager.add(createControlPoint());

            manager.add(createControlPoint(1500, 0.75));

            expect(manager.remove(createControlPoint(1500, 0.75))).toBe(true);
        });

        test("Before all control points", () => {
            const manager = new DifficultyControlPointManager();

            manager.add(createControlPoint());

            manager.add(createControlPoint(1500, 0.75));

            expect(manager.remove(createControlPoint(500, 0.75))).toBe(false);
        });
    });
});

test("Test control point getter", () => {
    const manager = new DifficultyControlPointManager();

    manager.add(createControlPoint(undefined, 0.9));

    let timingPoint = manager.controlPointAt(0);

    expect(timingPoint.time).toBe(0);

    timingPoint = manager.controlPointAt(3000);

    expect(timingPoint.time).toBe(1000);

    timingPoint = manager.controlPointAt(7000);

    expect(timingPoint.time).toBe(1000);

    expect(manager.add(createControlPoint(5000))).toBe(true);

    timingPoint = manager.controlPointAt(7000);

    expect(timingPoint.time).toBe(5000);
});
