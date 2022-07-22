import { Spinner, Slider } from "@rian8337/osu-base";
import { DifficultyHitObject } from "../../preprocessing/DifficultyHitObject";

/**
 * An evaluator for calculating osu!droid Visual skill.
 */
export abstract class DroidVisualEvaluator {
    /**
     * Evaluates the difficulty of reading the current object, based on:
     *
     * - note density of the current object,
     * - overlapping factor of the current object,
     * - the preempt time of the current object,
     * - the velocity of the current object if it's a slider,
     * - past objects' velocity if they are sliders,
     * - and whether the Hidden mod is enabled.
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

        // Start with base density and give global bonus for Hidden.
        // Add density caps for sanity.
        let strain: number;

        if (isHiddenMod) {
            strain = Math.min(25, Math.pow(current.noteDensity, 2.25));
        } else {
            strain = Math.min(20, Math.pow(current.noteDensity, 2));
        }

        // Bonus based on how visible the object is.
        for (let i = 0; i < Math.min(current.index, 10); ++i) {
            const previous: DifficultyHitObject = current.previous(i)!;

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
                current.baseTimePreempt
            ) {
                break;
            }

            strain +=
                (1 -
                    current.opacityAt(previous.object.startTime, isHiddenMod)) /
                4;
        }

        // Scale the value with overlapping factor.
        strain /= 10 * (1 + current.overlappingFactor);

        if (current.timePreempt < 400) {
            // Give bonus for AR higher than 10.33.
            strain += Math.pow(400 - current.timePreempt, 1.3) / 100;
        }

        if (current.object instanceof Slider) {
            const scalingFactor: number = 50 / current.object.radius;

            // Reward sliders based on velocity.
            strain +=
                // Avoid overbuffing extremely fast sliders.
                Math.min(6, current.velocity * 1.5) *
                // Scale with distance travelled to avoid overbuffing fast sliders with short distance.
                Math.min(1, current.travelDistance / scalingFactor / 125);

            let cumulativeStrainTime: number = 0;

            // Reward for velocity changes based on last few sliders.
            for (let i = 0; i < Math.min(current.index, 4); ++i) {
                const last: DifficultyHitObject = current.previous(i)!;

                cumulativeStrainTime += last.strainTime;

                if (
                    !(last.object instanceof Slider) ||
                    // Exclude overlapping objects that can be tapped at once.
                    last.isOverlapping(true)
                ) {
                    continue;
                }

                strain +=
                    // Avoid overbuffing extremely fast velocity changes.
                    Math.min(
                        10,
                        2.5 * Math.abs(current.velocity - last.velocity)
                    ) *
                    // Scale with distance travelled to avoid overbuffing fast sliders with short distance.
                    Math.min(1, last.travelDistance / scalingFactor / 100) *
                    // Scale with cumulative strain time to avoid overbuffing past sliders.
                    Math.min(1, 300 / cumulativeStrainTime);
            }
        }

        return strain;
    }
}
