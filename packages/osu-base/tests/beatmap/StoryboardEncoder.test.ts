import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import {
    StoryboardAnimation,
    StoryboardDecoder,
    StoryboardEncoder,
    StoryboardLayerType,
    StoryboardSample,
    StoryboardSprite,
} from "../../src";

const decoder = new StoryboardDecoder().decode(
    readFileSync(
        join(
            process.cwd(),
            "tests",
            "files",
            "beatmaps",
            "Himeringo - Yotsuya-san ni Yoroshiku (RLC) [Winber1's Extreme].osu",
        ),
        {
            encoding: "utf8",
        },
    ),
);

const encoder = new StoryboardEncoder(decoder.result).encode();

writeFileSync(
    join(process.cwd(), "tests", "files", "storyboards", "testStoryboard.osb"),
    encoder.result,
    { encoding: "utf8" },
);

const original = decoder.result;
const encoded = new StoryboardDecoder().decode(encoder.result).result;

const originalBackground = original.getLayer(StoryboardLayerType.background);
const encodedBackground = encoded.getLayer(StoryboardLayerType.background);

test("Test layer count", () => {
    expect(Object.keys(encoded.layers).length).toBe(
        Object.keys(original.layers).length,
    );
});

test("Test background layer equality", () => {
    expect(encodedBackground.depth).toBe(originalBackground.depth);
    expect(encodedBackground.elements.length).toBe(
        originalBackground.elements.length,
    );
    expect(encodedBackground.visibleWhenFailing).toBe(
        originalBackground.visibleWhenFailing,
    );
    expect(encodedBackground.visibleWhenPassing).toBe(
        originalBackground.visibleWhenFailing,
    );
    expect(encodedBackground.name).toBe(originalBackground.name);
});

test("Test fail layer equality", () => {
    const originalFail = original.getLayer(StoryboardLayerType.fail);
    const encodedFail = encoded.getLayer(StoryboardLayerType.fail);

    expect(encodedFail.depth).toBe(originalFail.depth);
    expect(encodedFail.elements.length).toBe(originalFail.elements.length);
    expect(encodedFail.visibleWhenFailing).toBe(
        originalFail.visibleWhenFailing,
    );
    expect(encodedFail.visibleWhenPassing).toBe(
        originalFail.visibleWhenPassing,
    );
    expect(encodedFail.name).toBe(originalFail.name);
});

test("Test pass layer equality", () => {
    const originalPass = original.getLayer(StoryboardLayerType.pass);
    const encodedPass = encoded.getLayer(StoryboardLayerType.pass);

    expect(encodedPass.depth).toBe(originalPass.depth);
    expect(encodedPass.elements.length).toBe(originalPass.elements.length);
    expect(encodedPass.visibleWhenFailing).toBe(
        originalPass.visibleWhenFailing,
    );
    expect(encodedPass.visibleWhenPassing).toBe(
        originalPass.visibleWhenPassing,
    );
    expect(encodedPass.name).toBe(originalPass.name);
});

test("Test foreground layer equality", () => {
    const originalForeground = original.getLayer(
        StoryboardLayerType.foreground,
    );
    const encodedForeground = encoded.getLayer(StoryboardLayerType.foreground);

    expect(encodedForeground.depth).toBe(originalForeground.depth);
    expect(encodedForeground.elements.length).toBe(
        originalForeground.elements.length,
    );
    expect(encodedForeground.visibleWhenFailing).toBe(
        originalForeground.visibleWhenFailing,
    );
    expect(encodedForeground.visibleWhenPassing).toBe(
        originalForeground.visibleWhenPassing,
    );
    expect(encodedForeground.name).toBe(originalForeground.name);
});

test("Test overlay equality", () => {
    const originalOverlay = original.getLayer(StoryboardLayerType.overlay);
    const encodedOverlay = encoded.getLayer(StoryboardLayerType.overlay);
    expect(encodedOverlay.depth).toBe(originalOverlay.depth);
    expect(encodedOverlay.elements.length).toBe(
        originalOverlay.elements.length,
    );
    expect(encodedOverlay.visibleWhenFailing).toBe(
        originalOverlay.visibleWhenFailing,
    );
    expect(encodedOverlay.visibleWhenPassing).toBe(
        originalOverlay.visibleWhenPassing,
    );
    expect(encodedOverlay.name).toBe(originalOverlay.name);
});

test("Test element count equality", () => {
    const originalSpriteCount = originalBackground.elements.filter(
        (x) =>
            x instanceof StoryboardSprite &&
            !(x instanceof StoryboardAnimation),
    ).length;
    const originalAnimationCount = originalBackground.elements.filter(
        (x) => x instanceof StoryboardAnimation,
    ).length;
    const originalSampleCount = originalBackground.elements.filter(
        (x) => x instanceof StoryboardSample,
    ).length;

    const encodedSpriteCount = encodedBackground.elements.filter(
        (x) =>
            x instanceof StoryboardSprite &&
            !(x instanceof StoryboardAnimation),
    ).length;
    const encodedAnimationCount = encodedBackground.elements.filter(
        (x) => x instanceof StoryboardAnimation,
    ).length;
    const encodedSampleCount = encodedBackground.elements.filter(
        (x) => x instanceof StoryboardSample,
    ).length;

    expect(encodedSpriteCount).toBe(originalSpriteCount);
    expect(encodedAnimationCount).toBe(originalAnimationCount);
    expect(encodedSampleCount).toBe(originalSampleCount);
    expect(encodedBackground.elements.length).toBe(
        encodedSpriteCount + encodedAnimationCount + encodedSampleCount,
    );
});

test("Test sprite equality", () => {
    const originalSprite = originalBackground.elements[0] as StoryboardSprite;
    const encodedSprite = encodedBackground.elements[0] as StoryboardSprite;

    expect(encodedSprite).toBeDefined();
    expect(encodedSprite.hasCommands).toBe(originalSprite.hasCommands);
    expect(encodedSprite.initialPosition).toEqual(
        originalSprite.initialPosition,
    );
    expect(encodedSprite.origin).toBe(originalSprite.origin);
    expect(encodedSprite.path).toBe(originalSprite.path);
});

test("Test animation equality", () => {
    const originalAnimation = originalBackground.elements.find(
        (x) => x instanceof StoryboardAnimation,
    )!;
    const encodedAnimation = encodedBackground.elements.find(
        (x) => x instanceof StoryboardAnimation,
    )!;

    expect(encodedAnimation).toBeDefined();
    expect(encodedAnimation.endTime).toBe(originalAnimation.endTime);
    expect(encodedAnimation.frameCount).toBe(originalAnimation.frameCount);
    expect(encodedAnimation.frameDelay).toBe(originalAnimation.frameDelay);
    expect(encodedAnimation.hasCommands).toBe(originalAnimation.hasCommands);
    expect(encodedAnimation.initialPosition).toEqual(
        originalAnimation.initialPosition,
    );
    expect(encodedAnimation.loopType).toBe(originalAnimation.loopType);
    expect(encodedAnimation.origin).toBe(originalAnimation.origin);
    expect(encodedAnimation.path).toBe(originalAnimation.path);
    expect(encodedAnimation.startTime).toBe(originalAnimation.startTime);
});
