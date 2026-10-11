import { Spinner } from "@rian8337/osu-base";
import { DroidDifficultyHitObject } from "../../preprocessing/DroidDifficultyHitObject";

export abstract class DroidSpinnerEvaluator {
    /**
     * Evaluates difficulty of spinning.
     * 
     * @param current The current {@link DroidDifficultyHitObject} to evaluate.
     */
    static evaluateDifficultyOf(current: DroidDifficultyHitObject): number {
        if (!(current.object instanceof Spinner) || current.object.spinsRequired <= 0) {
            return 0;
        }

        const duration = current.object.duration / 1000;
        const rps = current.object.spinsRequired / duration;

        // The longer the spinner the more lenient spinning requirements are.
        return rps / duration;
    }
}