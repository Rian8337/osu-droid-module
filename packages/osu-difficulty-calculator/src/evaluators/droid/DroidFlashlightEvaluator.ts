import { modes, Spinner } from "@rian8337/osu-base";
import { DifficultyHitObject } from "../../preprocessing/DifficultyHitObject";
import { FlashlightEvaluator } from "../base/FlashlightEvaluator";

/**
 * An evaluator for calculating osu!droid Flashlight skill.
 */
export abstract class DroidFlashlightEvaluator extends FlashlightEvaluator {
    /**
     * Evaluates the difficulty of memorizing and hitting the current object, based on:
     *
     * - distance between the previous and the current object,
     * - the visual opacity of the current object,
     * - and whether Hidden mod is enabled.
     *
     * @param current The current object.
     * @param isHiddenMod Whether the Hidden mod is enabled.
     */
    static evaluateDifficultyOf(
        current: DifficultyHitObject,
        isHiddenMod: boolean
    ): number {
        if (
            current.object instanceof Spinner ||
            // Exclude overlapping objects that can be tapped at once.
            current.isOverlapping(true)
        ) {
            return 0;
        }

        const scalingFactor: number =
            52 / current.object.getRadius(modes.droid);

        let smallDistNerf: number = 1;

        let cumulativeStrainTime: number = 0;

        let result: number = 0;

        let last: DifficultyHitObject = current;

        for (let i = 0; i < Math.min(current.index, 10); ++i) {
            const currentObject: DifficultyHitObject = current.previous(i)!;

            if (
                !(currentObject.object instanceof Spinner) &&
                // Exclude overlapping objects that can be tapped at once.
                !currentObject.isOverlapping(false)
            ) {
                const jumpDistance: number = current.object
                    .getStackedPosition(modes.droid)
                    .subtract(currentObject.object.endPosition).length;

                cumulativeStrainTime += last.strainTime;

                // We want to nerf objects that can be easily seen within the Flashlight circle radius.
                if (i === 0) {
                    smallDistNerf = Math.min(1, jumpDistance / 75);
                }

                // We also want to nerf stacks so that only the first object of the stack is accounted for.
                const stackNerf: number = Math.min(
                    1,
                    currentObject.lazyJumpDistance / scalingFactor / 25
                );

                // Bonus based on how visible the object is.
                const opacityBonus: number =
                    1 +
                    this.maxOpacityBonus *
                        (1 -
                            current.opacityAt(
                                currentObject.object.startTime,
                                isHiddenMod
                            ));

                result +=
                    (stackNerf * opacityBonus * scalingFactor * jumpDistance) /
                    cumulativeStrainTime;
            }

            last = currentObject;
        }

        // Additional bonus for Hidden due to there being no approach circles.
        if (isHiddenMod) {
            result *= 1 + this.hiddenBonus;
        }

        return Math.pow(smallDistNerf * result, 2);
    }
}
