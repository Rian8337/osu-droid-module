import { Anchor } from "../../../constants/Anchor";
import { Vector2 } from "../../../mathutil/Vector2";
import { AnimationLoopType } from "../enums/AnimationLoopType";
import { StoryboardSprite } from "./StoryboardSprite";

/**
 * Represents a storyboard's animation.
 */
export class StoryboardAnimation extends StoryboardSprite {
    /**
     * The amount of frames that the animation has.
     */
    frameCount: number;

    /**
     * The delay between frames, in milliseconds.
     */
    frameDelay: number;

    /**
     * The loop type of the animation.
     */
    loopType: AnimationLoopType;

    constructor(
        path: string,
        origin: Anchor,
        initialPosition: Vector2,
        frameCount: number,
        frameDelay: number,
        loopType: AnimationLoopType
    ) {
        super(path, origin, initialPosition);

        this.frameCount = frameCount;
        this.frameDelay = frameDelay;
        this.loopType = loopType;
    }
}
