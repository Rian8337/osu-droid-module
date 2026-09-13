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

        let difficulty = Math.pow(1000 / current.strainTime, 2);

        difficulty *= Math.pow(current.smallCircleBonus, 1.5);

        return difficulty;
    }
}
