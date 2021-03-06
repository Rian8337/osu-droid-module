import { Spinner } from "@rian8337/osu-base";
import { DifficultyHitObject } from "../../preprocessing/DifficultyHitObject";
import { FlashlightEvaluator } from "../base/FlashlightEvaluator";

/**
 * An evaluator for calculating osu!standard Flashlight skill.
 */
export abstract class OsuFlashlightEvaluator extends FlashlightEvaluator {
    /**
     * Evaluates the difficulty of memorizing and hitting the current object, based on:
     *
     * - distance between the previous and the current object,
     * - the visual opacity of the current object,
     * - and whether Hidden mod is enabled.
     *
     * @param current The current object.
     */
    static evaluateDifficultyOf(current: DifficultyHitObject): number {
        if (current.object instanceof Spinner) {
            return 0;
        }

        const scalingFactor: number = 52 / current.object.radius;

        let smallDistNerf: number = 1;

        let cumulativeStrainTime: number = 0;

        let result: number = 0;

        for (let i = 0; i < Math.min(current.index, 10); ++i) {
            const previous: DifficultyHitObject = current.previous(i)!;

            if (previous.object instanceof Spinner) {
                continue;
            }

            const jumpDistance: number =
                current.object.stackedPosition.subtract(
                    previous.object.endPosition
                ).length;

            cumulativeStrainTime += previous.strainTime;

            // We want to nerf objects that can be easily seen within the Flashlight circle radius.
            if (i === 0) {
                smallDistNerf = Math.min(1, jumpDistance / 75);
            }

            // We also want to nerf stacks so that only the first object of the stack is accounted for.
            const stackNerf: number = Math.min(
                1,
                previous.lazyJumpDistance / scalingFactor / 25
            );

            result +=
                (Math.pow(0.8, i) * stackNerf * scalingFactor * jumpDistance) /
                cumulativeStrainTime;
        }

        return Math.pow(smallDistNerf * result, 2);
    }
}
