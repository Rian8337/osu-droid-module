import { Spinner, Slider } from "@rian8337/osu-base";
import { DroidDifficultyHitObject } from "../../preprocessing/DroidDifficultyHitObject";

/**
 * An evaluator for calculating osu!droid visual skill.
 */
export abstract class DroidVisualEvaluator {
    /**
     * Evaluates the difficulty of reading the current object, based on:
     *
     * - note density of the current object,
     * - overlapping factor of the current object,
     * - the preempt time of the current object,
     * - the visual opacity of the current object,
     * - the velocity of the current object if it's a slider,
     * - past objects' velocity if they are sliders,
     * - and whether the Hidden mod is enabled.
     *
     * @param current The current object.
     * @param isHiddenMod Whether the Hidden mod is enabled.
     * @param withSliders Whether to take slider difficulty into account.
     */
    static evaluateDifficultyOf(
        current: DroidDifficultyHitObject,
        isHiddenMod: boolean,
        withSliders: boolean,
    ): number {
        if (
            current.object instanceof Spinner ||
            // Exclude overlapping objects that can be tapped at once.
            current.isOverlapping(true) ||
            current.index === 0
        ) {
            return 0;
        }

        // Start with base density and give global bonus for Hidden.
        // Add density caps for sanity.
        let strain: number;

        if (isHiddenMod) {
            strain = Math.min(30, Math.pow(current.noteDensity, 3));
        } else {
            strain = Math.min(20, Math.pow(current.noteDensity, 2));
        }

        // Bonus based on how visible the object is.
        for (let i = 0; i < Math.min(current.index, 10); ++i) {
            const previous = current.previous(i)!;

            if (
                previous.object instanceof Spinner ||
                // Exclude overlapping objects that can be tapped at once.
                previous.isOverlapping(true)
            ) {
                continue;
            }

            // Do not consider objects that don't fall under time preempt.
            if (
                current.object.startTime - previous.object.endTime >
                current.object.timePreempt
            ) {
                break;
            }

            strain +=
                (1 -
                    current.opacityAt(previous.object.startTime, isHiddenMod)) /
                4;
        }

        if (current.timePreempt < 400) {
            // Give bonus for AR higher than 10.33.
            strain += Math.pow(400 - current.timePreempt, 1.35) / 100;
        }

        // Scale the value with overlapping factor.
        strain /= 10 * (1 + current.overlappingFactor);

        if (current.object instanceof Slider && withSliders) {
            const scalingFactor = 50 / current.object.radius;

            // Invert the scaling factor to determine the true travel distance independent of circle size.
            const pixelTravelDistance =
                current.object.lazyTravelDistance / scalingFactor;
            const currentVelocity = pixelTravelDistance / current.travelTime;

            strain +=
                // Reward sliders based on velocity, while also avoiding overbuffing extremely fast sliders.
                Math.min(6, currentVelocity * 1.5) *
                // Longer sliders require more reading.
                (pixelTravelDistance / 100);

            let cumulativeStrainTime = 0;

            // Reward for velocity changes based on last few sliders.
            for (let i = 0; i < Math.min(current.index, 4); ++i) {
                const last = current.previous(i)!;

                cumulativeStrainTime += last.strainTime;

                if (
                    !(last.object instanceof Slider) ||
                    // Exclude overlapping objects that can be tapped at once.
                    last.isOverlapping(true)
                ) {
                    continue;
                }

                // Invert the scaling factor to determine the true travel distance independent of circle size.
                const pixelTravelDistance =
                    last.object.lazyTravelDistance / scalingFactor;
                const lastVelocity = pixelTravelDistance / last.travelTime;

                strain +=
                    // Reward past sliders based on velocity changes, while also
                    // avoiding overbuffing extremely fast velocity changes.
                    Math.min(
                        10,
                        2.5 * Math.abs(currentVelocity - lastVelocity),
                    ) *
                    // Longer sliders require more reading.
                    (pixelTravelDistance / 125) *
                    // Avoid overbuffing past sliders.
                    Math.min(1, 300 / cumulativeStrainTime);
            }
        }

        return strain;
    }
}
