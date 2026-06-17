import { DroidDifficultyHitObject } from "./DroidDifficultyHitObject";
import { DroidTouchAction } from "./DroidTouchAction";
import { DroidTouchHand } from "./DroidTouchHand";

/**
 * Raw difficulty values computed directly from a per-hand object's geometry, before touch multipliers
 * (hand coordination, drag transition, obstruction) are applied. Pre-computed by the beam-search
 * optimizer so each per-hand object is evaluated only once across the three action branches.
 */
export interface CachedRawAimValues {
    readonly snapNoSliders: number;
    readonly snapWithSliders: number;
    readonly flowNoSliders: number;
    readonly flowWithSliders: number;
    readonly agility: number;
}

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

    /**
     * Pre-computed raw aim evaluator values for {@link perHandObject}.
     * When present, touch evaluators use these directly instead of re-evaluating the per-hand object.
     * Only populated during beam-search optimization; absent during the actual skill processing pass.
     */
    readonly cachedRawAim?: CachedRawAimValues;
}
