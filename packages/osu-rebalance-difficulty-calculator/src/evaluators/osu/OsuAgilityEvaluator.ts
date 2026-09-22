import { MathUtils, Spinner } from "@rian8337/osu-base";
import { OsuDifficultyHitObject } from "../../preprocessing/OsuDifficultyHitObject";

/**
 * An evaluator for calculating osu!standard agility aim difficulty.
 */
export abstract class OsuAgilityEvaluator {
    private static readonly previousDeltaInfluence = 0.5;

    /**
     * Evaluates the difficulty of fast aiming the current object.
     *
     * @param current The current object.
     */
    static evaluateDifficultyOf(current: OsuDifficultyHitObject): number {
        if (current.object instanceof Spinner) {
            return 0;
        }

        const prev = current.previous(0);

        // For objects that are stacked, we want to reduce the agility difficulty slightly by combining delta times
        // of both objects together because we can assume that they likely would be done in one movement.
        let previousDelta = 0;

        if (prev !== null) {
            previousDelta = prev.strainTime * MathUtils.reverseLerp(prev.lazyJumpDistance, prev.normalizedRadius, 0);
        }

        const combinedDelta = current.strainTime + previousDelta * this.previousDeltaInfluence;

        let difficulty = Math.pow(1000 / combinedDelta, 2);

        difficulty *= Math.pow(current.smallCircleBonus, 1.5);

        return difficulty;
    }
}
