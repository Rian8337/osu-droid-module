import {
    DifficultyControlPoint,
    DifficultyControlPointManager,
} from "../../../src";

describe("Test adding control points", () => {
    describe("Without existing control points", () => {
        test("Redundant control point", () => {
            const manager = new DifficultyControlPointManager();

            expect(
                manager.add(
                    new DifficultyControlPoint({
                        time: 1000,
                        speedMultiplier: 1,
                    })
                )
            ).toBe(false);

            expect(manager.points.length).toBe(0);
        });

        test("Not redundant control point", () => {
            const manager = new DifficultyControlPointManager();

            expect(
                manager.add(
                    new DifficultyControlPoint({
                        time: 1000,
                        speedMultiplier: 0.5,
                    })
                )
            ).toBe(true);

            expect(manager.points.length).toBe(1);
            expect(manager.points[0].time).toBe(1000);
            expect(manager.points[0].speedMultiplier).toBe(0.5);
        });

        test("At default control point", () => {
            const manager = new DifficultyControlPointManager();

            expect(
                manager.add(
                    new DifficultyControlPoint({
                        time: 0,
                        speedMultiplier: 0.5,
                    })
                )
            ).toBe(true);

            expect(manager.points.length).toBe(1);
            expect(manager.points[0].time).toBe(0);
            expect(manager.points[0].speedMultiplier).toBe(0.5);
        });
    });

    describe("With an existing control point", () => {
        test("Redundant control point", () => {
            const manager = new DifficultyControlPointManager();

            manager.add(
                new DifficultyControlPoint({
                    time: 1000,
                    speedMultiplier: 0.5,
                })
            );

            expect(
                manager.add(
                    new DifficultyControlPoint({
                        time: 1500,
                        speedMultiplier: 0.5,
                    })
                )
            ).toBe(false);

            expect(manager.points.length).toBe(1);
        });

        test("Before the control point", () => {
            const manager = new DifficultyControlPointManager();

            manager.add(
                new DifficultyControlPoint({
                    time: 1000,
                    speedMultiplier: 0.5,
                })
            );

            expect(
                manager.add(
                    new DifficultyControlPoint({
                        time: 500,
                        speedMultiplier: 0.5,
                    })
                )
            ).toBe(true);

            expect(manager.points.length).toBe(2);

            expect(manager.points[0].time).toBe(500);
            expect(manager.points[0].speedMultiplier).toBe(0.5);

            expect(manager.points[1].time).toBe(1000);
            expect(manager.points[1].speedMultiplier).toBe(0.5);
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

            expect(
                manager.remove(
                    new DifficultyControlPoint({
                        time: 1000,
                        speedMultiplier: 1,
                    })
                )
            ).toBe(false);
        });
    });

    describe("With existing control points", () => {
        test("By index", () => {
            const manager = new DifficultyControlPointManager();

            manager.add(
                new DifficultyControlPoint({
                    time: 1000,
                    speedMultiplier: 0.5,
                })
            );

            manager.add(
                new DifficultyControlPoint({
                    time: 1500,
                    speedMultiplier: 0.75,
                })
            );

            const removed = manager.removeAt(1);

            expect(removed).toBeDefined();
            expect(removed.time).toBe(1500);
            expect(removed.speedMultiplier).toBe(0.75);
        });

        test("By instance", () => {
            const manager = new DifficultyControlPointManager();

            manager.add(
                new DifficultyControlPoint({
                    time: 1000,
                    speedMultiplier: 0.5,
                })
            );

            manager.add(
                new DifficultyControlPoint({
                    time: 1500,
                    speedMultiplier: 0.75,
                })
            );

            expect(
                manager.remove(
                    new DifficultyControlPoint({
                        time: 1500,
                        speedMultiplier: 0.75,
                    })
                )
            ).toBe(true);
        });

        test("Before all control points", () => {
            const manager = new DifficultyControlPointManager();

            manager.add(
                new DifficultyControlPoint({
                    time: 1000,
                    speedMultiplier: 0.5,
                })
            );

            manager.add(
                new DifficultyControlPoint({
                    time: 1500,
                    speedMultiplier: 0.75,
                })
            );

            expect(
                manager.remove(
                    new DifficultyControlPoint({
                        time: 500,
                        speedMultiplier: 0.75,
                    })
                )
            ).toBe(false);
        });
    });
});

test("Test control point getter", () => {
    const manager = new DifficultyControlPointManager();

    manager.add(
        new DifficultyControlPoint({
            time: 1000,
            speedMultiplier: 0.9,
        })
    );

    let timingPoint = manager.controlPointAt(0);

    expect(timingPoint.time).toBe(0);

    timingPoint = manager.controlPointAt(3000);

    expect(timingPoint.time).toBe(1000);

    timingPoint = manager.controlPointAt(7000);

    expect(timingPoint.time).toBe(1000);

    expect(
        manager.add(
            new DifficultyControlPoint({
                time: 5000,
                speedMultiplier: 0.5,
            })
        )
    ).toBe(true);

    timingPoint = manager.controlPointAt(7000);

    expect(timingPoint.time).toBe(5000);
});
