import {
    Anchor,
    Easing,
    Storyboard,
    StoryboardLayerType,
    StoryboardSprite,
    Vector2,
} from "../../src";

describe("Test event time getters", () => {
    test("Without elements", () => {
        const storyboard = new Storyboard();

        expect(storyboard.earliestEventTime).toBeNull();
        expect(storyboard.latestEventTime).toBeNull();
    });

    test("With 2 elements", () => {
        const storyboard = new Storyboard();

        const sprite1 = new StoryboardSprite(
            "test.png",
            Anchor.BottomCenter,
            new Vector2(0, 0),
        );

        sprite1.timelineGroup.x.add(Easing.In, 1000, 2000, 0, 1);

        const sprite2 = new StoryboardSprite(
            "test.png",
            Anchor.BottomCenter,
            new Vector2(0, 0),
        );

        sprite1.timelineGroup.x.add(Easing.In, 1500, 2500, 0, 1);

        storyboard
            .getLayer(StoryboardLayerType.Background)
            .elements.push(sprite1, sprite2);

        expect(storyboard.earliestEventTime).toBe(1000);
        expect(storyboard.latestEventTime).toBe(2500);
    });
});

describe("Test layer retrieval", () => {
    test("Without layer creation", () => {
        const storyboard = new Storyboard();

        delete storyboard.layers.Background;

        expect(
            storyboard.getLayer(StoryboardLayerType.Background, false),
        ).toBeNull();
    });

    test("With layer creation", () => {
        const storyboard = new Storyboard();

        delete storyboard.layers.Background;

        expect(
            storyboard.getLayer(StoryboardLayerType.Background),
        ).not.toBeNull();
    });
});
