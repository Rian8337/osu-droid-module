import { Spinner } from "@rian8337/osu-base";
import { OsuDifficultyHitObject } from "../../preprocessing/OsuDifficultyHitObject";

/**
 * An evaluator for calculating osu!standard agility aim difficulty.
 */
export abstract class OsuAgilityEvaluator {
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

        const travelDistance = prev?.lazyTravelDistance ?? 0;
        const distance = travelDistance + current.lazyJumpDistance;

        const distanceCap = current.normalizedDiameter * 1.2;
        const distanceScaled = Math.min(distance, distanceCap) / distanceCap;

        let strain = (distanceScaled * 1000) / current.strainTime;

        strain *= Math.pow(current.smallCircleBonus, 1.5);
        strain *= this.highBpmBonus(current.strainTime);

        return strain;
    }

    private static highBpmBonus(ms: number): number {
        return 1 / (1 - Math.pow(0.2, ms / 1000));
    }
}
