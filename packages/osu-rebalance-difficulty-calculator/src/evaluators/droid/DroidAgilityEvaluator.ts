import { HitResult, Interpolation, MathUtils, Spinner } from "@rian8337/osu-base";
import { DroidDifficultyHitObject } from "../../preprocessing/DroidDifficultyHitObject";
import { DroidSnapAimEvaluator } from "./DroidSnapAimEvaluator";

/**
 * An evaluator for calculating osu!droid agility aim difficulty.
 */
export abstract class DroidAgilityEvaluator {
    private static readonly previousDeltaInfluence = 0.5;
    private static readonly angleSwitchingBonus = 0.8;

/**
     * Evaluates the difficulty of fast aiming the current object.
     *
     * @param current The current object.
     */
    static evaluateDifficultyOf(current: DroidDifficultyHitObject): number {
        if (current.object instanceof Spinner) {
            return 0;
        }

        const prev = current.previous(0);

        // Assume that the player always uses at least the full great hitwindow for the movement.
        const currentDelta = Math.max(current.strainTime, current.hitWindowFor(HitResult.Great));

        // For objects that are stacked, we want to reduce the agility difficulty slightly by combining delta times
        // of both objects together because we can assume that they likely would be done in one movement.
        let previousDelta = 0;

        if (prev !== null) {
            previousDelta = prev.strainTime * MathUtils.reverseLerp(prev.lazyJumpDistance, prev.normalizedRadius, 0);
        }

        const combinedDelta = currentDelta + previousDelta * this.previousDeltaInfluence;
        const angleSwitchingBonus = this.calculateAngleSwitchingBonus(current, prev);

        let difficulty = (1 + angleSwitchingBonus) * 10_000_000 / Math.pow(combinedDelta, 3.1);

        difficulty *= current.smallCircleBonus;

        return difficulty;
    }

    private static calculateAngleSwitchingBonus(
        current: DroidDifficultyHitObject,
        prev: DroidDifficultyHitObject | null
    ): number {
        if (current.angle === null || typeof prev?.angle !== "number") {
            return 0;
        }

        const acutenessDifference = 1 - Math.min(
            DroidSnapAimEvaluator.calculateAcuteAngleAcuteness(current.angle),
            Math.pow(DroidSnapAimEvaluator.calculateAcuteAngleAcuteness(prev.angle), 3),
        );

        const rhythmDifferencePenalty = Math.pow(
            Math.min(current.strainTime, prev.strainTime) / Math.max(current.strainTime, prev.strainTime),
            3,
        );

        return (
            acutenessDifference *
            rhythmDifferencePenalty *
            Interpolation.reverseLerp(prev.lazyJumpDistance, prev.normalizedRadius, prev.normalizedDiameter) *
            this.angleSwitchingBonus
        );
    }
}
