import { Spinner, Slider } from "@rian8337/osu-base";
import { DifficultyHitObject } from "../../preprocessing/DifficultyHitObject";

/**
 * An evaluator for calculating osu!droid Rhythm skill.
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
        const last: DifficultyHitObject | null = current.previous(0);

        if (
            current.object instanceof Spinner ||
            // Exclude overlapping objects that can be tapped at once.
            (current.deltaTime < 5 &&
                ((last?.object instanceof Slider
                    ? Math.min(
                          last.object.stackedEndPosition.getDistance(
                              current.object.stackedPosition
                          ),
                          last.object.lazyEndPosition!.getDistance(
                              current.object.stackedPosition
                          )
                      )
                    : last?.object.stackedEndPosition.getDistance(
                          current.object.stackedPosition
                      )) ?? Number.POSITIVE_INFINITY) <=
                    2 * current.object.radius)
        ) {
            return 0;
        }

        // Start with base density and give global bonus for Hidden.
        // Add density caps for sanity.
        let strain: number =
            Math.min(20, Math.pow(current.noteDensity, 2)) /
            10 /
            (1 + current.overlappingFactor);

        if (isHiddenMod) {
            strain +=
                Math.min(25, Math.pow(current.noteDensity, 1.25)) /
                10 /
                (1 + current.overlappingFactor / 1.25);
        }

        if (current.timePreempt < 400) {
            // Give bonus for AR higher than 10.33.
            strain += Math.pow(400 - current.timePreempt, 1.3) / 135;
        } else if (current.timePreempt < 525) {
            // Give bonus for AR between 9.5 and 10 to not make higher non-DT value less than NM.
            strain +=
                Math.pow(525 - Math.max(current.timePreempt, 450), 1.1) / 500;
        }

        if (current.object instanceof Slider) {
            const scalingFactor: number = 50 / current.object.radius;

            // Reward sliders based on velocity.
            strain +=
                // Avoid overbuffing extremely fast sliders.
                Math.min(5, current.velocity * 1.25) *
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
                    (last.deltaTime < 5 &&
                        Math.min(
                            last.object.stackedEndPosition.getDistance(
                                current.object.stackedPosition
                            ),
                            last.object.lazyEndPosition!.getDistance(
                                current.object.stackedPosition
                            )
                        ) <=
                            2 * current.object.radius)
                ) {
                    continue;
                }

                strain +=
                    // Avoid overbuffing extremely fast velocity changes.
                    Math.min(
                        8,
                        2 * Math.abs(current.velocity - last.velocity)
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
