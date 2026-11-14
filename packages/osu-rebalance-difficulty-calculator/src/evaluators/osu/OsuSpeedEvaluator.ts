import { MathUtils, Spinner } from "@rian8337/osu-base";
import { OsuDifficultyHitObject } from "../../preprocessing/OsuDifficultyHitObject";

/**
 * An evaluator for calculating osu!standard speed skill.
 */
export abstract class OsuSpeedEvaluator {
    // ~200 1/4 BPM streams
    private static readonly minSpeedBonus = 200;
    private static readonly deltaInfluenceOnDoubletaps = 0.2;

    /**
     * Evaluates the difficulty of tapping the current object, based on:
     *
     * - time between pressing the previous and current object,
     * - and how easily they can be cheesed.
     *
     * @param current The current object.
     */
    static evaluateDifficultyOf(current: OsuDifficultyHitObject): number {
        if (current.object instanceof Spinner && current.object.spinsRequired <= 0) {
            return 0;
        }

        const next = current.next(0);
        let deltaTime = current.strainTime;

        if (next) {
            // If the current and next object are a doubletappable double, then we want
            // to partially combine their delta times to treat it as a single press.
            const doubletapness = current.getDoubletapness(next);

            deltaTime += next.strainTime * doubletapness * this.deltaInfluenceOnDoubletaps;
        }

        return (
            MathUtils.millisecondsToBPM(deltaTime) *
            this.calculateSpeedBonus(deltaTime)
        );
    }

    private static calculateSpeedBonus(deltaTime: number): number {
        // speedBonus will be 0.0 for BPM < 200
        let speedBonus = 0;

        // Add additional scaling bonus for streams/bursts higher than 200bpm
        if (MathUtils.millisecondsToBPM(deltaTime) > this.minSpeedBonus) {
            speedBonus =
                0.75 *
                Math.pow(
                    (MathUtils.bpmToMilliseconds(this.minSpeedBonus) -
                        deltaTime) /
                        40,
                    2,
                );
        }

        return (1 + speedBonus) / deltaTime;
    }
}
