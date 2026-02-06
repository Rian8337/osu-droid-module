import { Spinner, Slider, MathUtils } from "@rian8337/osu-base";
import { OsuDifficultyHitObject } from "../../preprocessing/OsuDifficultyHitObject";
import { Island } from "../base/Island";

/**
 * An evaluator for calculating osu!standard Rhythm skill.
 */
export abstract class OsuRhythmEvaluator {
    private static readonly historyTimeMax = 5000; // 5 seconds of calculateRhythmBonus max.
    private static readonly historyObjectsMax = 32;
    private static readonly rhythmOverallMultiplier = 0.9;
    private static readonly rhythmRatioMultiplier = 30;

    /**
     * Calculates a rhythm multiplier for the difficulty of the tap associated
     * with historic data of the current object.
     *
     * @param current The current object.
     */
    static evaluateDifficultyOf(current: OsuDifficultyHitObject): number {
        if (current.object instanceof Spinner) {
            return 0;
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

        while (
            rhythmStart < historicalNoteCount - 2 &&
            current.startTime - current.previous(rhythmStart)!.startTime <
                this.historyTimeMax
        ) {
            ++rhythmStart;
        }

        let prevObject = current.previous(rhythmStart)!;
        let lastObject = current.previous(rhythmStart + 1)!;

        for (let i = rhythmStart; i > 0; --i) {
            const currentObject = current.previous(i - 1)!;

            if (currentObject.object instanceof Spinner) {
                continue;
            }

            // Scale note 0 to 1 from history to now.
            const timeDecay =
                (this.historyTimeMax -
                    (current.startTime - currentObject.startTime)) /
                this.historyTimeMax;
            const noteDecay = (historicalNoteCount - i) / historicalNoteCount;

            // Either we're limited by time or limited by object count.
            const currentHistoricalDecay = Math.min(timeDecay, noteDecay);

            // Use custom cap value to ensure that at this point delta time is actually zero.
            const currentDelta = Math.max(currentObject.deltaTime, 1e-7);
            const prevDelta = Math.max(prevObject.deltaTime, 1e-7);
            const lastDelta = Math.max(lastObject.deltaTime, 1e-7);

            // Calculate how much current delta difference deserves a rhythm bonus
            // This function is meant to reduce rhythm bonus for deltas that are multiples of each other (i.e. 100 and 200)
            const deltaDifference =
                Math.max(prevDelta, currentDelta) /
                Math.min(prevDelta, currentDelta);

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
                windowPenalty *
                this.getEffectiveRatio(deltaDifference) *
                differenceMultiplier;

            // If the previous object is a slider, it might be easier to tap since you do not have to do a whole tapping motion.
            // While a full deltatime might end up some weird ratio, the "unpress->tap" motion might be simple.
            // For example, a slider-circle-circle pattern should be evaluated as a regular triple and not as a single->double.
            if (prevObject.object instanceof Slider) {
                const sliderLazyEndDelta = currentObject.minimumJumpTime;
                const sliderLazyEndDeltaDifference =
                    Math.max(sliderLazyEndDelta, currentDelta) /
                    Math.min(sliderLazyEndDelta, currentDelta);

                const sliderRealEndDelta = currentObject.lastObjectEndDeltaTime;
                const sliderRealEndDeltaDifference =
                    Math.max(sliderRealEndDelta, currentDelta) /
                    Math.min(sliderRealEndDelta, currentDelta);

                const sliderEffectiveRatio = Math.min(
                    this.getEffectiveRatio(sliderLazyEndDeltaDifference),
                    this.getEffectiveRatio(sliderRealEndDeltaDifference),
                );

                effectiveRatio = Math.min(sliderEffectiveRatio, effectiveRatio);
            }

            if (firstDeltaSwitch) {
                if (
                    Math.abs(prevDelta - currentDelta) < deltaDifferenceEpsilon
                ) {
                    // Island is still progressing, count size.
                    island.addDelta(currentDelta);
                } else {
                    // BPM change is into slider, this is easy acc window.
                    if (currentObject.object instanceof Slider) {
                        effectiveRatio /= 2;
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
                        1 - prevObject.getDoubletapness(currentObject) * 0.75;

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

    private static getEffectiveRatio(deltaDifference: number): number {
        // Take only the fractional part of the value since we are only interested in punishing multiples.
        const deltaDifferenceFraction =
            deltaDifference - Math.trunc(deltaDifference);

        return (
            1 +
            this.rhythmRatioMultiplier *
                Math.min(
                    0.5,
                    MathUtils.smoothstepBellCurve(deltaDifferenceFraction),
                )
        );
    }
}
