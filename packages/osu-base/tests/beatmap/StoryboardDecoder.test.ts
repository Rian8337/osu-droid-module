import { readFileSync } from "fs";
import { join } from "path";
import {
    Anchor,
    AnimationLoopType,
    Storyboard,
    StoryboardAnimation,
    StoryboardDecoder,
    StoryboardLayerType,
    StoryboardSample,
    StoryboardSprite,
    Vector2,
} from "../../src";

const getStoryboard = (path: string): Storyboard => {
    return new StoryboardDecoder().decode(
        readFileSync(join(process.cwd(), "tests", "files", path), {
            encoding: "utf8",
        })
    ).result;
};

describe("Test decode storyboard events", () => {
    const storyboard = getStoryboard(
        join(
            "beatmaps",
            "Himeringo - Yotsuya-san ni Yoroshiku (RLC) [Winber1's Extreme].osu"
        )
    );

    const background = storyboard.getLayer(StoryboardLayerType.background);

    test("Test storyboard use skin sprites", () => {
        expect(storyboard.useSkinSprites).toBe(false);
    });

    test("Test layer count", () => {
        expect(Object.keys(storyboard.layers).length).toBe(5);
    });

    test("Test background layer", () => {
        expect(background.depth).toBe(3);
        expect(background.elements.length).toBe(16);
        expect(background.visibleWhenFailing).toBe(true);
        expect(background.visibleWhenPassing).toBe(true);
        expect(background.name).toBe("Background");
    });

    test("Test fail layer", () => {
        const fail = storyboard.getLayer(StoryboardLayerType.fail);

        expect(fail.depth).toBe(2);
        expect(fail.elements.length).toBe(0);
        expect(fail.visibleWhenFailing).toBe(true);
        expect(fail.visibleWhenPassing).toBe(false);
        expect(fail.name).toBe("Fail");
    });

    test("Test pass layer", () => {
        const pass = storyboard.getLayer(StoryboardLayerType.pass);

        expect(pass.depth).toBe(1);
        expect(pass.elements.length).toBe(0);
        expect(pass.visibleWhenFailing).toBe(false);
        expect(pass.visibleWhenPassing).toBe(true);
        expect(pass.name).toBe("Pass");
    });

    test("Test foreground layer", () => {
        const foreground = storyboard.getLayer(StoryboardLayerType.foreground);

        expect(foreground.depth).toBe(0);
        expect(foreground.elements.length).toBe(151);
        expect(foreground.visibleWhenFailing).toBe(true);
        expect(foreground.visibleWhenPassing).toBe(true);
        expect(foreground.name).toBe("Foreground");
    });

    test("Test overlay layer", () => {
        const overlay = storyboard.getLayer(StoryboardLayerType.overlay);

        expect(overlay.depth).toBe(Number.MIN_SAFE_INTEGER);
        expect(overlay.elements.length).toBe(0);
        expect(overlay.visibleWhenFailing).toBe(true);
        expect(overlay.visibleWhenPassing).toBe(true);
        expect(overlay.name).toBe("Overlay");
    });

    test("Test element count", () => {
        const spriteCount = background.elements.filter(
            (x) =>
                x instanceof StoryboardSprite &&
                !(x instanceof StoryboardAnimation)
        ).length;
        const animationCount = background.elements.filter(
            (x) => x instanceof StoryboardAnimation
        ).length;
        const sampleCount = background.elements.filter(
            (x) => x instanceof StoryboardSample
        ).length;

        expect(spriteCount).toBe(15);
        expect(animationCount).toBe(1);
        expect(sampleCount).toBe(0);
        expect(background.elements.length).toBe(
            spriteCount + animationCount + sampleCount
        );
    });

    test("Test sprite", () => {
        const sprite = <StoryboardSprite>background.elements[0];

        expect(sprite).not.toBeUndefined();
        expect(sprite.hasCommands).toBe(true);
        expect(sprite.initialPosition).toEqual(new Vector2(320, 240));
        expect(sprite.origin).toBe(Anchor.center);
        expect(sprite.path).toBe("SB\\lyric\\ja-21.png");
    });

    test("Test animation", () => {
        const animation = <StoryboardAnimation>(
            background.elements.find((x) => x instanceof StoryboardAnimation)
        );

        expect(animation).not.toBeUndefined();
        expect(animation.endTime).toBe(141175);
        expect(animation.frameCount).toBe(10);
        expect(animation.frameDelay).toBe(30);
        expect(animation.hasCommands).toBe(true);
        expect(animation.initialPosition).toEqual(new Vector2(320, 240));
        expect(animation.loopType).toBe(AnimationLoopType.loopForever);
        expect(animation.origin).toBe(Anchor.center);
        expect(animation.path).toBe("SB\\red jitter\\red_0000.jpg");
        expect(animation.startTime).toBe(78993);
    });
});

test("Test out of order start times", () => {
    const storyboard = getStoryboard(
        join("storyboards", "out-of-order-starttimes.osb")
    );

    const background = storyboard.getLayer(StoryboardLayerType.background);

    expect(background.elements.length).toBe(2);

    expect(background.elements[0].startTime).toBe(1500);
    expect(background.elements[1].startTime).toBe(1000);

    expect(storyboard.earliestEventTime).toBe(1000);
});

test("Test decode variable with suffix", () => {
    const storyboard = getStoryboard(
        join("storyboards", "variable-with-suffix.osb")
    );

    const background = storyboard.getLayer(StoryboardLayerType.background);

    expect((<StoryboardSprite>background.elements[0]).initialPosition.x).toBe(
        3456
    );
});

test("Test decode out of range loop animation type", () => {
    const storyboard = getStoryboard(
        join("storyboards", "animation-types.osb")
    );

    const foreground = storyboard.getLayer(StoryboardLayerType.foreground);

    expect((<StoryboardAnimation>foreground.elements[0]).loopType).toBe(
        AnimationLoopType.loopForever
    );
    expect((<StoryboardAnimation>foreground.elements[1]).loopType).toBe(
        AnimationLoopType.loopOnce
    );
    expect((<StoryboardAnimation>foreground.elements[2]).loopType).toBe(
        AnimationLoopType.loopForever
    );
    expect((<StoryboardAnimation>foreground.elements[3]).loopType).toBe(
        AnimationLoopType.loopOnce
    );
    expect((<StoryboardAnimation>foreground.elements[4]).loopType).toBe(
        AnimationLoopType.loopForever
    );
    expect((<StoryboardAnimation>foreground.elements[5]).loopType).toBe(
        AnimationLoopType.loopForever
    );
});

test("Test decode loop count", () => {
    const storyboard = getStoryboard(join("storyboards", "loop-count.osb"));

    // All loop sequences in loop-count.osb have a total duration of 2000ms (fade in 0->1000ms, fade out 1000->2000ms).
    const loopDuration = 2000;

    const background = storyboard.getLayer(StoryboardLayerType.background);

    // Stable ensures that any loop command executes at least once, even if the loop count specified in the .osb is zero or negative.
    const zeroTimes = <StoryboardSprite>(
        background.elements.find((s) => s.path === "zero-times.png")
    );
    expect(zeroTimes.endTime).toBe(1000 + loopDuration);

    const oneTime = <StoryboardSprite>(
        background.elements.find((s) => s.path === "one-time.png")
    );
    expect(oneTime.endTime).toBe(4000 + loopDuration);

    const manyTimes = <StoryboardSprite>(
        background.elements.find((s) => s.path === "many-times.png")
    );
    expect(manyTimes.endTime).toBe(9000 + 40 * loopDuration);
});

test("Test earliest start time with loop alphas", () => {
    const storyboard = getStoryboard(
        join("storyboards", "loop-containing-earlier-non-zero-fade.osb")
    );

    const background = storyboard.getLayer(StoryboardLayerType.background);
    expect(background.elements.length).toBe(2);

    expect(background.elements[0].startTime).toBe(1000);
    expect(background.elements[1].startTime).toBe(1000);

    expect(storyboard.earliestEventTime).toBe(1000);
});
