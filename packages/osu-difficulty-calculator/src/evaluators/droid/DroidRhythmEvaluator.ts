import { Spinner, Slider, MathUtils } from "@rian8337/osu-base";
import { DroidDifficultyHitObject } from "../../preprocessing/DroidDifficultyHitObject";
import { Island } from "../base/Island";

/**
 * An evaluator for calculating osu!droid Rhythm skill.
 */
export abstract class DroidRhythmEvaluator {
    private static readonly historyTimeMax = 5000; // 5 seconds of calculateRhythmBonus max.
    private static readonly historyObjectsMax = 32;
    private static readonly rhythmOverallMultiplier = 0.95;
    private static readonly rhythmRatioMultiplier = 15;

    /**
     * Calculates a rhythm multiplier for the difficulty of the tap associated
     * with historic data of the current object.
     *
     * @param current The current object.
     * @param useSliderAccuracy Whether to use slider accuracy.
     */
    static evaluateDifficultyOf(
        current: DroidDifficultyHitObject,
        useSliderAccuracy: boolean,
    ): number {
        if (current.object instanceof Spinner) {
            return 1;
        }

        const deltaDifferenceEpsilon = current.fullGreatWindow * 0.3;
        let rhythmComplexitySum = 0;

        let island = new Island(deltaDifferenceEpsilon);
        let previousIsland = new Island(deltaDifferenceEpsilon);
        const islandCounts = new Map<Island, number>();

        // Store the ratio of the current start of an island to buff for tighter rhythms.
        let startRatio = 0;
        let firstDeltaSwitch = false;
        let rhythmStart = 0;

        const historicalNoteCount = Math.min(
            current.index,
            this.historyObjectsMax,
        );

        // Exclude overlapping objects that can be tapped at once.
        const validPrevious: DroidDifficultyHitObject[] = [];

        for (let i = 0; i < historicalNoteCount; ++i) {
            const object = current.previous(i);

            if (!object) {
                break;
            }

            if (!object.isOverlapping(false)) {
                validPrevious.push(object);
            }
        }

        while (
            rhythmStart < validPrevious.length - 2 &&
            current.startTime - validPrevious[rhythmStart].startTime <
                this.historyTimeMax
        ) {
            ++rhythmStart;
        }

        let prevObject = validPrevious[rhythmStart];
        let lastObject = validPrevious[rhythmStart + 1];

        for (let i = rhythmStart; i > 0; --i) {
            const currentObject = validPrevious[i - 1];

            // Scale note 0 to 1 from history to now.
            const timeDecay =
                (this.historyTimeMax -
                    (current.startTime - currentObject.startTime)) /
                this.historyTimeMax;
            const noteDecay = (validPrevious.length - i) / validPrevious.length;

            // Either we're limited by time or limited by object count.
            const currentHistoricalDecay = Math.min(timeDecay, noteDecay);

            // Use custom cap value to ensure that that at this point delta time is actually zero.
            const currentDelta = Math.max(currentObject.deltaTime, 1e-7);
            const prevDelta = Math.max(prevObject.deltaTime, 1e-7);
            const lastDelta = Math.max(lastObject.deltaTime, 1e-7);

            // Calculate how much current delta difference deserves a rhythm bonus.
            // This function is meant to reduce rhythm bonus for deltas that are multiples of each other (i.e. 100 and 200).
            const deltaDifference =
                Math.max(prevDelta, currentDelta) /
                Math.min(prevDelta, currentDelta);

            // Take only the fractional part of the value since we are only interested in punishing multiples.
            const deltaDifferenceFraction =
                deltaDifference - Math.trunc(deltaDifference);

            const currentRatio =
                1 +
                this.rhythmRatioMultiplier *
                    Math.min(
                        0.5,
                        MathUtils.smoothstepBellCurve(deltaDifferenceFraction),
                    );

            // Reduce ratio bonus if delta difference is too big
            const differenceMultiplier = MathUtils.clamp(
                2 - deltaDifference / 8,
                0,
                1,
            );

            const windowPenalty = Math.min(
                1,
                Math.max(
                    0,
                    Math.abs(prevDelta - currentDelta) - deltaDifferenceEpsilon,
                ) / deltaDifferenceEpsilon,
            );

            let effectiveRatio =
                windowPenalty * currentRatio * differenceMultiplier;

            if (firstDeltaSwitch) {
                if (
                    Math.abs(prevDelta - currentDelta) < deltaDifferenceEpsilon
                ) {
                    // Island is still progressing, count size.
                    island.addDelta(currentDelta);
                } else {
                    if (!useSliderAccuracy) {
                        // BPM change is into slider, this is easy acc window.
                        if (currentObject.object instanceof Slider) {
                            effectiveRatio /= 8;
                        }

                        // BPM change was from a slider, this is easier typically than circle -> circle.
                        // Unintentional side effect is that bursts with kicksliders at the ends might have lower difficulty
                        // than bursts without sliders.
                        if (prevObject.object instanceof Slider) {
                            effectiveRatio *= 0.3;
                        }
                    }

                    // Repeated island polarity (2 -> 4, 3 -> 5).
                    if (island.isSimilarPolarity(previousIsland)) {
                        effectiveRatio /= 2;
                    }

                    // Previous increase happened a note ago.
                    // Albeit this is a 1/1 -> 1/2-1/4 type of transition, we don't want to buff this.
                    if (
                        lastDelta > prevDelta + deltaDifferenceEpsilon &&
                        prevDelta > currentDelta + deltaDifferenceEpsilon
                    ) {
                        effectiveRatio /= 8;
                    }

                    // Repeated island size (ex: triplet -> triplet).
                    // TODO: remove this nerf since its staying here only for balancing purposes because of the flawed ratio calculation
                    if (previousIsland.deltaCount == island.deltaCount) {
                        effectiveRatio /= 2;
                    }

                    let islandFound = false;

                    for (const [currentIsland, count] of islandCounts) {
                        if (!island.equals(currentIsland)) {
                            continue;
                        }

                        islandFound = true;
                        let islandCount = count;

                        if (previousIsland.equals(island)) {
                            // Only add island to island counts if they're going one after another.
                            ++islandCount;
                            islandCounts.set(currentIsland, islandCount);
                        }

                        // Repeated island (ex: triplet -> triplet).
                        // Graph: https://www.desmos.com/calculator/pj7an56zwf
                        effectiveRatio *= Math.min(
                            3 / islandCount,
                            Math.pow(
                                1 / islandCount,
                                MathUtils.offsetLogistic(
                                    island.delta,
                                    58.33,
                                    0.24,
                                    2.75,
                                ),
                            ),
                        );

                        break;
                    }

                    if (!islandFound) {
                        islandCounts.set(island, 1);
                    }

                    // Scale down the difficulty if the object is doubletappable.
                    effectiveRatio *=
                        1 -
                        prevObject.getDoubletapness(prevObject.next(0)) * 0.75;

                    rhythmComplexitySum +=
                        Math.sqrt(effectiveRatio * startRatio) *
                        currentHistoricalDecay;

                    startRatio = effectiveRatio;
                    previousIsland = island;

                    if (prevDelta + deltaDifferenceEpsilon < currentDelta) {
                        // We're slowing down, stop counting.
                        // If we're speeding up, this stays as is and we keep counting island size.
                        firstDeltaSwitch = false;
                    }

                    island = new Island(currentDelta, deltaDifferenceEpsilon);
                }
            } else if (prevDelta > currentDelta + deltaDifferenceEpsilon) {
                // We are speeding up.
                // Begin counting island until we change speed again.
                firstDeltaSwitch = true;

                // BPM change is into slider, this is easy acc window.
                if (currentObject.object instanceof Slider) {
                    effectiveRatio *= 0.6;
                }

                // BPM change was from a slider, this is easier typically than circle -> circle
                // Unintentional side effect is that bursts with kicksliders at the ends might have lower difficulty
                // than bursts without sliders
                if (prevObject.object instanceof Slider) {
                    effectiveRatio *= 0.6;
                }

                startRatio = effectiveRatio;

                island = new Island(currentDelta, deltaDifferenceEpsilon);
            }

            lastObject = prevObject;
            prevObject = currentObject;
        }

        return (
            Math.sqrt(4 + rhythmComplexitySum * this.rhythmOverallMultiplier) /
            2
        );
    }
}
