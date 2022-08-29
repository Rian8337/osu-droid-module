import { Slider, Spinner } from "@rian8337/osu-base";
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
     * @param isHiddenMod Whether the Hidden mod is enabled.
     */
    static evaluateDifficultyOf(
        current: DifficultyHitObject,
        isHiddenMod: boolean
    ): number {
        if (current.object instanceof Spinner) {
            return 0;
        }

        const scalingFactor: number = 52 / current.object.radius;

        let smallDistNerf: number = 1;

        let cumulativeStrainTime: number = 0;

        let result: number = 0;

        let last: DifficultyHitObject = current;

        for (let i = 0; i < Math.min(current.index, 10); ++i) {
            const currentObject: DifficultyHitObject = current.previous(i)!;

            if (!(currentObject.object instanceof Spinner)) {
                const jumpDistance: number =
                    current.object.stackedPosition.subtract(
                        currentObject.object.endPosition
                    ).length;

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

        result = Math.pow(smallDistNerf * result, 2);

        // Additional bonus for Hidden due to there being no approach circles.
        if (isHiddenMod) {
            result *= 1 + this.hiddenBonus;
        }

        let sliderBonus: number = 0;

        if (current.object instanceof Slider) {
            // Invert the scaling factor to determine the true travel distance independent of circle size.
            const pixelTravelDistance: number =
                current.object.lazyTravelDistance / scalingFactor;

            // Reward sliders based on velocity.
            sliderBonus = Math.pow(
                Math.max(
                    0,
                    pixelTravelDistance / current.travelTime - this.minVelocity
                ),
                0.5
            );

            // Longer sliders require more memorization.
            sliderBonus *= pixelTravelDistance;

            // Nerf sliders with repeats, as less memorization is required.
            if (current.object.repeats > 0)
                sliderBonus /= current.object.repeats + 1;
        }

        result += sliderBonus * this.sliderMultiplier;

        return result;
    }
}
