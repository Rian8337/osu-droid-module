import { MathUtils, Spinner } from "@rian8337/osu-base";
import { DroidDifficultyHitObject } from "../../preprocessing/DroidDifficultyHitObject";

/**
 * An evaluator for calculating osu!droid agility aim difficulty.
 */
export abstract class DroidAgilityEvaluator {
    private static readonly distanceCap =
        DroidDifficultyHitObject.normalizedDiameter * 1.25; // 1.25 circle distance between centers.

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

        const travelDistance = prev?.lazyTravelDistance ?? 0;
        const distance = travelDistance + current.lazyJumpDistance;

        const distanceScaled =
            Math.min(distance, this.distanceCap) / this.distanceCap;

        let strain = (distanceScaled * 1000) / current.strainTime;

        strain *= this.highBpmBonus(current.strainTime);

        return (
            strain *
            MathUtils.smootherstep(
                distance,
                0,
                DroidDifficultyHitObject.normalizedRadius,
            )
        );
    }

    private static highBpmBonus(ms: number): number {
        return 1 / (1 - Math.pow(0.3, Math.pow(ms / 1000, 0.9)));
    }
}
