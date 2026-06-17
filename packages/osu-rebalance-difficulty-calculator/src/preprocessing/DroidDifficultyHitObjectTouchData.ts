import { DroidDifficultyHitObject } from "./DroidDifficultyHitObject";
import { DroidTouchAction } from "./DroidTouchAction";
import { DroidTouchHand } from "./DroidTouchHand";

export interface DroidDifficultyHitObjectTouchData {
    readonly action: DroidTouchAction;
    readonly aimingHand: DroidTouchHand;
    readonly prevAction: DroidTouchAction | null;
    readonly prevAimingHand: DroidTouchHand | null;

    /**
     * A synthetic {@link DroidDifficultyHitObject} built from the objects hit using the same {@link aimingHand}.
     * Null when there is no prior object hit with this {@link aimingHand}.
     */
    readonly perHandObject: DroidDifficultyHitObject | null;

    /**
     * A factor in [0, 1] representing how much the other hand physically obstructs the {@link aimingHand}'s
     * path to this object.
     */
    readonly obstructionFactor: number;
}
