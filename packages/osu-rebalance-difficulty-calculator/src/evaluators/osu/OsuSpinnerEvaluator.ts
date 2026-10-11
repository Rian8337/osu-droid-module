import { BeatmapDifficulty, Spinner } from "@rian8337/osu-base";
import { OsuDifficultyHitObject } from "../../preprocessing/OsuDifficultyHitObject";

export abstract class OsuSpinnerEvaluator {
    /**
     * Evaluates difficulty of spinning.
     */
    static evaluateDifficultyOf(current: OsuDifficultyHitObject): number {
        if (!(current.object instanceof Spinner) || current.object.spinsRequired <= 0) {
            return 0;
        }

        // The average RPS required over the length of the spinner to clear the spinner.
        // TODO: I'm not sure why this is using rate-adjusted OD? And the underlying hit window will always be 0 since spinner hit windows are empty. Will ask the pp team.
        const rps = BeatmapDifficulty.difficultyRange(current.overallDifficulty, 90, 150, 225) / 60;

        const duration = current.object.duration / current.clockRate / 1000;

        // The longer the spinner the more lenient spinning requirements are.
        return rps / duration;
    }
}