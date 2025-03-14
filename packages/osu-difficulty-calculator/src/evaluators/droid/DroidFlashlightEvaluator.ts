import { Mod, ModHidden, Modes, Slider, Spinner } from "@rian8337/osu-base";
import { DroidDifficultyHitObject } from "../../preprocessing/DroidDifficultyHitObject";

/**
 * An evaluator for calculating osu!droid Flashlight skill.
 */
export abstract class DroidFlashlightEvaluator {
    private static readonly maxOpacityBonus = 0.4;
    private static readonly hiddenBonus = 0.2;
    private static readonly minVelocity = 0.5;
    private static readonly sliderMultiplier = 1.3;
    private static readonly minAngleMultiplier = 0.2;

    /**
     * Evaluates the difficulty of memorizing and hitting the current object, based on:
     *
     * - distance between a number of previous objects and the current object,
     * - the visual opacity of the current object,
     * - the angle made by the current object,
     * - length and speed of the current object (for sliders),
     * - and whether Hidden mod is enabled.
     *
     * @param current The current object.
     * @param mods The mods used.
     * @param withSliders Whether to take slider difficulty into account.
     */
    static evaluateDifficultyOf(
        current: DroidDifficultyHitObject,
        mods: Mod[],
        withSliders: boolean,
    ): number {
        if (
            current.object instanceof Spinner ||
            // Exclude overlapping objects that can be tapped at once.
            current.isOverlapping(true)
        ) {
            return 0;
        }

        const scalingFactor = 52 / current.object.radius;
        let smallDistNerf = 1;
        let cumulativeStrainTime = 0;
        let result = 0;
        let last = current;
        let angleRepeatCount = 0;

        for (let i = 0; i < Math.min(current.index, 10); ++i) {
            const currentObject = current.previous(i)!;

            cumulativeStrainTime += last.strainTime;

            if (
                !(currentObject.object instanceof Spinner) &&
                // Exclude overlapping objects that can be tapped at once.
                !currentObject.isOverlapping(false)
            ) {
                const jumpDistance = current.object
                    .getStackedPosition(Modes.droid)
                    .subtract(
                        currentObject.object.getStackedEndPosition(Modes.droid),
                    ).length;

                // We want to nerf objects that can be easily seen within the Flashlight circle radius.
                if (i === 0) {
                    smallDistNerf = Math.min(1, jumpDistance / 75);
                }

                // We also want to nerf stacks so that only the first object of the stack is accounted for.
                const stackNerf = Math.min(
                    1,
                    currentObject.lazyJumpDistance / scalingFactor / 25,
                );

                // Bonus based on how visible the object is.
                const opacityBonus =
                    1 +
                    this.maxOpacityBonus *
                        (1 -
                            current.opacityAt(
                                currentObject.object.startTime,
                                mods,
                            ));

                result +=
                    (stackNerf * opacityBonus * scalingFactor * jumpDistance) /
                    cumulativeStrainTime;

                if (currentObject.angle !== null && current.angle !== null) {
                    // Objects further back in time should count less for the nerf.
                    if (Math.abs(currentObject.angle - current.angle) < 0.02) {
                        angleRepeatCount += Math.max(0, 1 - 0.1 * i);
                    }
                }
            }

            last = currentObject;
        }

        result = Math.pow(smallDistNerf * result, 2);

        // Additional bonus for Hidden due to there being no approach circles.
        if (mods.some((m) => m instanceof ModHidden)) {
            result *= 1 + this.hiddenBonus;
        }

        // Nerf patterns with repeated angles.
        result *=
            this.minAngleMultiplier +
            (1 - this.minAngleMultiplier) / (angleRepeatCount + 1);

        let sliderBonus = 0;

        if (current.object instanceof Slider && withSliders) {
            // Invert the scaling factor to determine the true travel distance independent of circle size.
            const pixelTravelDistance =
                current.object.lazyTravelDistance / scalingFactor;

            // Reward sliders based on velocity.
            sliderBonus = Math.pow(
                Math.max(
                    0,
                    pixelTravelDistance / current.travelTime - this.minVelocity,
                ),
                0.5,
            );

            // Longer sliders require more memorization.
            sliderBonus *= pixelTravelDistance;

            // Nerf sliders with repeats, as less memorization is required.
            if (current.object.repeatCount > 0)
                sliderBonus /= current.object.repeatCount + 1;
        }

        result += sliderBonus * this.sliderMultiplier;

        return result;
    }
}
