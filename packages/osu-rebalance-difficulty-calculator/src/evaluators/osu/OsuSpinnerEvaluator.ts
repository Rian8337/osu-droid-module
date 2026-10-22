import { Spinner } from "@rian8337/osu-base";
import { OsuDifficultyHitObject } from "../../preprocessing/OsuDifficultyHitObject";

export abstract class OsuSpinnerEvaluator {
    /**
     * Evaluates difficulty of spinning.
     */
    static evaluateDifficultyOf(current: OsuDifficultyHitObject): number {
        if (!(current.object instanceof Spinner) || current.object.spinsRequired <= 0) {
            return 0;
        }

        // This duration is *not* rate scaled because spinners work by applying rates on rotations.
        // This means spinning difficulty remains constant for a spinner, regardless of the applied rate.
        const duration = current.object.duration / 1000;

        const rps = current.object.spinsRequired / duration;

        // The longer the spinner the more lenient spinning requirements are.
        return rps / duration;
    }
}