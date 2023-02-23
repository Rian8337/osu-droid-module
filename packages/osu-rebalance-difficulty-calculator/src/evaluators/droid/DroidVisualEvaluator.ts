import { Spinner, Slider, Modes, MathUtils } from "@rian8337/osu-base";
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
        current: DifficultyHitObject,
        isHiddenMod: boolean,
        withSliders: boolean
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
            strain = Math.min(30, Math.pow(current.noteDensity, 3));
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
                    current.opacityAt(
                        previous.object.startTime,
                        isHiddenMod,
                        Modes.droid
                    )) /
                4;
        }

        // Scale the value with overlapping factor.
        strain /= 10 * (1 + current.overlappingFactor);

        if (current.timePreempt < 400) {
            // Give bonus for AR higher than 10.33.
            strain += Math.pow(400 - current.timePreempt, 1.3) / 100;
        }

        if (current.object instanceof Slider && withSliders) {
            const scalingFactor: number =
                50 / current.object.getRadius(Modes.droid);

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

        // Reward for rhythm changes.
        if (current.rhythmMultiplier > 1) {
            let rhythmBonus: number = (current.rhythmMultiplier - 1) / 20;

            // Rhythm changes are harder to read in Hidden.
            // Add additional bonus for Hidden.
            if (isHiddenMod) {
                rhythmBonus += (current.rhythmMultiplier - 1) / 25;
            }

            // Rhythm changes are harder to read when objects are stacked together.
            // Scale rhythm bonus based on the stack of past objects.
            const diameter: number = 2 * current.object.getRadius(Modes.droid);
            let cumulativeStrainTime: number = 0;

            for (let i = 0; i < Math.min(current.index, 5); ++i) {
                const previous: DifficultyHitObject = current.previous(i)!;

                if (
                    previous.object instanceof Spinner ||
                    // Exclude overlapping objects that can be tapped at once.
                    previous.isOverlapping(true)
                ) {
                    continue;
                }

                const jumpDistance: number = current.object
                    .getStackedPosition(Modes.droid)
                    .getDistance(
                        previous.object.getStackedEndPosition(Modes.droid)
                    );

                cumulativeStrainTime += previous.strainTime;

                rhythmBonus +=
                    // Scale the bonus with diameter.
                    MathUtils.clamp(
                        (0.5 - jumpDistance / diameter) / 10,
                        0,
                        0.05
                    ) *
                    // Scale with cumulative strain time to avoid overbuffing past objects.
                    Math.min(1, 300 / cumulativeStrainTime);

                // Give a larger bonus for Hidden.
                if (isHiddenMod) {
                    rhythmBonus +=
                        (1 -
                            current.opacityAt(
                                previous.object.startTime,
                                isHiddenMod,
                                Modes.droid
                            )) /
                        20;
                }
            }

            strain += rhythmBonus;
        }

        return strain;
    }
}
