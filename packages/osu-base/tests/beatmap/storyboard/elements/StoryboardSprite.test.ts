import { Anchor, Easing, StoryboardSprite, Vector2 } from "../../../../src";

const createSprite = () =>
    new StoryboardSprite("sprite", Anchor.bottomCenter, new Vector2(50));

test("Test adding loop command", () => {
    const sprite = createSprite();

    const loop = sprite.addLoop(1000, 0);

    expect(sprite.loops.length).toBe(1);

    expect(loop.loopStartTime).toBe(1000);
    expect(loop.totalIterations).toBe(1);
});

test("Test adding trigger command", () => {
    const sprite = createSprite();

    const trigger = sprite.addTrigger("trigger", 250, 1000, 0);

    expect(sprite.triggers.length).toBe(1);

    expect(trigger.triggerStartTime).toBe(250);
    expect(trigger.triggerEndTime).toBe(1000);
    expect(trigger.groupNumber).toBe(0);
});

describe("Test has commands", () => {
    test("From timeline group", () => {
        const sprite = createSprite();

        expect(sprite.hasCommands).toBe(false);

        sprite.timelineGroup.x.add(Easing.in, 0, 1000, 0, 1);

        expect(sprite.hasCommands).toBe(true);
    });

    test("From loop command", () => {
        const sprite = createSprite();

        expect(sprite.hasCommands).toBe(false);

        const loop = sprite.addLoop(1000, 1);

        expect(sprite.hasCommands).toBe(false);

        loop.x.add(Easing.in, 0, 1000, 0, 1);

        expect(sprite.hasCommands).toBe(true);
    });
});

describe("Test start time", () => {
    describe("With timeline group", () => {
        test("Without alpha command", () => {
            const sprite = createSprite();

            sprite.timelineGroup.x.add(Easing.in, 500, 1000, 0, 1);

            expect(sprite.startTime).toBe(500);

            sprite.timelineGroup.y.add(Easing.in, 250, 1000, 0, 1);

            expect(sprite.startTime).toBe(250);
        });

        test("With alpha command", () => {
            const sprite = createSprite();

            sprite.timelineGroup.x.add(Easing.in, 500, 1000, 0, 1);

            expect(sprite.startTime).toBe(500);

            sprite.timelineGroup.alpha.add(Easing.in, 750, 1000, 0, 1);

            expect(sprite.startTime).toBe(750);
        });
    });

    describe("With loop command", () => {
        test("Without alpha command", () => {
            const sprite = createSprite();

            const loop = sprite.addLoop(1000, 1);

            loop.x.add(Easing.in, 500, 1000, 0, 1);

            expect(sprite.startTime).toBe(1500);

            loop.y.add(Easing.in, 250, 1000, 0, 1);

            expect(sprite.startTime).toBe(1250);
        });

        test("With alpha command", () => {
            const sprite = createSprite();

            const loop = sprite.addLoop(1000, 1);

            loop.x.add(Easing.in, 500, 1000, 0, 1);

            expect(sprite.startTime).toBe(1500);

            loop.alpha.add(Easing.in, 750, 1000, 0, 1);

            expect(sprite.startTime).toBe(1750);
        });
    });
});

describe("Test end time", () => {
    test("With timeline group", () => {
        const sprite = createSprite();

        sprite.timelineGroup.x.add(Easing.in, 500, 1000, 0, 1);

        expect(sprite.endTime).toBe(1000);

        sprite.timelineGroup.y.add(Easing.in, 1250, 1500, 0, 1);

        expect(sprite.endTime).toBe(1500);
    });

    test("With loop command", () => {
        const sprite = createSprite();

        const loop = sprite.addLoop(1000, 1);

        loop.x.add(Easing.in, 500, 1000, 0, 1);

        expect(sprite.endTime).toBe(2500);

        loop.y.add(Easing.in, 1250, 1500, 0, 1);

        expect(sprite.endTime).toBe(3500);
    });
});

test("Test string concatenation", () => {
    const sprite = createSprite();

    expect(sprite.toString()).toBe(
        `sprite, ${Anchor.bottomCenter}, ${new Vector2(50).toString()}`,
    );
});
