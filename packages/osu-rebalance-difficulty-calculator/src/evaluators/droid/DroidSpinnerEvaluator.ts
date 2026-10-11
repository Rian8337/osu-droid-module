import { Spinner } from "@rian8337/osu-base";
import { DroidDifficultyHitObject } from "../../preprocessing/DroidDifficultyHitObject";

export abstract class DroidSpinnerEvaluator {
    /**
     * Evaluates difficulty of spinning.
     * 
     * @param current The current {@link DroidDifficultyHitObject} to evaluate.
     * @param overallDifficulty The non-rate adjusted overall difficulty of the beatmap.
     */
    static evaluateDifficultyOf(current: DroidDifficultyHitObject, overallDifficulty: number): number {
        if (!(current.object instanceof Spinner) || current.object.spinsRequired <= 0) {
            return 0;
        }

        // The average RPS required over the length of the spinner to clear the spinner.
        const rps = 2 + (2 * overallDifficulty) / 10;
        const duration = current.object.duration / 1000;

        // The longer the spinner the more lenient spinning requirements are.
        return rps / duration;
    }
}